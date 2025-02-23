import axios from "axios";

export async function POST(req) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=15&type=video&key=${
            process.env.YOUTUBE_API_KEY
        }`;
        const response = await axios.get(youtubeApiUrl);

        const videos = response.data.items.map((item) => ({
            title: item.snippet.title,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
        }));

        return new Response(JSON.stringify(videos), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching YouTube videos:", error.message);
        return new Response(JSON.stringify({ error: "Failed to fetch YouTube videos" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
