const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require('@prisma/client');
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const natural = require('natural');
const cosineSimilarity = require('cosine-similarity');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to summarize content using Google Generative AI
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

// Function to save a user query into the database
const saveQuery = async (req, res) => {
  try {
    const { query, userId, timeStamp } = req.body;

    // Validate input
    if (!query || !userId) {
      return res.status(400).json({ error: 'Query and userId are required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store query in the database with timestamp
    const savedQuery = await prisma.query.create({
      data: {
        query,
        userId,
        timeStamp: timeStamp ? new Date(timeStamp) : new Date(), // Use provided timestamp or current time
      },
    });

    return res.status(201).json({
      message: 'Query saved successfully',
      data: savedQuery,
    });

  } catch (error) {
    console.error('Error saving query:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to fetch past queries for a user
async function fetchPastQueries(userId) {
  try {
    // Fetch queries for the given userId
    const queries = await prisma.query.findMany({
      where: { userId: userId }, // Filter queries by userId
      select: { query: true },
    });
    return queries.reverse().map((q) => q.query); // Extract query strings
  } catch (error) {
    console.error('Error fetching queries from DB:', error);
    return [];
  }
}

// Function to generate related queries based on past queries for a user
async function generateRelatedQueries(userId) {
  const pastQueries = await fetchPastQueries(userId);

  if (pastQueries.length === 0) {
    return [];  // No queries in the database for this user
  }

  // Extract keywords from past queries (TF-IDF)
  const keywords = extractKeywords(pastQueries);

  // Generate dynamic variations based on semantic similarities
  const relatedQueries = generateDynamicQueries(keywords, pastQueries);

  return relatedQueries;
}

// Extract keywords using TF-IDF from the queries
function extractKeywords(queries) {
  const tfidf = new natural.TfIdf();
  queries.forEach(query => tfidf.addDocument(query));

  const keywords = new Set();

  queries.forEach(query => {
    let queryKeywords = [];
    tfidf.tfidfs(query, (i, measure) => {
      if (measure > 0.1) {  // Threshold to consider significant words
        queryKeywords.push(tfidf.listTerms(i).map(term => term.term));
      }
    });
    queryKeywords = queryKeywords.flat();
    queryKeywords.forEach(keyword => keywords.add(keyword));
  });

  return Array.from(keywords);
}

// Generate dynamic related queries based on semantic relationships and query structure
function generateDynamicQueries(keywords, pastQueries) {
  const relatedQueries = [];

  // Find similarity between past queries and generate new ones
  pastQueries.forEach((query) => {
    keywords.forEach((keyword) => {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        // Generate variations of the query dynamically
        relatedQueries.push(`Can you tell me more about ${keyword}?`);
      }
    });
  });

  return relatedQueries;
}

// Example: Generate related queries for a specific user
async function recommendQueries(userId) {
  const relatedQueries = await generateRelatedQueries(userId);
  console.log('Generated related queries:', relatedQueries);
}

// Function to test the Generative AI model
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

// Signup function for new users
const signup = async (req, res) => {
  const { name, email, password, confirmpas } = req.body;
  console.log(req.body);
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};
const TokenisValid = async (req, res) => {
    try {
      const token = req.header("token");
      if (!token) return res.json(false);
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) return res.json(false);
  
      const user = await prisma.user.findUnique({
        where: { id: verified.userId },
      });
      if (!user) return res.json(false);
      res.json(true);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
  const getdata = async (req, res) => {
    try {
      console.log(req.userId);
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const token = req.header("token");
  
      res.json({
        email: user.email,
        username: user.username,
        id: req.userId,
        confirmpas: user.confirmpas,
        password: user.password,
        token: token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching data", error });
    }
  };
  
module.exports = {
  summarizeContent,
  getdata,
  saveQuery,
  recommendQueries,
  fetchUnsplashImages,
  testGenerativeAI,
  fetchYouTubeVideos,
  fetchAllContent,
  signup,
  login,
  TokenisValid,
};
