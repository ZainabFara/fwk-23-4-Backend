const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

const hf = new HfInference(HUGGING_FACE_API_KEY);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  const inputPrompt = messages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  try {
    const generatedChunks = [];

    for await (const chunk of hf.chatCompletionStream({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [{ role: "user", content: inputPrompt }],
      max_tokens: 500,
    })) {
      const content = chunk.choices[0]?.delta?.content || "";
      generatedChunks.push(content);
    }

    const generatedText = generatedChunks.join("");
    res.json({ response: generatedText });
  } catch (error) {
    console.error("Error communicating with Hugging Face:", error.message);
    res.status(500).json({
      error: "Error communicating with Hugging Face",
      details: error.message,
    });
  }
});

module.exports = app;
