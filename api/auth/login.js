const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    // Parse JSON body
    const data = await req.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({
        isSuccess: false,
        message: "Email and password are required",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user is not found, return a generic error
    if (!user) {
      return new Response(JSON.stringify({
        isSuccess: false,
        message: "Invalid credentials",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({
        isSuccess: false,
        message: "Invalid credentials",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return a successful response
    return new Response(JSON.stringify({
      isSuccess: true,
      message: "Login successful",
      token: token,
      email: user.email,
      username: user.username,
      id: user.id,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error during login:", error);
    return new Response(JSON.stringify({
      isSuccess: false,
      message: "An error occurred while logging in",
      error: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
