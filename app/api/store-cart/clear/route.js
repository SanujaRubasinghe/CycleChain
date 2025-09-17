// app/api/store-cart/clear/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";
import { serializeCart } from "../_helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  // Must be signed in
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();

  // Clear items (create cart if it doesn't exist)
  const cart = await Cart.findOneAndUpdate(
    { user: session.user.id },
    { $set: { items: [] } },
    { new: true, upsert: true }
  ).populate("items.product");

  return NextResponse.json(serializeCart(cart), {
    headers: { "Cache-Control": "no-store" },
  });
}
