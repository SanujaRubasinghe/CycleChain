import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
  }

  reservation.status = "in_progress";
  reservation.start_time = new Date();
  await reservation.save();

  return new Response(JSON.stringify({ message: "Ride started", reservation }), { status: 200 });
}
