import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import ProductPayment from "@/models/ProductPayment";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Payment ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const payment = await ProductPayment.findById(id).populate("items.product");
    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    if (payment.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let stripeStatus = null;
    if (payment.method === "card" && payment.paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(payment.paymentIntentId);
      stripeStatus = intent.status; 
    }

    return NextResponse.json({
      payment: {
        id: payment._id,
        items: payment.items,
        total: payment.total,
        method: payment.method,
        createdAt: payment.createdAt,
        stripeStatus,
      },
    });
  } catch (err) {
    console.error("GET payment error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
