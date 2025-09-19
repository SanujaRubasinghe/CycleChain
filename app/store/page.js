"use client";

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

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = cat === "all" || p.category === cat;
      const qOk =
        !query ||
        p.title?.toLowerCase().includes(query) ||
        LABEL[p.category || ""]?.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [products, q, cat]);

  // --- minimal addition: add to cart helper ---
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

      window.location.href = "/cart";
    } catch (e) {
      alert(e.message || "Could not add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Cycle Store</h1>
            <p className="text-subtext">Find accessories for your ride.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              className="input w-full sm:w-72"
              placeholder="Search items…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="input"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              title="Category filter"
            >
              <option value="all">All categories</option>
              <option value="helmets">Helmets</option>
              <option value="locks">Bike Locks</option>
              <option value="bottles">Water Bottles</option>
              <option value="seat-covers">Seat Covers</option>
              <option value="gloves">Gloves</option>
              <option value="ebike-cables">E-Bike Cables</option>
              <option value="chargers">Chargers</option>
              <option value="backpacks">Backpacks</option>
            </select>
            <a href="/cart" className="btn btn-primary">Cart</a>
          </div>
        </div>

        {loading && <div className="card p-4">Loading…</div>}
        {err && <div className="card p-4 text-red-400">{err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="card p-4">No items match your filter.</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((p) => (
            <article key={p._id} className="card p-4 flex flex-col">
              <div className="h-44 rounded-xl bg-surface border border-border overflow-hidden mb-3">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-subtext">
                    No image
                  </div>
                )}
              </div>

              <div className="text-sm text-subtext">{LABEL[p.category] || p.category}</div>
              <h3 className="text-lg font-medium text-white line-clamp-2">{p.title}</h3>
              <div className="mt-1">LKR {p.price}</div>

              {/* minimal change: use button to call addToCart */}
              <button
                type="button"
                className="btn btn-primary mt-4"
                onClick={() => addToCart(p._id)}
              >
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
