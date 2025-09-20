import { NextResponse } from "next/server";
import Reservation from "@/models/Reservation";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}