// client/app/api/store-cart/[itemId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const { qty } = await req.json().catch(() => ({}));

  if (!itemId || !qty || qty < 1)
    return NextResponse.json({ message: "Bad request" }, { status: 400 });

  await dbConnect();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart)
    return NextResponse.json({ message: "Cart not found" }, { status: 404 });

  const item = cart.items.id(itemId);
  if (!item)
    return NextResponse.json({ message: "Item not found" }, { status: 404 });

  item.qty = qty;

  // Ensure recalc updates total
  cart.total = cart.items.reduce((sum, i) => sum + (i.priceSnapshot * i.qty), 0);

  await cart.save();

  return NextResponse.json({
    ok: true,
    items: cart.items,
    total: cart.total,
  });
}


export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  await dbConnect();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  cart.items.id(itemId)?.deleteOne();
  cart.recalc();
  await cart.save();

  return NextResponse.json({ ok: true });
}
