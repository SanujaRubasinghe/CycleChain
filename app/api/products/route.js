import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/** GET /api/products — public list for store */
export async function GET() {
  await dbConnect();
  const products = await Product.find({ inStock: true })
    .sort({ category: 1, title: 1 })
    .lean();

  return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
}