"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- Eco Impact Component ---
function EcoImpact({ itemsCount }) {
  const avoided = (itemsCount * 0.35).toFixed(1);

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
      <h3 className="text-green-800 font-semibold text-lg">
        Good for you. Good for the city.
      </h3>
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

// --- Cart Item Component ---
function CartItem({ item, onUpdate, onRemove }) {
  const price = item.priceSnapshot ?? 0;
  const qty = item.qty ?? 1;
  const title = item.product?.title ?? "Product";
  const category = item.product?.category ?? "";
  const image = item.product?.image;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
      <div className="w-24 h-24 rounded-xl overflow-hidden border border-green-200">
        {image && <img src={`http://localhost:3001${image}`} alt={title} className="w-full h-full object-cover" />}
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
            onClick={() => onRemove(item._id)}
          >
            Remove
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Qty Stepper */}
          <div className="flex items-center border border-green-200 rounded-xl overflow-hidden">
            <button
              className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100"
              onClick={() => onUpdate(item._id, qty - 1)}
            >
              –
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => onUpdate(item._id, Math.max(1, Number(e.target.value) || 1))}
              className="w-16 text-center outline-none py-2"
            />
            <button
              className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100"
              onClick={() => onUpdate(item._id, qty + 1)}
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
}

// --- Cart Summary Component ---
function CartSummary({ items, total, onCheckout, onClear }) {
  const itemsCount = items.reduce((sum, i) => sum + (i.qty ?? 0), 0);

  return (
    <aside className="bg-white rounded-2xl shadow-md p-6 h-fit lg:sticky lg:top-6">
      <h4 className="text-green-800 font-semibold text-lg mb-4">Order Summary</h4>

      <div className="flex justify-between py-2 border-b border-green-200">
        <span className="text-green-700">Items</span>
        <span>{itemsCount}</span>
      </div>

      <div className="flex justify-between py-3">
        <span className="text-green-700">Total</span>
        <span className="text-xl font-bold text-green-800">LKR {total ?? 0}</span>
      </div>

      <button
        className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition"
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        Checkout
      </button>

      <button
        className="w-full mt-2 border border-green-700 text-green-700 hover:bg-green-50 font-semibold py-2 rounded-lg transition"
        onClick={onClear}
        disabled={items.length === 0}
      >
        Clear Cart
      </button>

      <EcoImpact itemsCount={itemsCount} />
    </aside>
  );
}

// --- Main Cart Page ---
export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const router = useRouter()

  // --- API helper ---
  const api = {
    get: async () => (await fetch("/api/store-cart", { credentials: "include" })).json(),
    update: async (id, qty) =>
      (
        await fetch(`/api/store-cart/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ qty }),
        })
      ).json(),
    remove: async (id) =>
      (
        await fetch(`/api/store-cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      ).json(),
    clear: async () =>
      (await fetch("/api/store-cart/clear", { method: "POST", credentials: "include" })).json(),
    checkout: async () =>
      router.push(`/store/checkout`),
  };

  // --- Load cart ---
  const loadCart = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await api.get();
      setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
    } catch (e) {
      setErr(e.message || "Failed to load cart");
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  // --- Handlers ---
  const handleUpdate = async (id, qty) => {
    if (qty < 1) return;

    // Optimistic update
    setCart((prev) => {
      const newItems = prev.items.map(i => i._id === id ? { ...i, qty } : i);
      const total = newItems.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0);
      return { ...prev, items: newItems, total };
    });

    console.log(cart)

    try {
      const data = await api.update(id, qty);
      setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
    } catch { loadCart(); }
  };

  const handleRemove = async (id) => { try { const data = await api.remove(id); setCart({ items: data.items ?? [], total: Number(data.total) || 0 }); } catch { loadCart(); } };
  const handleClear = async () => { try { const data = await api.clear(); setCart({ items: data.items ?? [], total: Number(data.total) || 0 }); } catch { loadCart(); } };
  const handleCheckout = async () => {
    try {
      const payload = await api.checkout();
      if (payload?.orderId) {
        alert(`Order ${payload.orderId}\nTotal LKR ${payload.total}`);
        await loadCart();
      }
    } catch (e) { alert(e.message || "Checkout failed"); }
  };

  const items = cart.items ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-green-700">My Cart</h2>
          <a href="/store" className="text-green-600 hover:underline font-medium">Continue shopping</a>
        </div>

        {loading && <div className="text-green-700 font-medium">Loading…</div>}
        {err && <div className="text-red-500 font-medium">{err}</div>}

        {!loading && items.length === 0 && !err && (
          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
            <span>Your cart is empty. Visit <a href="/store" className="underline text-green-600">Store</a>.</span>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <CartItem key={it._id} item={it} onUpdate={handleUpdate} onRemove={handleRemove} />
              ))}
            </section>

            <CartSummary items={items} total={cart.total} onCheckout={handleCheckout} onClear={handleClear} />
          </div>
        )}
      </div>
    </div>
  );
}
