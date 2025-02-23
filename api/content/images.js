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

    const unsplashApiUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=20&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    const response = await axios.get(unsplashApiUrl);

    const images = response.data.results.map((item) => ({
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
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
