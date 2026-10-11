import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import { searchSwaps } from "./store/index.js";


const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use(express.json());

// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "agents-ai-backend",
    model: process.env.AI_MODEL || "not configured",
  });
});

const systemPrompt = `You are OpenSwap, an AI assistant that helps users find
open-source alternatives to popular software. Use the search_swaps tool to
search the local OpenSwap database when recommending alternatives. Base your
recommendations on the database results rather than memory.`;

const tools = [
  {
    type: "function",
    name: "search_swaps",
    description:
      "Search OpenSwap's database for open-source alternatives to a specified product.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Only the name of the product being replaced. Do not include any requirements or other words.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const userPrompt =
  "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function runAgent(userPrompt) {
  // Start the conversation with the user's request.
  const inputContext = [{ role: "user", content: userPrompt }];

  // Limit how many turns the agent can take to avoid infinite loops.
  const maxTurns = 5;
  let turnCount = 0;

  // Keep going until the agent finishes or runs out of turns.
  while (turnCount < maxTurns) {

    turnCount++;
    console.log(`Turn ${turnCount}`);

    // Send the inputContext to the model and get its response.
    const turnResponse = await client.responses.create({
      model: process.env.AI_MODEL,
      instructions: systemPrompt,
      input: inputContext,
      tools,
    });
    // Preserve the model's whole output turn for the next request.
    inputContext.push(...turnResponse.output);

    // Inspect the latest item to choose the next step.
    const latestItem = turnResponse.output.at(-1);

    // Return the final answer when the model is done.
    if (latestItem.type === "message") {
      return turnResponse.output_text;
    }

    // Handle a request to run a tool.
    if (latestItem.type === "function_call") {
      // Show which tool the model requested and what it sent.
      console.log("Tool call requested:", latestItem.name);
      console.log("Arguments:", latestItem.arguments);
      
      // Run the requested local tool.
      if (latestItem.name === "search_swaps") {
        // Parse the tool's JSON arguments.
        const toolInput = JSON.parse(latestItem.arguments);
        // Call the local searchSwaps function with the model's arguments.
        const result = await searchSwaps(toolInput);
        console.log("Database matches:", result.totalMatches);
        console.log("Matched swaps:", result.swaps.map((swap) => swap.name));

        // Send the tool result back to the model.
        inputContext.push({
          type: "function_call_output",
          call_id: latestItem.call_id,
          output: JSON.stringify(result),
        });
      }
    }      
  }

  // Fall back if the agent uses every turn.
  return "Something went wrong. Please try again.";
  /**
   * Super Challenge: Write the agent loop from scratch
   *
   * You've built every piece of this loop step by step over the last
   * lessons: the input context, the turn budget, the API call, the
   * message branch, parsing arguments, and the function_call_output.
   * This time, write the whole loop yourself, start to finish. Take
   * your time.
   *
   * Everything outside this function is ready: the system prompt, the
   * search_swaps tool, and the searchSwaps import from the store. You
   * only need to build the loop body.
   *
   * Your task:
   *
   * 1. Seed an input context array with the user prompt.
   * 2. Loop with a turn budget so the agent can never spin forever.
   * 3. Each turn, call the Responses API with systemPrompt, the input
   *    context, and tools.
   * 4. Read the latest output item.
   *    - If it's a message, return the final text (with a fallback).
   *    - If it's a function_call: preserve the model's full output turn
   *      in the context, parse the arguments, and when the tool is
   *      search_swaps, await searchSwaps(args) and push a
   *      function_call_output with the matching call_id.
   * 5. If the loop ever runs out of turns, return a fallback message.
   *
   * Check the hints folder for more guidance!
   */
}

// Run the agent when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    const agentResponse = await runAgent(userPrompt);
    console.log(agentResponse);
    res.json({ status: "ok", agentResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the AI request." });
  }
});

// Start the Express server so the frontend can talk to it
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
