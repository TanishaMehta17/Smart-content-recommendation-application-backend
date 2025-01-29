const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = { saveQuery };
