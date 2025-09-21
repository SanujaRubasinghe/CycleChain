import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params; //removed await

  try {
    const payment = await Payment.find({reservationId: id});
    if (payment.length === 0) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    return NextResponse.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    return NextResponse.error();
  }
}