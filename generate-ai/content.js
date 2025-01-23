const axios = require("axios");
require("dotenv").config();

console.log("Gemini API Key:", process.env.GEMINI_API_KEY);
console.log("Gemini API URL:", process.env.GEMINI_API_URL);

async function generateContent(query) {
  try {
    // Ensure the GEMINI_API_URL is loaded from the environment variables
    const GEMINI_API_URL = process.env.GEMINI_API_URL;

    if (!GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_URL or GEMINI_API_KEY is not defined in the .env file.");
    }

    // Set the payload for Gemini API
    const payload = {
      prompt: `Generate 7-8 videos, blogs, articles, and images about ${query}`,
      temperature: 0.7,
      candidateCount: 1,
    };

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`, // Correct Bearer token format
      };
      

    // Make the API request to Gemini
    const response = await axios.post(GEMINI_API_URL, payload, { headers });
    const result = response.data;

    // Transform the result into the required format
    return {
      videos: result.videos || [],
      blogs: result.blogs || [],
      images: result.images || [],
      articles: result.articles || [],
    };
  } catch (error) {
    console.error("Error generating content:", error.message);
    throw new Error("Failed to generate content.");
  }
}

module.exports = { generateContent };
