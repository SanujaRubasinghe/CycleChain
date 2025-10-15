"use client";

import { useRouter } from "next/navigation";

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h2>
        <p className="text-red-500 mb-6">
          You have cancelled the payment. No charges were made.
        </p>
        <button
          onClick={() => router.push("/checkout")}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-xl transition"
        >
          Return to Checkout
        </button>
      </div>
    </div>
  );
}
