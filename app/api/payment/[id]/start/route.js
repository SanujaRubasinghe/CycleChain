import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import Reservation from "@/models/Reservation";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = params; // removed await

  const body = await req.json();
  const { method, amount } = body;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    const payment = await Payment.create({
      reservationId: id,
      userId: reservation.userId,
      amount: amount || reservation.cost,
      method,
      status: "pending",
      qrCodeData: method === "qr" ? `QR_FOR_${id}_${Date.now()}` : null,
    });

    const transactionId = `txn_${Date.now()}`;

    return NextResponse.json({ paymentId: payment._id, transactionId, qrCodeData: payment.qrCodeData });
  } catch (err) {
    console.error("Error processing payment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
