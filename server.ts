import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load local env file if in dev
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get Gemini Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "API_KEY_MISSING",
          message: "피드백을 불러오지 못했습니다. API 키를 확인해주세요." 
        });
      }

      const { userPrompt, systemInstruction } = req.body;
      if (!userPrompt) {
        return res.status(400).json({ error: "BAD_REQUEST", message: "분석할 데이터가 누락되었습니다." });
      }

      // Lazy initialize GoogleGenAI client to avoid crash on load if key is missing
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const feedbackText = response.text;
      if (!feedbackText) {
        throw new Error("Empty content received from Gemini model");
      }

      return res.json({ feedbackText });
    } catch (err: any) {
      console.error("Server API Feedback Error:", err);
      return res.status(500).json({ 
        error: "SERVER_ERROR", 
        message: "피드백을 불러오지 못했습니다. API 키를 확인해주세요." 
      });
    }
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
