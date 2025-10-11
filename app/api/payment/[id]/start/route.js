import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Stripe from "stripe";
import QRCode from "qrcode";
import Reservation from "@/models/Reservation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { method, amount } = await req.json();

  const reservation = await Reservation.findById(id);
  if (!reservation || reservation.userId !== session.user.id) {
    return NextResponse.json({ message: "Reservation not found or forbidden" }, { status: 404 });
  }

  if (!method || !["card", "crypto", "qr"].includes(method)) {
    return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
  }

  try {
    await dbConnect();

    const payment = await Payment.create({
      reservationId: id,
      userId: session.user.id,
      amount,
      method,
      status: "pending",
    });

    if (method === "card") {
      const origin = req.headers.get("origin"); 

      const sessionStripe = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "lkr",
              product_data: { name: `Bike Reservation ${id}` },
              unit_amount: Math.round(amount * 100), 
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/checkout-success?paymentId=${payment._id}`,
        cancel_url: `${origin}/checkout-cancel?paymentId=${payment._id}`,
        metadata: { paymentId: payment._id.toString(), reservationId: id },
      });

      payment.transactionId = sessionStripe.id;
      payment.status = "completed";

      reservation.status = "completed-paid";
      await payment.save();
      await reservation.save();

      return NextResponse.json({ payment, sessionId: sessionStripe.id });
    }

    if (method === "qr") {
      const qrData = `bankapp://pay?amount=${amount}&ref=${payment._id}`;
      const qrUrl = await QRCode.toDataURL(qrData);

      payment.qrCodeData = qrUrl;
      await payment.save();

      return NextResponse.json({ payment, qrUrl });
    }

    if (method === "crypto") {
      return NextResponse.json({ payment, paymentUrl: "https://crypto-pay-link" });
    }

    return NextResponse.json({ payment });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
