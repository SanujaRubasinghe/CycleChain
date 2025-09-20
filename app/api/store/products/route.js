import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category");
  const q = searchParams.get("q");

  const filter = { isActive: true };
  if (cat) filter.category = cat;
  if (q) filter.name = { $regex: q, $options: "i" };

  const products = await Product.find(filter).sort({ createdAt: -1 });
  return Response.json(products);
}
