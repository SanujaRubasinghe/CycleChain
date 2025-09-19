// client/app/api/store-cart/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/cart";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectToDB();

  let cart = await Cart.findOne({ user: session.user.id }).populate("items.product").lean();
  if (!cart) {
    return NextResponse.json({ items: [], total: 0 });
  }
  return NextResponse.json({
    items: cart.items.map((i) => ({
      _id: i._id,
      qty: i.qty,
      priceSnapshot: i.priceSnapshot,
      product: {
        _id: i.product?._id,
        title: i.product?.title,
        category: i.product?.category,
        image: i.product?.image,
      },
    })),
    total: cart.total,
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId, qty = 1 } = await req.json().catch(() => ({}));
  if (!productId) {
    return NextResponse.json({ message: "productId required" }, { status: 400 });
  }

  await connectToDB();

  const product = await Product.findById(productId).lean();
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });

  let cart = await Cart.findOne({ user: session.user.id });
  if (!cart) cart = new Cart({ user: session.user.id, items: [], total: 0 });

  const idx = cart.items.findIndex((i) => i.product.toString() === productId);
  if (idx === -1) {
    cart.items.push({
      product: product._id,
      qty: Math.max(1, Number(qty) || 1),
      priceSnapshot: product.price,
    });
  } else {
    cart.items[idx].qty += Math.max(1, Number(qty) || 1);
  }

  cart.recalc();
  await cart.save();

  return NextResponse.json({ ok: true });
}
