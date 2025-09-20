import { dbConnect } from "@/lib/mongodb";
import Bike from "@/models/Bike";
import Reservation from "@/models/Reservation";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
  }

  const bikeId = reservation.bikeId
  const bike = await Bike.findById(bikeId);
  if (!bike) {
    return new Response(JSON.stringify({ error: "Bike not found" }), { status: 404 });
  }

  reservation.status = "completed-payment-pending";
  reservation.end_time = new Date();
  reservation.end_location = bike.currentLocation;

  reservation.cost = (reservation.distance || 0) * 50;

  await reservation.save();

  return new Response(
    JSON.stringify({ message: "Ride ended", reservation }),
    { status: 200 }
  );
}
