const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Load API key from .env

const summarizeContent = async (text) => {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Input text must be a valid non-empty string");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(text);

    console.log("Raw AI response:", JSON.stringify(result, null, 2)); // Debugging AI response

    // Extract response safely
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Invalid AI response format");
    }

    return responseText;
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return "Error generating summary. Please try again.";
  }
};

module.exports = summarizeContent;
