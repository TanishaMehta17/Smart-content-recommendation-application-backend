const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req,res)  {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      // If user is not found, return a generic error
      if (!user) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid credentials",
        });
      }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid credentials",
        });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" } // Token expires in 1 hour
      );
  
      // var temp=JSON.stringify({user,
      //   token: token})
      // Send the token and success response
      console.log(token);
      res.status(200).json({
        
        // message: 'Login successful',
        token:token,
        email: user.email,
        username: user.username,
        id: user.id,
        confirmpas: user.confirmpas,
        password: user.password,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        isSuccess: false,
        message: "An error occurred while logging in",
        error: error.message,
      });
    }
  };