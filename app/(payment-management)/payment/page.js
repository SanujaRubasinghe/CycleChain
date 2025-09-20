"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reservation/${reservationId}`);
      if (!res.ok) throw new Error("Failed to fetch reservation");

      const data = await res.json();
      setReservation(data);

      const paymentRes = await fetch(`/api/payment/${reservationId}`);
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setPayment(paymentData[0]);
        if (paymentData[0].method) setMethod(paymentData[0].method);
        if (paymentData[0].status) setPaymentStatus(paymentData[0].status);
      } else {
        console.log("no payment found");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async (selectedMethod) => {
    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/payment/${reservationId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: selectedMethod }),
      });

      if (!res.ok) throw new Error("Failed to initiate payment");

      const data = await res.json();
      setPayment(data);
      setMethod(selectedMethod);
      setPaymentStatus("pending");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const confirmPayment = async (success = true) => {
    if (!payment) return;

    console.log(payment)

    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/payment/${reservationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.paymentId,
          success,
        }),
      });

      if (!res.ok) throw new Error("Failed to confirm payment");

      const data = await res.json();
      setPayment(data);
      setPaymentStatus(data.status);

      // Refresh reservation data
      if (success) {
        fetchReservationDetails();
        sessionStorage.setItem("hasActiveReservation", "false");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Reservation Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The reservation you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="opacity-90">
              Complete your payment to secure your bike rental
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Reservation Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Reservation ID</p>
                    <p className="font-medium">{reservation.session_id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Bike ID</p>
                    <p className="font-medium">{reservation.bikeId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">
                      {new Date(reservation.start_time).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">
                      {new Date(reservation.end_time).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {(() => {
                        const ms =
                          new Date(reservation.end_time) -
                          new Date(reservation.start_time);
                        const hours = Math.floor(ms / (1000 * 60 * 60));
                        const minutes = Math.round(
                          (ms % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        if (hours > 0) {
                          return `${hours} hour${hours > 1 ? "s" : ""}${
                            minutes > 0
                              ? ` ${minutes} min${minutes > 1 ? "s" : ""}`
                              : ""
                          }`;
                        } else {
                          return `${minutes} min${minutes !== 1 ? "s" : ""}`;
                        }
                      })()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">
                      {reservation.status}
                    </p>
                  </div>

                  {reservation.distance && (
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-medium">
                        {reservation.distance.toFixed(2)} km
                      </p>
                    </div>
                  )}
                </div>

                {reservation.start_location && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium">
                      {reservation.start_location.lat.toFixed(6)},{" "}
                      {reservation.start_location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Select Payment Method
                </h2>

                {paymentStatus === "completed" ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-800 font-medium">
                        Payment Completed Successfully
                      </span>
                    </div>
                  </div>
                ) : paymentStatus === "failed" ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-800 font-medium">
                        Payment Failed. Please try again.
                      </span>
                    </div>
                    <button
                      onClick={() => setPaymentStatus("")}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Try another payment method
                    </button>
                  </div>
                ) : !method ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => startPayment("crypto")}
                      disabled={paymentProcessing}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex flex-col items-center justify-center disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-yellow-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="font-medium">Crypto</span>
                      <span className="text-sm text-gray-500">
                        Pay with cryptocurrency
                      </span>
                    </button>

                    <button
                      onClick={() => startPayment("card")}
                      disabled={paymentProcessing}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex flex-col items-center justify-center disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-blue-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-medium">Card</span>
                      <span className="text-sm text-gray-500">
                        Credit/Debit card
                      </span>
                    </button>

                    <button
                      onClick={() => startPayment("qr")}
                      disabled={paymentProcessing}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex flex-col items-center justify-center disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-green-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      <span className="font-medium">QR Code</span>
                      <span className="text-sm text-gray-500">Scan to pay</span>
                    </button>
                  </div>
                ) : method === "qr" && payment?.qrCodeData ? (
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Scan QR Code to Pay
                    </h3>
                    <div className="inline-block p-4 bg-white rounded-lg shadow-md mb-4">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                          payment.qrCodeData
                        )}&size=200x200`}
                        alt="Payment QR Code"
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code with your payment app to complete the
                      transaction
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => confirmPayment(true)}
                        disabled={paymentProcessing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {paymentProcessing ? "Processing..." : "I've Paid"}
                      </button>
                      <button
                        onClick={() => setMethod("")}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Paying with {method}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Complete your payment using the selected method
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => confirmPayment(true)}
                        disabled={paymentProcessing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {paymentProcessing
                          ? "Processing..."
                          : "Complete Payment"}
                      </button>
                      <button
                        onClick={() => confirmPayment(false)}
                        disabled={paymentProcessing}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {paymentProcessing ? "Processing..." : "Payment Failed"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee</span>
                  <span className="font-medium">
                    LKR {reservation.cost?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    LKR {(reservation.cost * 0.05)?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">
                    Total
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    LKR{" "}
                    {(
                      (reservation.cost || 0) + (reservation.cost * 0.05 || 0)
                    )?.toFixed(2)}
                  </span>
                </div>
              </div>

              {paymentStatus === "completed" && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-green-700">
                    You will receive an email
                    confirmation shortly.
                  </p>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
