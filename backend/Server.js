import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";
import DocumentIntelligence from "@azure-rest/ai-document-intelligence";
import { resolve } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: resolve("uploads") });

app.use(express.json({ limit: "2mb" }));

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://study-helper-g6yi.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_AI_KEY });

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const { path } = req.file;

  try {
    const base64Source = fs.readFileSync(path, { encoding: "base64" });

    // Create Azure Document Intelligence client
    const client = DocumentIntelligence(process.env.AZURE_ENDPOINT, {
      key: process.env.AZURE_KEY,
    });
    // Analyze document using Azure Document Intelligence
    const analyzeResponse = await client
      .path('/documentModels/prebuilt-layout:analyze')
      .post({
        body: { base64Source },
        contentType: "application/json",
        queryParameters: { "api-version": "2024-11-30" }
      });

    console.log('Azure analyzeResponse:', analyzeResponse);
    let azureResponse;
    // Check if Azure returns 202 and operation-location for async polling
    if (analyzeResponse.status === "202" && analyzeResponse.headers["operation-location"]) {
      const operationLocation = analyzeResponse.headers["operation-location"];
      let pollCount = 0;
      // Poll until status is succeeded or failed (max 10 tries)
      while (pollCount < 10) {
        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
        const pollResponse = await axios.get(operationLocation, {
          headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_KEY }
        });
        if (pollResponse.data.status === "succeeded") {
          azureResponse = pollResponse.data;
          break;
        }
        if (pollResponse.data.status === "failed") {
          throw new Error("Azure Document Intelligence analysis failed.");
        }
        pollCount++;
      }
    }

    if (!azureResponse) {
      fs.unlinkSync(path);
      return res.status(500).json({ error: 'Failed to analyze document.' });
    }
    
    // Extract text content from the response
    const extractedText = azureResponse.analyzeResult?.content || '';
    if (!extractedText) {
      fs.unlinkSync(path);
      return res.status(400).json({ error: 'No text extracted from document.' });
    }
    
    // Send extracted text to Gemini API to create questions
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Generate 50 challenging exam questions (but don't make english so complicated) and answers to the following text. Output only the questions and answers, no introduction, no markdown formatting, and no extra commentary. Make the questions first, then have the answers next:\n\n${extractedText}`
    });
    const response = result.text;
    res.json({ questions: response });
  }
  catch (error) {
    console.error('Error:', error);
    if (error.response) {
      // Log Azure SDK error details if available
      console.error('Azure error response:', error.response.status, error.response.data);
    }
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
  finally {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
