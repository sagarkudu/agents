import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL || "https://api.openai.com/v1",
});

const defaultPrompt = "Give me a short explanation of why open-source tools matter.";

export async function runChatCompletionsDemo(prompt = defaultPrompt) {
  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt || defaultPrompt },
    ],
  });

  return response.choices[0]?.message?.content || "";
}
