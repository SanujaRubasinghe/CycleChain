// app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User"; 
import Reservation from "@/models/Reservation";
import Cart from "@/models/Cart"; 
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const user = await User.findById(session.user.id).lean();
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Usage summary
  const summaryAgg = await Reservation.aggregate([
    { $match: { userId: session.user.id } },
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        totalDistance: { $sum: "$distance" },
        totalCost: { $sum: "$cost" },
        lastRideAt: { $max: "$end_time" },
      },
    },
  ]);

  const summary = summaryAgg[0] || {
    totalRides: 0,
    totalDistance: 0,
    totalCost: 0,
    lastRideAt: null,
  };

  return NextResponse.json(
    {
      id: session.user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints || 0,
      usage: summary,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { username, password } = await req.json().catch(() => ({}));
  if (!username && !password) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  await dbConnect();

  const update = {};
  if (username) {
    const exists = await User.findOne({
      username,
      _id: { $ne: session.user.id },
    }).lean();
    if (exists)
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    update.username = username.trim();
  }
  if (password) {
    if (String(password).length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    update.password = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(session.user.id, update, {
    new: true,
  }).lean();
  return NextResponse.json({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // Delete related data (adjust to your needs)
  await Promise.all([
    Reservation.deleteMany({ user: session.user.id }),
    Cart.deleteOne({ user: session.user.id }).catch(() => {}),
  ]);
  await User.findByIdAndDelete(session.user.id);

  // Optionally: invalidate session cookie (client should redirect to /)
  return NextResponse.json({ ok: true });
}
