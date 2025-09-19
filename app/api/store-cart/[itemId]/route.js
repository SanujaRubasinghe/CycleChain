// client/app/api/store-cart/[itemId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";

export async function PATCH(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { itemId } = params;
  const { qty } = await _req.json().catch(() => ({}));
  if (!itemId || !qty || qty < 1) return NextResponse.json({ message: "bad request" }, { status: 400 });

  await connectToDB();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const item = cart.items.id(itemId);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  item.qty = qty;
  cart.recalc();
  await cart.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { itemId } = params;
  await connectToDB();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Not found" }, { status: 404 });

  cart.items.id(itemId)?.deleteOne();
  cart.recalc();
  await cart.save();

  return NextResponse.json({ ok: true });
}
