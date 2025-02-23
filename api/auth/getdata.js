const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST (req, res)  {
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