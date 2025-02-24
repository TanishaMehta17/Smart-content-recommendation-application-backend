import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { query, userId, timeStamp } = await req.json();

    // Validate input
    if (!query || !userId) {
      return new Response(
        JSON.stringify({ error: "Query and userId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Store query in the database with timestamp
    const savedQuery = await prisma.query.create({
      data: {
        query,
        userId,
        timeStamp: timeStamp ? new Date(timeStamp) : new Date(),
      },
    });

    return new Response(
      JSON.stringify({
        message: "Query saved successfully",
        data: savedQuery,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving query:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
