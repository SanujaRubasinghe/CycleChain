import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; 
import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  //finding the user id reservation
  const reservation = await Reservation.findOne({
    userId: session.user.id,
    status: { $in: ["reserved", "in_progress"] },
  });

  if (!reservation) {
    return new Response(JSON.stringify({ error: "No active reservation" }), { status: 404 });
  }
  
  return new Response(JSON.stringify(reservation), { status: 200 });
}
