const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const cors = require("cors");
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

// Route for att hämta data

app.get("/request-data", (req, res) => {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.text("Your super personal data!!!");
    doc.end();
});

// Route for att chatta

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

app.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: "Required fields are empty!" });
    }

    try {
        const response = await fetch(
            "http://localhost:3002/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        res.status(500).json({
            error: "Error registering user",
            details: error.message,
        });
    }
});

module.exports = app;
