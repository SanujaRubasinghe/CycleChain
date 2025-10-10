import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Reservation from "@/models/Reservation";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { reservationId } = params;
  const { paymentId, success, txHash } = await req.json();

  try {
    await dbConnect();

    const payment = await Payment.findById(paymentId);
    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ message: "Payment not found or forbidden" }, { status: 404 });
    }

    payment.status = success ? "completed" : "failed";
    if (txHash) payment.transactionId = txHash;
    if (success) payment.completedAt = new Date();

    await payment.save();

    // Update reservation status to completed-paid
    if (success) {
      const reservation = await Reservation.findById(reservationId);
      if (reservation) {
        reservation.status = "completed-paid";
        await reservation.save();
        console.log(`Reservation ${reservationId} marked as completed-paid`);
      }
    }

    return NextResponse.json({ status: payment.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
