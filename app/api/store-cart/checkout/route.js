import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import ProductPayment from "@/models/ProductPayment";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { items, total, method } = await req.json();

  console.log(items)

  if (!items || items.length === 0 || !total || !method) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  await dbConnect();

  // Save payment in DB
  const payment = await ProductPayment.create({
    user: session.user.id,
    items,
    total,
    method,
  });

  if (method === "card") {
    const line_items = items.map((item) => ({
      price_data: {
        currency: "lkr",
        product_data: { name: item.product.title },
        unit_amount: Math.round(item.priceSnapshot * 100), 
      },
      quantity: item.qty,
    }));

    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: { paymentId: payment._id.toString() },
      success_url: `${req.headers.get("origin")}/checkout-success?paymentId=${payment._id}`,
      cancel_url: `${req.headers.get("origin")}/checkout-cancel?paymentId=${payment._id}`,
    });

    payment.stripeSessionId = sessionStripe.id;
    await payment.save();

    return NextResponse.json({ paymentId: payment._id, sessionId: sessionStripe.id });
  }

  if (method === "crypto") {
    // TODO: create a crypto payment link
    return NextResponse.json({ paymentId: payment._id, paymentUrl: "https://crypto-pay-link" });
  }

  if (method === "qr") {
    const QRCode = require("qrcode");
    const qrData = `bankapp://pay?amount=${total}&ref=${payment._id}`;
    const qrUrl = await QRCode.toDataURL(qrData);

    return NextResponse.json({ paymentId: payment._id, qrUrl });
  }

  return NextResponse.json({ paymentId: payment._id });
}
