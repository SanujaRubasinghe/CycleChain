import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";
import { serializeCart } from "../_helpers";

export const dynamic = "force-dynamic";

// PATCH /api/store-cart/:itemId  { qty }
export async function PATCH(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await _req.json().catch(() => ({}));
  const nextQty = Math.max(1, Number(body.qty) || 1);

  await connectToDB();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

  const item = cart.items.id(params.itemId);
  if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });

  item.qty = nextQty;
  await cart.save();
  await cart.populate("items.product");

  return NextResponse.json(serializeCart(cart));
}

// DELETE /api/store-cart/:itemId
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDB();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

  const item = cart.items.id(params.itemId);
  if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });

  item.deleteOne();
  await cart.save();
  await cart.populate("items.product");

  return NextResponse.json(serializeCart(cart));
}
