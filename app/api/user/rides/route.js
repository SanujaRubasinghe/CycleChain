// app/api/user/rides/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // Fetch all completed rides (both completed-payment-pending and completed-paid)
  const rides = await Reservation.find({ 
    userId: session.user.id,
    status: { $in: ["completed-payment-pending", "completed-paid"] }
  })
    .sort({ end_time: -1 })
    .lean();

  return NextResponse.json(rides, { headers: { "Cache-Control": "no-store" } });
}