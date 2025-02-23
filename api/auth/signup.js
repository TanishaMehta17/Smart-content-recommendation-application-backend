const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import prisma from "../../config/db";
// const prisma = require("../../config/db");
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {

    const body = await req.json();
    const { name, email, password, confirmpas } = body;
    console.log(body);
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (existingUser) {
            return new Response(JSON.stringify({ error: "User already exists" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return new Response(JSON.stringify({ message: "User created successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "error creating user", error }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
