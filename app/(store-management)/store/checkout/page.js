"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  // Fetch cart from server
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/store-cart", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();

        const total =
          data.total ??
          (data.items?.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0) || 0);

        setCart({ items: data.items || [], total });
      } catch (err) {
        console.error("Failed to fetch cart:", err.message);
      }
    };

    fetchCart();
  }, []);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/store-cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: cart.items, total: cart.total, method }),
      });

      if (!res.ok) throw new Error("Payment failed");
      const data = await res.json();

      if (method === "card") {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else if (method === "qr") {
        setQrUrl(data.qrUrl);
      } else if (method === "crypto") {
        window.open(data.paymentUrl, "_blank");
      }
    } catch (err) {
      alert(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Checkout</h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Payment Section */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Payment Method</h3>

            <div className="space-y-3">
              {["card", "crypto", "qr"].map((m) => (
                <label
                  key={m}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer ${
                    method === m ? "border-green-700 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="mr-3"
                  />
                  {m === "card" && "Credit/Debit Card (Stripe)"}
                  {m === "crypto" && "Crypto"}
                  {m === "qr" && "Bank App QR"}
                </label>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Processing…" : `Pay LKR ${cart.total}`}
            </button>

            {qrUrl && (
              <div className="mt-6 flex justify-center">
                <img src={qrUrl} alt="Scan QR to pay" className="w-64 h-64" />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex-1 bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Order Summary</h3>

            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between mb-3">
                <span>
                  {item.product?.title} x {item.qty}
                </span>
                <span>LKR {item.priceSnapshot * item.qty}</span>
              </div>
            ))}

            <hr className="my-3 border-green-200" />

            <div className="flex justify-between font-bold text-green-800 text-lg">
              <span>Total</span>
              <span>LKR {cart.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
