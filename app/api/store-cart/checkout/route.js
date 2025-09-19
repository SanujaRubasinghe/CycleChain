// client/app/api/store-cart/checkout/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart || cart.items.length === 0) return NextResponse.json({ message: "Empty" }, { status: 400 });

  const orderId = `ORD-${Date.now()}`;
  const total = cart.total;

  // TODO: create an Order document here if you want to keep history

  cart.items = [];
  cart.total = 0;
  await cart.save();

  return NextResponse.json({ ok: true, orderId, total });
}
