const axios = require("axios");

export async function POST(req) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    try {
        
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log("Received query:", query);

        const [videos, images, articles] = await Promise.all([
            
            axios
                .get(`https://www.googleapis.com/youtube/v3/search`, {
                    params: {
                        part: "snippet",
                        q: query,
                        maxResults: 15,
                        type: "video",
                        key: YOUTUBE_API_KEY,
                    },
                })
                .then((response) =>
                    response.data.items.map((item) => ({
                        title: item.snippet.title,
                        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channelTitle: item.snippet.channelTitle,
                        publishedAt: item.snippet.publishedAt,
                    }))
                )
                .catch((err) => {
                    console.error("Error fetching videos:", err);
                    throw new Error("Videos fetch failed");
                }),

           
            axios
                .get(`https://api.unsplash.com/search/photos`, {
                    params: {
                        query: query,
                        per_page: 20,
                        client_id: UNSPLASH_ACCESS_KEY,
                    },
                })
                .then((response) =>
                    response.data.results.map((item) => ({
                        description: item.alt_description || "No description",
                        imageUrl: item.urls.regular,
                        smallImageUrl: item.urls.small,
                        downloadUrl: item.links.download,
                        photographer: item.user.name,
                        profileUrl: item.user.links.html,
                    }))
                )
                .catch((err) => {
                    console.error("Error fetching images:", err);
                    throw new Error("Images fetch failed");
                }),

            
            axios
                .post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: query }],
                        },
                    ],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                    },
                })
                .then((response) => {
                    const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || "No content generated.";
                    return generatedText;
                })
                .catch((err) => {
                    console.error("Error fetching articles:", err);
                    throw new Error("Articles fetch failed");
                }),
        ]);

       
        return new Response(JSON.stringify({ videos, images, articles }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching content:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
