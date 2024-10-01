const express = require('express');
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(express.json());

app.get('/', (req, res) => {
   res.json({ status: "ok" });
});

app.get('/getGeminiKey', (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY; 
    if (geminiApiKey) {
        res.json({ apiKey: geminiApiKey });
    } else {
        res.status(404).send('API key not found');
    }
});

app.post('/generateStory', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    try {
        const response = await fetch("https://us-central1-ai-assistant-66af9.cloudfunctions.net/getGeminiKey");
        const data = await response.json();

        const geminiApiKey = data.apiKey; 

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);

        res.json({ content: result.response.text() });
    } catch (error) {
        console.error('Error fetching data from Gemini API:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = app;
