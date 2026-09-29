import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Server-side Gemini API endpoint for NWIS Intelligence Assistant
  app.post("/api/gemini/assistant", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const { prompt, contextSummary } = req.body || {};

    if (!apiKey || apiKey.trim() === "") {
      return res.json({
        usedGemini: false,
        reason: "GEMINI_API_KEY not configured; using transparent local NWIS deterministic retrieval engine.",
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are the NWIS Intelligence Assistant for eRTMAC-NWIS (Nearby Wells Intelligence System) built as a decision-support prototype for Oil India Limited (Assam Basin — Demo Field).
CRITICAL RULES:
1. All data provided to you is synthetic DEMO DATA. Never claim it represents real Oil India Limited operational wells.
2. Answer strictly using the provided synthetic offset wells, historical events, and historical reports in the context below.
3. Every factual claim about an event, well, or report MUST include an inline source citation in this exact bracketed format:
   [Source: <DOC_ID>, Well: <WELL_ID>, Depth: <DEPTH> m]
   For example: [Source: DDR-DEMO-014, Well: NWIS-OFF-008, Depth: 2,890 m]
4. Separate your response into two clear sections:
   - **Retrieved Historical Evidence**: Direct facts, depths, parameters, and outcomes from the offset records.
   - **Engineering Synthesis & Advisory Context**: Analytical correlation with the active well. Do not issue prescriptive real-world operating setpoints; remind the user that recommendations are advisory and require review by qualified drilling engineers.
5. Keep responses concise, structured, and highly technical.

CONTEXT DATA:
${contextSummary || "No additional context provided."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt || "Summarize current offset well risks.",
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({
        usedGemini: true,
        text: response.text || "",
      });
    } catch (err: any) {
      return res.json({
        usedGemini: false,
        error: err?.message || "Gemini API error; falling back to local retrieval engine.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`eRTMAC-NWIS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
