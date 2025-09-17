import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust if your auth route lives elsewhere
import { connectToDB } from "@/lib/db";
import Product from "@/models/product"; // or "@/models/product"
import Cart from "@/models/cart";
import { serializeCart } from "./_helpers";

export const dynamic = "force-dynamic";

// GET current user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();

  let cart = await Cart.findOne({ user: session.user.id }).populate("items.product").lean();
  if (!cart) {
    cart = await Cart.create({ user: session.user.id, items: [] });
    cart = await Cart.findOne({ _id: cart._id }).populate("items.product").lean();
  }

  return NextResponse.json(serializeCart(cart), { headers: { "Cache-Control": "no-store" } });
}

// POST add item { productId, qty }
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const productId = body.productId;
  const qty = Math.max(1, Number(body.qty) || 1);

  if (!productId) {
    return NextResponse.json({ message: "productId required" }, { status: 400 });
  }

  await connectToDB();

  const product = await Product.findById(productId).lean();
  if (!product || product.inStock === false) {
    return NextResponse.json({ message: "Product not available" }, { status: 404 });
  }

  let cart = await Cart.findOne({ user: session.user.id });
  if (!cart) cart = await Cart.create({ user: session.user.id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === product._id.toString());
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({
      product: product._id,
      qty,
      priceSnapshot: Number(product.price) || 0,
    });
  }

  await cart.save();
  await cart.populate("items.product");

  return NextResponse.json(serializeCart(cart), { status: 201 });
}
