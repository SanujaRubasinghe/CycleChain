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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 bg-clip-text text-transparent">🚴 Cycle Store</h1>
            <p className="text-gray-600 mt-2 text-lg">Premium accessories for your electric bike journey</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Search accessories…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full sm:w-80 border-2 border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="border-2 border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            >
              <option value="all">All categories</option>
              {Object.keys(LABEL).map((key) => (
                <option key={key} value={key}>{LABEL[key]}</option>
              ))}
            </select>
            <a
              href="/store/cart"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl px-6 py-3 flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
            >
              🛒 Cart
            </a>
          </div>
        </div>

        {/* Loading/Error */}
        {loading && <div className="text-green-600 font-medium text-center py-8">⏳ Loading premium products...</div>}
        {err && <div className="text-red-500 font-medium text-center py-8 bg-red-50 rounded-xl border border-red-200">{err}</div>}
        {!loading && !err && filteredItems.length === 0 && (
          <div className="text-gray-600 font-medium text-center py-8">No items match your search. Try adjusting your filters!</div>
        )}

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {filteredItems.map((p) => (
            <article
              key={p._id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:scale-105 border border-green-100 hover:border-green-200"
            >
              <div className="relative h-56 bg-gradient-to-br from-green-50 to-white border-b border-green-200 overflow-hidden">
                {p.image ? (
                  <img
                    src={`http://localhost:3001${p.image}`}
                    alt={p.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    📦
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {LABEL[p.category] || p.category}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mt-1 line-clamp-2 leading-tight">{p.title}</h3>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-3">LKR {p.price}</div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(p._id)}
                  className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add to Cart 🛒
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
