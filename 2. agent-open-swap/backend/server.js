import "dotenv/config";
import express from "express";
import cors from "cors";
import { runChatCompletionsDemo } from "./chat-completions.js";
import { runResponsesDemo } from "./responses.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "agents-ai-backend",
    model: process.env.AI_MODEL || "not configured",
  });
});

app.post("/api/chat-completions", async (req, res) => {
  try {
    const prompt = req.body?.prompt;
    const result = await runChatCompletionsDemo(prompt);
    res.json({ status: "ok", result });
  } catch (error) {
    console.error("Chat Completions error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/responses", async (req, res) => {
  try {
    const prompt = req.body?.prompt;
    const result = await runResponsesDemo(prompt);
    res.json({ status: "ok", result });
  } catch (error) {
    console.error("Responses API error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
