"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const reservationId = searchParams.get("reservationId");
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (!paymentId || !reservationId) {
          console.error("Missing paymentId or reservationId");
          setLoading(false);
          return;
        }

        // First, confirm the payment if it's not already completed
        const confirmRes = await fetch(`/api/payment/${reservationId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            paymentId: paymentId,
            success: true,
          }),
        });

        if (!confirmRes.ok) {
          console.error("Failed to confirm payment");
        }

        // Fetch payment status
        const paymentRes = await fetch(`/api/payment/${reservationId}/status`, {
          credentials: "include",
        });
        
        if (!paymentRes.ok) {
          throw new Error("Failed to fetch payment status");
        }

        const paymentData = await paymentRes.json();
        console.log("Payment data:", paymentData);

        // Find the specific payment by ID
        const specificPayment = paymentData.payments?.find(
          (p) => p._id === paymentId
        );

        if (specificPayment) {
          setPayment(specificPayment);
        }

        // Fetch reservation details
        const reservationRes = await fetch(`/api/reservation/${reservationId}`, {
          credentials: "include",
        });

        if (reservationRes.ok) {
          const reservationData = await reservationRes.json();
          setReservation(reservationData);
        }
      } catch (err) {
        console.error("Failed to fetch payment details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, reservationId]);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-lg p-8 text-center bg-white shadow-lg rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium text-gray-700">Loading payment details...</p>
          </div>
        ) : payment ? (
          <>
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-green-700">
              Payment Successful!
            </h2>
            <p className="mb-2 text-gray-600">
              Your bike reservation payment has been processed successfully.
            </p>
            
            {reservation && (
              <div className="p-4 mt-6 text-left bg-gray-50 rounded-lg">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Reservation Details
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Bike ID:</span>
                    <span>{reservation.bikeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="font-semibold text-green-700">
                      LKR {payment.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Method:</span>
                    <span className="capitalize">{payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {payment.status}
                    </span>
                  </div>
                  {payment.transactionId && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <span className="block mb-1 text-xs font-medium text-gray-600">
                        Transaction ID:
                      </span>
                      <span className="block text-xs text-gray-800 break-all">
                        {payment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Go to Home
              </button>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="flex-1 px-6 py-3 font-semibold text-green-700 transition bg-white border-2 border-green-600 hover:bg-green-50 rounded-xl"
              >
                View Dashboard
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Payment Details Not Found
            </h2>
            <p className="mb-6 text-gray-600">
              We couldn't find the payment details. Please check your dashboard or contact support.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-gray-600 hover:bg-gray-700 rounded-xl"
              >
                Go to Home
              </button>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-xl"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
