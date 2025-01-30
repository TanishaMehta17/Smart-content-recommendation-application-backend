const express = require("express");
const { generateRelatedQueries } = require("../controllers/recommendationController");
const Recommendrouter = express.Router();

// Route to fetch recommendations for a specific user
Recommendrouter.get('/recommend', async (req, res) => {
  const { userId } = req.query;  // Extract userId from query parameters

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Generate related queries for the given userId
    const relatedQueries = await generateRelatedQueries(userId);

    if (relatedQueries.length === 0) {
      return res.status(404).json({ message: 'No recommendations found for this user.' });
    }

    // Return the generated related queries
    res.json({ recommendations: relatedQueries });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Error generating recommendations' });
  }
});

module.exports = Recommendrouter;
