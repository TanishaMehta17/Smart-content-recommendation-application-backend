const express = require('express');
const contentRoutes = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { generateContent } = require('../generate-ai/content');
// API route for generating content
contentRoutes.post("/generate", async (req, res) => {
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required." });
    }
  
    try {
      const content = await generateContent(query);
      res.status(200).json(content);
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate content." });
    }
  });
  module.exports=  contentRoutes;