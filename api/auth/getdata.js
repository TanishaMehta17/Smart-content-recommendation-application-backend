const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/db"); // Assuming you're using the singleton pattern for Prisma
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    // Parse headers and body properly
    const headers = req.headers;
    const data = await req.json();

    const { userId } = data;

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the token from the request headers
    const token = headers.get("token");

    // Respond with user info (excluding sensitive data like password)
    return new Response(
      JSON.stringify({
        email: user.email,
        username: user.username,
        id: user.id,
        token: token || "No token provided",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching user data", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
