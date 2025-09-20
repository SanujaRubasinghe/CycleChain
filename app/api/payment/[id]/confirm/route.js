import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import Reservation from "@/models/Reservation";
import { dbConnect } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const { paymentId, success } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("Confirming payment:", { id, paymentId, success });

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    payment.status = success ? "completed" : "failed";
    payment.completedAt = success ? new Date() : null;
    await payment.save();

    const reservationUpdate = success ? { status: "completed-paid" } : {};
    const reservation = await Reservation.findByIdAndUpdate(id, reservationUpdate, { new: true });

    if (success) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER, 
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"CycleChain" <${process.env.GMAIL_USER}>`,
        to: session.user.email, 
        subject: "Payment Confirmation - CycleChain Ride",
        html: `
          <div style="font-family: Arial, sans-serif; background: #f8f8f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e5e5;">
              <h2 style="color: #16a34a; text-align: center;">Payment Successful ✅</h2>
              <p>Hello,</p>
              <p>Your payment for the bike ride has been successfully processed. Here are the details:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Reservation ID</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${reservation._id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Bike ID</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${reservation.bikeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Ride Start</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date(reservation.start_time).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Ride End</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date(reservation.end_time).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Amount Paid</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${payment.amount.toFixed(2)} ${payment.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Payment Method</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${payment.method.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Transaction ID</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${payment.transactionId || "N/A"}</td>
                </tr>
              </table>
              <p style="margin-top: 15px;">Thank you for riding with <span style="color: #16a34a; font-weight: bold;">CycleChain</span>!</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Payment confirmation email sent.");
    }

    return NextResponse.json({ status: payment.status }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
