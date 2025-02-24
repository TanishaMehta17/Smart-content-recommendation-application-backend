
const { GoogleGenerativeAI } = require("@google/generative-ai");
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Load API key from .env

export async function POST(req) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Input text must be a valid non-empty string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(text);

    console.log("Raw AI response:", JSON.stringify(result, null, 2)); // Debugging AI response

    // Extract response safely
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Invalid AI response format");
    }

    return new Response(JSON.stringify({ response: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return new Response(JSON.stringify({ error: "Error generating summary. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}