const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios"); 
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Assuming this is the correct library
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');

dotenv.config();

// Initialize Prisma Client
const prisma = require('./config/db')

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use(authRoutes);
app.use(contentRoutes);

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGenerativeAI(query) {
   
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
        contents: [
            {
                
              role: 'user',
              parts: [
                {
                  text: query,
                }
              ],
            }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
        }
    });
    
    console.log(result.response.text());
}
async function fetchYouTubeVideos(query) {
  try {
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=5&type=video&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await axios.get(youtubeApiUrl);
    console.log( response.data.items.map(item => ({
      title: item.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error.message);
    return [];
  }
}
// Function to fetch images from Unsplash
async function fetchUnsplashImages(query) {
  try {
    const unsplashApiUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=5&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    console.log("Fetching Unsplash images from URL:", unsplashApiUrl); // Debugging log

    const response = await axios.get(unsplashApiUrl);

    if (response.data && response.data.results) {
      const images = response.data.results.map(item => ({
        description: item.alt_description || "No description",
        imageUrl: item.urls.small,
        photographer: item.user.name,
        profileUrl: item.user.links.html,
      }));

      console.log("Fetched Unsplash images:", images); // Print the fetched images
      return images;
    } else {
      console.log("No images found for the query:", query); // Log if no images are returned
      return [];
    }
  } catch (error) {
    console.error("Error fetching Unsplash images:", error.message);
    return [];
  }
}

testGenerativeAI("Astromony");
// Example: Fetch images related to "Artificial Intelligence"
fetchUnsplashImages("Gardening");


fetchYouTubeVideos("Space");

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

