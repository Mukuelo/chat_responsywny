import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  next();
});

app.use(cors());
app.use(express.json());

// 🔹 Klucz API z environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Serwowanie frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

// Endpoint GPT
app.post("/chat", async (req, res) => {
  try {

    const { messages, style } = req.body;

    const systemPrompt = style === "ciepły"
      ? "Odpowiadaj w przyjazny, wspierający sposób."
      : "Odpowiadaj w neutralny, rzeczowy sposób.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
 { role: "system", content: systemPrompt },
 ...messages
]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Nie udało się uzyskać odpowiedzi z AI.";

    res.json({ reply });

  } catch (error) {
    console.error("Błąd GPT:", error);
    res.status(500).json({ reply: "Wystąpił błąd w serwerze GPT." });
  }
});

// 🔹 Port dla hostingu (Render / Railway itd.)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server działa na porcie " + PORT);
});
