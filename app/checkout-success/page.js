"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payment/checkout/${paymentId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setPayment(data);

        console.log("Payment data:", data);

      } catch (err) {
        console.error("Failed to fetch payment:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) fetchPayment();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        {loading ? (
          <p className="text-green-700 font-medium">Loading…</p>
        ) : payment ? (
          <>
            <h2 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h2>
            <p className="text-green-800 font-semibold mb-6">
              Payment ID: {payment._id}
            </p>
            <p className="text-green-700 mb-6">Total Paid: LKR {payment.amount}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-xl transition"
            >
              Continue to Home
            </button>
          </>
        ) : (
          <p className="text-red-500 font-medium">Payment details not found.</p>
        )}
      </div>
    </div>
  );
}
