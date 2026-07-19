import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in server/.env");
}

app.post('/api/generate', async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
      return res.status(500).json({ error: { message: 'API key not configured on server' } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: {
        parts: { text: systemPrompt }
      },
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
      }
    };

    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!fetchRes.ok) {
      const err = await fetchRes.json();
      return res.status(fetchRes.status).json(err);
    }

    const data = await fetchRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
