const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
const { HfInference } = require("@huggingface/inference");

app.use(express.json());
app.use(cors());

const HUGGING_FACE_API_KEY = "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";
const hf = new HfInference(HUGGING_FACE_API_KEY);

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
    const { messages } = req.body;

    // Validate the input
    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: "Messages are required" });
    }

    // Extract the last user input from the messages
    const lastUserInput = messages[messages.length - 1].content; // Use 'content' instead of 'user'

    // Prepare the input for the text generation model
    const inputPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    try {
        const response = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            inputs: inputPrompt, // Use the formatted input
            parameters: { max_length: 150 }, // You can adjust max_length as needed
        });

        // Extract the generated text from the response
        const generatedText = response.generated_text || "No response generated";

        // Send the response back to the client
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
