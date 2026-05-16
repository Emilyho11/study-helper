import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";
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
  const { path: filePath, mimetype } = req.file;
  const { difficulty, questionType } = req.body;

  try {
    // Upload a file to Gemini Files API
    const file = await ai.files.upload({
      file: filePath,
      config: {
        displayName: req.file.originalname,
        mimeType: mimetype || 'application/pdf',
      }
    });

    // Wait for gemini to process the file
    let getFile = await ai.files.get({ name: file.name });
    let pollCount = 0;
    while (getFile.state === 'PROCESSING' && pollCount < 10) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      getFile = await ai.files.get({ name: file.name });
      pollCount++;
    }
    if (getFile.state === 'FAILED') {
      throw new Error('Gemini file processing failed.');
    }

    // Build prompt
    let prompt = '';
    if (difficulty === 'easy' && questionType === 'knowledge') {
      prompt = `Generate 50 challenging exam questions (but don't make english so complicated) and answers to the following document. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'hard' && questionType === 'knowledge') {
      prompt = `Generate 50 challenging exam questions and answers to the following document. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'easy' && questionType === 'similar') {
      prompt = `Read the following document. Then, generate 20 new exam questions that are similar in style, format, and subject matter to the examples provided. Do not simply ask general questions about the topic; instead, create new questions that closely resemble the original ones. Use simple English. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'hard' && questionType === 'similar') {
      prompt = `Read the following document. Then, generate 20 new challenging exam questions that are similar in style, format, and subject matter to the examples provided. Do not simply ask general questions about the topic; instead, create new questions that closely resemble the original ones. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'easy' && questionType === 'multiple-choice') {
      prompt = `Generate 50 multiple choice questions based on the following document. Use simple English. Output a JSON object where each key is the full question text (not just "Question 1", but the actual question), and each value is an object with two fields: "choices" (an object with keys "A", "B", "C", "D" and their text), and "answer" (the correct letter, e.g., "A"). No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'hard' && questionType === 'multiple-choice') {
      prompt = `Generate 50 challenging multiple choice questions based on the following document. Output a JSON object where each key is the full question text (not just "Question 1", but the actual question), and each value is an object with two fields: "choices" (an object with keys "A", "B", "C", "D" and their text), and "answer" (the correct letter, e.g., "A"). No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'easy' && questionType === 'scenario') {
      prompt = `Generate 50 application/scenario-based questions based on the following document. Use simple English. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    } else if (difficulty === 'hard' && questionType === 'scenario') {
      prompt = `Generate 50 challenging application/scenario-based questions based on the following document. Output a JSON object where each key is a full exam question and each value is its answer. Do not use "Question 1", "Answer 1", or any numbering—just the question as the key and the answer as the value. No introduction, no markdown formatting, and no extra commentary.`;
    }

    // Prepare Gemini contents with file reference
    const contents = [
      { text: prompt }
    ];
    if (getFile.uri && getFile.mimeType) {
      const { createPartFromUri } = await import('@google/genai');
      contents.push(createPartFromUri(getFile.uri, getFile.mimeType));
    }

    // Send extracted text to Gemini API to create questions
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents
    });
    let response = result.text;
    let jsonStart = response.indexOf('{');
    let jsonEnd = response.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      response = response.substring(jsonStart, jsonEnd + 1);
    }
    res.json({ questions: response });
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the file.' });
  }
  finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
