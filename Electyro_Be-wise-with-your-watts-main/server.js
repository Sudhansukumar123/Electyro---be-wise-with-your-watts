import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Lazy-initialize Gemini SDK to prevent startup crashes if GEMINI_API_KEY is not set
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Coach endpoint to generate custom energy-saving recommendations
app.post("/api/ai-coach", async (req, res) => {
  try {
    const { prompt, appliances, stats } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are ELECTYRO AI, an elite smart energy coach.
Analyze the user's active appliances, stats, and provide highly practical, direct, and actionable energy-saving advice.
Keep your response professional, friendly, and structured using clean HTML (e.g., <p>, <ul>, <li>, <strong>) so it renders perfectly inside our dashboard card.
Focus on low-cost/no-cost behaviors first. Keep responses concise (under 250 words). Do NOT use markdown format, only use standard HTML tags.`;

    const inputData = `Current User Stats:
- Daily Usage: ${stats?.dailyUsage || "0"} kWh
- Monthly Cost: ₹${stats?.monthlyCost || "0"}
- Active Appliances: ${stats?.activeCount || "0"} / ${stats?.totalCount || "0"}
- Appliance Details: ${JSON.stringify(appliances || [])}

User message: ${prompt || "Analyze my usage and give me direct tips to optimize my bill."}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: inputData,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("AI Coach Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI Coach suggestions." });
  }
});

// For all other requests, serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

