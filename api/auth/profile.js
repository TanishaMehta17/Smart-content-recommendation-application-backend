import prisma from "../../config/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const userId = body.userId;

        if (!userId) {
            return new Response(JSON.stringify({
                message: "User ID is required"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return new Response(JSON.stringify({
                message: "User not found",
            }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            email: user.email,
            createdAt: user.createdAt
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            message: "Error fetching profile",
            error: error.message,
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
