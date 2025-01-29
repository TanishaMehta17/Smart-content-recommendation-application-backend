const express = require("express");
const { generateRelatedQueries } = require("../controllers/recommendationController");
const Recommendrouter = express.Router();

Recommendrouter.get('/recommend', async (req, res) => {
    try {
      const relatedQueries = await generateRelatedQueries();
      res.json({ recommendations: relatedQueries });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Error generating recommendations' });
    }
  });

module.exports = Recommendrouter;
