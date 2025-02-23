const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

export async function POST(req, res) {
    // ...
    const { query } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: query }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.1,
            },
        });
        res.json({ content: result.response.text() });
    } catch (error) {
        console.error("Error generating content:", error.message);
        res.status(500).json({ error: "Failed to generate content" });
    }
}
