
import dotenv from "dotenv";

dotenv.config();
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

    const unsplashApiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(unsplashApiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    const images = data.results.map((item) => ({
      description: item.alt_description || "No description",
      imageUrl: item.urls.regular,
      smallImageUrl: item.urls.small,
      downloadUrl: item.links.download,
      photographer: item.user.name,
      profileUrl: item.user.links.html,
    }));

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Unsplash images:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}