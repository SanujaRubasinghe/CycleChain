import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const { code } = await req.json();

  const reservation = await Reservation.findById(id);
  console.log(typeof(code));
  if (!reservation) {
    return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
  }

  if (reservation.unlock_code != code) {
    return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400 });
  }

  reservation.status = "in_progress";
  reservation.start_time = new Date();
  reservation.unlock_code = null; 
  await reservation.save();

  return new Response(JSON.stringify({ success: true,message: "Ride started", reservation }), { status: 200 });
}
