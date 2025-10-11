import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";

// POST - Initialize loyalty points field for current user and calculate from past rides
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Initialize loyaltyPoints if it doesn't exist or is undefined
    if (user.loyaltyPoints === undefined || user.loyaltyPoints === null) {
      // Calculate total points from all completed rides
      const completedRides = await Reservation.find({
        userId: session.user.id,
        status: { $in: ["completed-payment-pending", "completed-paid"] }
      }).lean();

      const totalPoints = completedRides.reduce((sum, ride) => {
        return sum + Math.floor(ride.distance || 0);
      }, 0);

      // Force set the field using findByIdAndUpdate to ensure it's saved
      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { loyaltyPoints: totalPoints } },
        { new: true, runValidators: false }
      );
      
      console.log(`Initialized loyalty points for user ${session.user.id} with ${totalPoints} points from ${completedRides.length} rides`);
      console.log(`Updated user loyaltyPoints:`, updatedUser.loyaltyPoints);
      
      return NextResponse.json({ 
        message: "Loyalty points initialized from ride history",
        loyaltyPoints: totalPoints,
        ridesCalculated: completedRides.length,
        initialized: true
      });
    }

    return NextResponse.json({ 
      message: "Loyalty points already exist",
      loyaltyPoints: user.loyaltyPoints,
      initialized: false
    });
  } catch (error) {
    console.error("Error initializing loyalty points:", error);
    return NextResponse.json({ 
      message: "Failed to initialize loyalty points",
      error: error.message 
    }, { status: 500 });
  }
}
