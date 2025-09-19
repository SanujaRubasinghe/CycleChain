import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/** GET /api/products — public list for store */
export async function GET() {
  await connectToDB();
  const products = await Product.find({ inStock: true })
    .sort({ category: 1, title: 1 })
    .lean();

  return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
}
