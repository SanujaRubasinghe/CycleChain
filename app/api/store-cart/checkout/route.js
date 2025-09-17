import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";
import { computeTotal } from "../_helpers";

export const dynamic = "force-dynamic";

// Mock checkout: returns orderId and total, then clears cart
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDB();

  const cart = await Cart.findOne({ user: session.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  const total = computeTotal(cart.items);
  // TODO: create Order in DB, call payment gateway, etc.
  const orderId = `ORD-${Date.now()}`;

  // clear cart after success
  cart.items = [];
  await cart.save();

  return NextResponse.json({ ok: true, orderId, total });
}
