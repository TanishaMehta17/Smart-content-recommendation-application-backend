const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST (req, res)  {
    const userId = req.userId;
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ email: user.email, createdAt: user.createdAt });
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile", error });
    }
  };