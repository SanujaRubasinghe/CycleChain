"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CheckoutSuccessContent() {
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
        setPayment(data.payment);

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
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-lg p-8 text-center bg-white shadow-lg rounded-2xl">
        {loading ? (
          <p className="font-medium text-green-700">Loading…</p>
        ) : payment ? (
          <>
            <h2 className="mb-4 text-3xl font-bold text-green-700">Payment Successful!</h2>
            <p className="mb-6 font-semibold text-green-800">
              Payment ID: {payment.id}
            </p>
            <p className="mb-6 text-green-700">Total Paid: LKR {payment.total}</p>
            <button
              onClick={() => router.push("/store")}
              className="px-6 py-2 font-semibold text-white transition bg-green-700 hover:bg-green-800 rounded-xl"
            >
              Continue to Home
            </button>
          </>
        ) : (
          <p className="font-medium text-red-500">Payment details not found.</p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
          <p className="text-green-700 font-medium">Loading payment details...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
