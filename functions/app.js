const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require('pdfkit');
const cors = require("cors");
const app = express();
const { HfInference } = require("@huggingface/inference");

app.use(express.json());
app.use(cors());

const HUGGING_FACE_API_KEY = "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";
const hf = new HfInference(HUGGING_FACE_API_KEY);

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/request-data", (req, res) => {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.text("Your super personal data!!!");
    doc.end();
}); 

app.post("/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: "Messages are required" });
    }

    const lastUserInput = messages[messages.length - 1].content;

    const inputPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    try {
        const response = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            inputs: inputPrompt,
            parameters: { max_length: 150 }, 
        });

        const generatedText = response.generated_text || "No response generated";

        res.json({ response: generatedText });
    } catch (error) {
        console.error("Error communicating with Hugging Face:", error.message);
        if (error.response) {
            console.error("Error details:", error.response.data);
        } else {
            console.error("Error without response data:", error);
        }
        res.status(500).json({
            error: "Error communicating with Hugging Face",
            details: error.message,
        });
    }
});


module.exports = app;
