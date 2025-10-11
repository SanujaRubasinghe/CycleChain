import { dbConnect } from "@/lib/mongodb";
import Bike from "@/models/Bike";
import Reservation from "@/models/Reservation";
import User from "@/models/User";

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
  reservation.end_location = bike.currentLocation
  reservation.distance = 20; // Example: 20 km, update with real distance calculation

  reservation.cost = (reservation.distance || 0) * 50;

  await reservation.save();

  // Award loyalty points: 1 point per kilometer
  const loyaltyPointsEarned = Math.floor(reservation.distance || 0);
  if (loyaltyPointsEarned > 0) {
    try {
      await User.findByIdAndUpdate(
        reservation.userId,
        { $inc: { loyaltyPoints: loyaltyPointsEarned } },
        { new: true }
      );
    } catch (error) {
      console.error("Failed to update loyalty points:", error);
      // Don't fail the request if loyalty points update fails
    }
  }

  return new Response(
    JSON.stringify({ 
      message: "Ride ended", 
      reservation,
      loyaltyPointsEarned 
    }),
    { status: 200 }
  );
}
