// client/app/api/store-cart/clear/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ items: [], total: 0 });

  cart.items = [];
  cart.total = 0;
  await cart.save();
  return NextResponse.json({ items: [], total: 0 });
}
