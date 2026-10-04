import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL || "https://api.openai.com/v1",
});

const defaultPrompt = "Give me a short explanation of why open-source tools matter.";

export async function runResponsesDemo(prompt = defaultPrompt) {
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: "You are a helpful assistant.",
    input: [
      {
        role: "user",
        content: prompt || defaultPrompt,
      },
    ],
  });

  return {
    text: response.output_text,
    output: response.output,
  };
}
