import Payment from "@/models/Payment";
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const payments = await Payment.find({ id }).sort({ createdAt: -1 });
    return NextResponse.json(payments, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
