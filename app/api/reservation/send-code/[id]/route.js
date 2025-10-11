import { dbConnect } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { id } = await params;
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return new Response(JSON.stringify({ error: "Reservation not found" }), {
      status: 404,
    });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  reservation.unlock_code = code;
  await reservation.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"CycleChain" <${process.env.GMAIL_USER}>`,
    to: session.user.email,
    subject: "Your Bike Unlock Code",
    html: `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#16a34a;">Your Unlock Code</h2>
        <p>Use the following 4-digit code to unlock your bike:</p>
        <div style="font-size:32px;font-weight:bold;color:#16a34a;margin:20px 0;">
          ${code}
        </div>
        <p>This code will expire after use.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  return new Response(JSON.stringify({ message: "Code sent via email" }), {
    status: 200,
  });
}
