// app/api/user/rides/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const rides = await Reservation.find({ user: session.user.id })
    .sort({ endTime: -1 })
    .limit(10)
    .lean();

  return NextResponse.json(rides, { headers: { "Cache-Control": "no-store" } });
}