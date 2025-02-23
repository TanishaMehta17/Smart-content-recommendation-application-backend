const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req, res) {
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