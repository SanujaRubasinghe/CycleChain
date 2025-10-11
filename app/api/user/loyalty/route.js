import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET - Fetch user's loyalty points
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    console.log("Fetching loyalty points for user:", session.user.id);
    const user = await User.findById(session.user.id).select('loyaltyPoints').lean();
    
    if (!user) {
      console.log("User not found:", session.user.id);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User loyalty points:", user.loyaltyPoints);
    return NextResponse.json({ 
      loyaltyPoints: user.loyaltyPoints || 0 
    }, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    return NextResponse.json({ 
      message: "Failed to fetch loyalty points" 
    }, { status: 500 });
  }
}

// PATCH - Update loyalty points (for redemptions)
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { pointsToDeduct, reason } = body;

    if (!pointsToDeduct || pointsToDeduct <= 0) {
      return NextResponse.json({ 
        message: "Invalid points amount" 
      }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has enough points
    if ((user.loyaltyPoints || 0) < pointsToDeduct) {
      return NextResponse.json({ 
        message: "Insufficient loyalty points" 
      }, { status: 400 });
    }

    // Deduct points
    user.loyaltyPoints = (user.loyaltyPoints || 0) - pointsToDeduct;
    await user.save();

    return NextResponse.json({ 
      message: "Points redeemed successfully",
      loyaltyPoints: user.loyaltyPoints,
      pointsDeducted: pointsToDeduct,
      reason: reason || "Reward redemption"
    }, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error) {
    console.error("Error updating loyalty points:", error);
    return NextResponse.json({ 
      message: "Failed to update loyalty points" 
    }, { status: 500 });
  }
}
