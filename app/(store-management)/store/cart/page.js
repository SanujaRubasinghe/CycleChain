"use client";

import { useEffect, useState } from "react";

// --- Eco Impact Component ---
function EcoImpact({ itemsCount }) {
  const avoided = (itemsCount * 0.35).toFixed(1);

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
      <h3 className="text-green-800 font-semibold text-lg">Good for you. Good for the city.</h3>
      <p className="text-green-600 text-sm mt-2">
        Choosing cycling accessories reduces car trips and CO₂. Keep it up! 💚
      </p>
      <div className="mt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-green-700">Items in this order</span>
          <span className="font-semibold">{itemsCount}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-green-700">Estimated CO₂ avoided*</span>
          <span className="font-semibold">~{avoided} kg</span>
        </div>
      </div>
      <p className="text-xs text-green-600/80 mt-2">
        *Rough indicative value. Actual impact varies by usage.
      </p>
    </div>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- API helpers ---
  const cartGet = async () => {
    const r = await fetch("/api/store-cart", { credentials: "include" });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || "Failed to load cart");
    return r.json();
  };
  const cartUpdate = (id, qty) =>
    fetch(`/api/store-cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ qty }),
    }).then((r) => r.json());
  const cartRemove = (id) =>
    fetch(`/api/store-cart/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json());
  const cartClear = () =>
    fetch("/api/store-cart/clear", { method: "POST", credentials: "include" }).then((r) => r.json());
  const cartCheckout = () =>
    fetch("/api/store-cart/checkout", { method: "POST", credentials: "include" }).then((r) => r.json());

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await cartGet();
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        total: Number(data.total) || 0,
      });
    } catch (e) {
      setErr(e.message || "Failed to load cart");
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (id, next) => {
    if (next < 1) return;
    const prev = cart;
    setCart({
      ...cart,
      items: cart.items.map((i) => (i._id === id ? { ...i, qty: next } : i)),
      total: cart.items.reduce(
        (s, i) => s + (i._id === id ? i.priceSnapshot * next : i.priceSnapshot * i.qty),
        0
      ),
    });
    try {
      const data = await cartUpdate(id, next);
      setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
    } catch {
      setCart(prev);
    }
  };

  const removeItem = async (id) => {
    const data = await cartRemove(id);
    setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
  };

  const clear = async () => {
    const data = await cartClear();
    setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
  };

  const checkout = async () => {
    const payload = await cartCheckout();
    if (payload?.orderId) {
      alert(`Order ${payload.orderId}\nTotal LKR ${payload.total}`);
    }
  };

  const items = Array.isArray(cart.items) ? cart.items : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-green-700">My Cart</h2>
          <a href="/store" className="text-green-600 hover:underline font-medium">
            Continue shopping
          </a>
        </div>

        {loading && <div className="text-green-700 font-medium">Loading…</div>}
        {err && <div className="text-red-500 font-medium">{err}</div>}

        {!loading && items.length === 0 && !err && (
          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
            <span>Your cart is empty. Visit <a className="underline text-green-600" href="/store">Store</a>.</span>
          </div>
        )}

        {/* Cart Layout */}
        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items List */}
            <section className="lg:col-span-2 space-y-4">
              {items.map((it) => {
                const price = it.priceSnapshot ?? 0;
                const qty = it.qty ?? 1;
                const title = it.product?.title ?? "Product";
                const category = it.product?.category ?? "";
                const image = it.product?.image;

                return (
                  <div key={it._id} className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-green-200">
                      {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : null}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm text-green-600">{category}</div>
                          <div className="font-semibold text-green-800">{title}</div>
                          <div className="text-green-700 text-sm">LKR {price}</div>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-600 font-medium"
                          onClick={() => removeItem(it._id)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Qty Stepper */}
                        <div className="flex items-center border border-green-200 rounded-xl overflow-hidden">
                          <button
                            className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100"
                            onClick={() => updateQty(it._id, qty - 1)}
                          >
                            –
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) =>
                              updateQty(it._id, Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-16 text-center outline-none py-2"
                          />
                          <button
                            className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100"
                            onClick={() => updateQty(it._id, qty + 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right ml-auto">
                          <div className="text-green-700 text-sm">Subtotal</div>
                          <div className="text-green-800 font-semibold">LKR {price * qty}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="bg-white rounded-2xl shadow-md p-6 h-fit lg:sticky lg:top-6">
              <h4 className="text-green-800 font-semibold text-lg mb-4">Order Summary</h4>

              <div className="flex justify-between py-2 border-b border-green-200">
                <span className="text-green-700">Items</span>
                <span>{items.reduce((s, i) => s + (i.qty ?? 0), 0)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-green-700">Total</span>
                <span className="text-xl font-bold text-green-800">LKR {cart.total}</span>
              </div>

              <button
                className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition"
                onClick={checkout}
                disabled={items.length === 0}
              >
                Checkout
              </button>
              <button
                className="w-full mt-2 border border-green-700 text-green-700 hover:bg-green-50 font-semibold py-2 rounded-lg transition"
                onClick={clear}
                disabled={items.length === 0}
              >
                Clear Cart
              </button>

              {/* Eco Impact */}
              <EcoImpact itemsCount={items.reduce((s, i) => s + (i.qty ?? 0), 0)} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
