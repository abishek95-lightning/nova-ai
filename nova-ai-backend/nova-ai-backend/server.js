import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. Add it to .env before starting Nova AI.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const DEFAULT_SYSTEM_PROMPT =
  "You are Nova AI, a warm, witty general-purpose assistant. " +
  "Answer the user's actual question directly and naturally. " +
  "Remember earlier messages and use context for follow-ups. " +
  "Be concise unless detail is useful. Match the user's mood with empathy. " +
  "Use light, harmless sarcasm occasionally, never when it would be insensitive. " +
  "Do not pretend to be human; if asked hypothetical questions about being human, " +
  "answer playfully while making it clear you are an AI.";

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Nova AI backend",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, system } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "OPENAI_API_KEY is not configured on the server."
      });
    }

    const safeMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .slice(-30)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 12000)
      }));

    if (!safeMessages.length) {
      return res.status(400).json({ error: "No valid messages supplied" });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions:
        typeof system === "string" && system.trim()
          ? system.trim().slice(0, 12000)
          : DEFAULT_SYSTEM_PROMPT,
      input: safeMessages,
      max_output_tokens: 1200
    });

    return res.json({
      reply: response.output_text || "I couldn't generate a response this time."
    });
  } catch (error) {
    console.error("AI request failed:", error);

    return res.status(500).json({
      error: "The AI request failed.",
      detail:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message || "Unknown server error"
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Nova AI server running at http://localhost:${port}`);
});
