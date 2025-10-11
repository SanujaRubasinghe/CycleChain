import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";

// POST - Recalculate loyalty points from all past rides (force recalculation)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    // Calculate total points from all completed rides
    const completedRides = await Reservation.find({
      userId: session.user.id,
      status: { $in: ["completed-payment-pending", "completed-paid"] }
    }).lean();

    const totalPoints = completedRides.reduce((sum, ride) => {
      return sum + Math.floor(ride.distance || 0);
    }, 0);

    // Force update the loyalty points
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { loyaltyPoints: totalPoints } },
      { new: true, runValidators: false }
    );

    console.log(`Recalculated loyalty points for user ${session.user.id}: ${totalPoints} points from ${completedRides.length} rides`);
    
    return NextResponse.json({ 
      message: "Loyalty points recalculated successfully",
      loyaltyPoints: totalPoints,
      ridesCalculated: completedRides.length,
      rides: completedRides.map(r => ({
        id: r._id,
        distance: r.distance,
        points: Math.floor(r.distance || 0),
        date: r.end_time
      }))
    });
  } catch (error) {
    console.error("Error recalculating loyalty points:", error);
    return NextResponse.json({ 
      message: "Failed to recalculate loyalty points",
      error: error.message 
    }, { status: 500 });
  }
}
