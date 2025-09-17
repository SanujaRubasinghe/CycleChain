// app/api/products/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
// If your file is actually "@/models/product" keep that; most projects use capital P:
import Product from "@/models/product";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Query params (optional):
 *   - q: search text
 *   - category: one of [helmets, locks, bottles, seat-covers, gloves, ebike-cables, chargers, backpacks]
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "").trim().toLowerCase();

    await connectToDB();

    const filter = { inStock: true };
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const products = await Product.find({inStock: true}).sort({ category: 1, title: 1 });


    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 }
    );
  }
}

/**
 * DEV ONLY: seed if empty. Remove or protect in prod.
 * Uses IMAGE_BASE_URL (optional) for absolute image URLs.
 * If not set, images are assumed to be in client/public/store/** as relative paths.
 */
export async function POST() {
  try {
    await connectToDB();
    const count = await Product.countDocuments();
    if (count > 0) {
      return NextResponse.json({ seeded: false, reason: "already seeded" });
    }

    // If your images live on the admin server (or a CDN), set IMAGE_BASE_URL in .env.local
    // e.g. IMAGE_BASE_URL=http://localhost:3000
    const base = (process.env.IMAGE_BASE_URL || "").replace(/\/$/, "");

    const rel = (p) => (base ? `${base}${p}` : p);

    const seed = [
      {
        title: "Aero Helmet",
        slug: "aero-helmet",
        category: "helmets",
        price: 12000,
        inStock: true,
        image: rel("/store/helmets/aero.jpg"),
      },
      {
        title: "City Lock",
        slug: "city-lock",
        category: "locks",
        price: 4500,
        inStock: true,
        image: rel("/store/locks/city-lock.jpg"),
      },
      {
        title: "Thermo Bottle",
        slug: "thermo-bottle",
        category: "bottles",
        price: 2500,
        inStock: true,
        image: rel("/store/bottles/thermo.jpg"),
      },
      {
        title: "Gel Seat Cover",
        slug: "gel-seat-cover",
        category: "seat-covers",
        price: 3900,
        inStock: true,
        image: rel("/store/seat-covers/gel.jpg"),
      },
      {
        title: "Grip Gloves",
        slug: "grip-gloves",
        category: "gloves",
        price: 3200,
        inStock: true,
        image: rel("/store/gloves/grip.jpg"),
      },
      {
        title: "E-Bike Cable",
        slug: "ebike-cable",
        category: "ebike-cables",
        price: 5400,
        inStock: true,
        image: rel("/store/ebike-cables/cable.jpg"),
      },
      {
        title: "E-Bike Charger 48V",
        slug: "ebike-charger-48v",
        category: "chargers",
        price: 18500,
        inStock: true,
        image: rel("/store/chargers/48v.jpg"),
      },
      {
        title: "Commuter Backpack",
        slug: "commuter-backpack",
        category: "backpacks",
        price: 16500,
        inStock: true,
        image: rel("/store/backpacks/commuter.jpg"),
      },
    ].map((p) => ({
      ...p,
      category: String(p.category || "").toLowerCase(),
    }));

    await Product.insertMany(seed);
    return NextResponse.json({ seeded: true });
  } catch (err) {
    console.error("POST /api/products seed error:", err);
    return NextResponse.json({ message: "Failed to seed" }, { status: 500 });
  }
}
