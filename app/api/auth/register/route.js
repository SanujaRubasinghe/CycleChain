// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/user"; // <-- match the actual file name exactly

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "username, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Normalize
    const normEmail = String(email).toLowerCase().trim();
    const normUsername = String(username).trim();

    // Uniqueness
    const emailExists = await User.findOne({ email: normEmail }).lean();
    if (emailExists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const usernameExists = await User.findOne({ username: normUsername }).lean();
    if (usernameExists) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash & create
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normEmail,
      username: normUsername,
      password: hash,
      role: "user",
    });

    // Return minimal public info
    return NextResponse.json(
      {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (err) {
    // Surface useful details to your dev console
    console.error("POST /api/auth/register error:", err?.message || err);

    // If it's a Mongo duplicate key error, provide a readable message
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return NextResponse.json(
        { message: `Duplicate ${field}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
