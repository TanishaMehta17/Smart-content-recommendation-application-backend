
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGenerativeAI(req, res) {
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

async function fetchYouTubeVideos(req, res) {
  const { query } = req.body;
  try {
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=15&type=video&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await axios.get(youtubeApiUrl);
    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
    res.json(videos);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error.message);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
}

async function fetchUnsplashImages(req, res) {
  const { query } = req.body;
  try {
    const unsplashApiUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=20&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    const response = await axios.get(unsplashApiUrl);
    const images = response.data.results.map((item) => ({
      description: item.alt_description || "No description",
      imageUrl: item.urls.regular, // Use higher quality image for full-screen
      smallImageUrl: item.urls.small, // Small image for grid
      downloadUrl: item.links.download, // Direct download link
      photographer: item.user.name,
      profileUrl: item.user.links.html,
    }));
    res.json(images);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error.message);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}

async function fetchAllContent(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    console.log("Received query:", query);

    const [videos, images, articles] = await Promise.all([
      fetchYouTubeVideos(query).catch(err => {
        console.error("Error fetching videos:", err);
        throw new Error("Videos fetch failed");
      }),
      fetchUnsplashImages(query).catch(err => {
        console.error("Error fetching images:", err);
        throw new Error("Images fetch failed");
      }),
      testGenerativeAI(query).catch(err => {
        console.error("Error fetching articles:", err);
        throw new Error("Articles fetch failed");
      }),
    ]);

    res.status(200).json({ videos, images, articles });
  } catch (error) {
    console.error("Error fetching content:", error.message);
    res.status(500).json({ error: error.message });
  }
}


module.exports = {
  testGenerativeAI,
  fetchYouTubeVideos,
  fetchUnsplashImages,
  fetchAllContent
};
