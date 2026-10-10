import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use(express.json());

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
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

const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the get_open_source_news tool before recommending software in case recent news would change your answer.`;

const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description:
      "Retrieve recent news about open-source software. Use this before recommending software, in case recent news would change your answer.",
  },
];

const userPrompt =
  "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function getOpenSourceNews() {
  const rawNews = await readFile(
    new URL("./news.json", import.meta.url),
    "utf8",
  );
  return JSON.parse(rawNews);
}

async function runAgent() {
  // Keep a running input context array so later turns can see earlier output.
  const inputContext = [{ role: "user", content: userPrompt }];
  const maxTurns = 5;

  let turnCount = 0;

  while (turnCount < maxTurns) {
    turnCount++;
    console.log(`Turn ${turnCount}`);

      const turnResponse = await openai.responses.create({
        model: process.env.AI_MODEL,
        instructions: systemPrompt,
        input: inputContext,
        tools,
      });

      // Push the original function_call into inputContext.
      inputContext.push(...turnResponse.output);

    const latestOutputItem = turnResponse.output.at(-1);

    if (latestOutputItem?.type === "message") {
      console.log(
        "\n" +
          (turnResponse.output_text ||
            "Something went wrong. Please try again."),
      );
      return;
    }

    if (latestOutputItem?.type === "function_call") {
      console.log("Tool call requested:", latestOutputItem.name);
      console.log("Call ID:", latestOutputItem.call_id);

      if (latestOutputItem.name === "get_open_source_news") {
        /**
         * Challenge: Feed Tool Results Back to the Model
         *
         * The model has requested a tool and our app can run it.
         * But the next model turn still needs the request and its result.
         *
         * Your task:
         *
         * 1. Push the original function_call into inputContext.
         * 2. Push a function_call_output object into inputContext with:
         *    - type: "function_call_output"
         *    - call_id: the same call_id from latestOutputItem
         *    - output: the result as a JSON string with JSON.stringify
         *
         * Check the hints folder for more guidance!
         */

        // Run the tool locally
        const openSourceNews = await getOpenSourceNews();
        console.log(
          "get_open_source_news executed: Got",
          openSourceNews.length,
          "items",
        );

        // Push a function_call_output object into inputContext
        inputContext.push({
          type: "function_call_output",
          call_id: latestOutputItem.call_id,
          output: JSON.stringify(openSourceNews),
        });
      }

      continue;
    }

    console.log("Latest item type:", latestOutputItem?.type ?? "none");
  }

  console.log("\nMax turns reached before the model returned a final answer.");
}

// Run the agent when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    await runAgent();
    res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
