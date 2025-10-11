"use client";

import { NEXT_ACTION_NOT_FOUND_HEADER } from "next/dist/client/components/app-router-headers";
import { useEffect, useState, useMemo } from "react";

const LABEL = {
  helmets: "Helmets",
  locks: "Bike Locks",
  bottles: "Water Bottles",
  "seat-covers": "Seat Covers",
  gloves: "Gloves",
  "ebike-cables": "E-Bike Cables",
  chargers: "Chargers",
  backpacks: "Backpacks",
};

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/products", { cache: "no-store" });
        if (!r.ok) throw new Error("Failed to load products");
        const data = await r.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredItems = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = cat === "all" || p.category === cat;
      const queryOk =
        !query ||
        p.title?.toLowerCase().includes(query) ||
        LABEL[p.category || ""]?.toLowerCase().includes(query);
      return catOk && queryOk;
    });
  }, [products, q, cat]);

  const addToCart = async (productId) => {
    try {
      const res = await fetch("/api/store-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, qty: 1 }),
      });
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=/store";
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to add to cart");
      }
      window.location.href = "/store/cart";
    } catch (e) {
      alert(e.message || "Could not add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-green-700">Cycle Store</h1>
            <p className="text-green-600 mt-1">Find all the accessories for your ride</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search items…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input w-full sm:w-72 border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="input border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="all">All categories</option>
              {Object.keys(LABEL).map((key) => (
                <option key={key} value={key}>{LABEL[key]}</option>
              ))}
            </select>
            <a
              href="/store/cart"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center transition"
            >
              Cart
            </a>
          </div>
        </div>

        {/* Loading/Error */}
        {loading && <div className="text-green-700 font-medium">Loading products...</div>}
        {err && <div className="text-red-500 font-medium">{err}</div>}
        {!loading && !err && filteredItems.length === 0 && (
          <div className="text-green-700 font-medium">No items match your search.</div>
        )}

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredItems.map((p) => (
            <article
              key={p._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden flex flex-col"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 border-b border-green-200">
                {p.image ? (
                  <img
                    src={`http://localhost:3001${p.image}`}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-sm text-green-600 font-medium">{LABEL[p.category] || p.category}</span>
                  <h3 className="text-lg font-semibold text-green-700 mt-1 line-clamp-2">{p.title}</h3>
                  <div className="text-green-700 font-bold mt-2">LKR {p.price}</div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(p._id)}
                  className="mt-4 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
