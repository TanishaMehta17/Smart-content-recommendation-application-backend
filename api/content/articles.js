export async function POST(req) {
    try {
      const body = await req.json();
      const { query } = body;
  
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: query || "" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
        },
      });
  
      const generatedText = result.response.text();
      return new Response(JSON.stringify({ content: generatedText }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Error generating content:", error.message);
      return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  