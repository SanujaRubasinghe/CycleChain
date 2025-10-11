"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  // Fetch reservation + payment status
  useEffect(() => {
    if (reservationId) fetchReservationDetails();
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reservation/${reservationId}`);
      if (!res.ok) throw new Error("Failed to fetch reservation");

      const data = await res.json();
      setReservation(data);

      console.log("Fetched reservation:", data);

      // fetch latest payment status
      const paymentRes = await fetch(`/api/payment/${reservationId}/status`);
      if (paymentRes.ok) {
        const paymentsData = await paymentRes.json();
        if (paymentsData.payments && paymentsData.payments.length > 0) {
          const latestPayment = paymentsData.payments[0];
          setPayment(latestPayment);
          setMethod(latestPayment.method);
          setPaymentStatus(latestPayment.status);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start payment
  const startPayment = async (selectedMethod) => {
    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/payment/${reservationId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: selectedMethod, amount: reservation.cost }),
      });

      if (!res.ok) throw new Error("Failed to start payment");
      const data = await res.json();
      setPayment(data.payment);
      setMethod(selectedMethod);
      setPaymentStatus("pending");

      // Auto-handle Stripe redirect if card
      if (selectedMethod === "card") {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Confirm payment
  const confirmPayment = async (success = true) => {
    if (!payment) return;

    setPaymentProcessing(true);

    try {
      let txHash = null;

      // Handle crypto via MetaMask
      if (method === "crypto" && success) {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: process.env.NEXT_PUBLIC_RECEIVER_WALLET,
          value: ethers.utils.parseEther("0.01"), // example amount
        });

        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed:", tx.hash);

        txHash = tx.hash;
      }

      const res = await fetch(`/api/payment/${reservationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment._id,
          success,
          txHash,
        }),
      });

      if (!res.ok) throw new Error("Failed to confirm payment");
      const data = await res.json();
      setPaymentStatus(data.status);
      if (success) fetchReservationDetails();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading reservation...</p>
      </div>
    );
  }

  // Error / Not found
  if (error || !reservation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Reservation Not Found
          </h2>
          <p className="mb-4 text-gray-600">
            {error || "The reservation you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container max-w-4xl px-4 mx-auto">
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          {/* Header */}
          <div className="px-6 py-4 text-white bg-green-600">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="opacity-90">
              Complete your payment to secure your bike rental
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
            {/* Reservation & Payment */}
            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Reservation Details
              </h2>
              <p>
                <span className="font-medium">Bike:</span> {reservation.bikeId}
              </p>
              <p>
                <span className="font-medium">Start:</span>{" "}
                {new Date(reservation.start_time).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">End:</span>{" "}
                {new Date(reservation.end_time).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Distance:</span> {reservation.distance} km
              </p>
              <p>
                <span className="font-medium">Cost:</span> LKR {reservation.cost}
              </p>

              <div className="mt-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  Select Payment Method
                </h2>

                {paymentStatus === "completed" ? (
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <span className="font-medium text-green-800">
                      Payment Completed Successfully
                    </span>
                  </div>
                ) : !method ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <button
                      onClick={() => startPayment("crypto")}
                      disabled={paymentProcessing}
                      className="p-4 transition border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50"
                    >
                      <span className="font-medium">Crypto</span>
                    </button>
                    <button
                      onClick={() => startPayment("card")}
                      disabled={paymentProcessing}
                      className="p-4 transition border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50"
                    >
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => startPayment("qr")}
                      disabled={paymentProcessing}
                      className="p-4 transition border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50"
                    >
                      <span className="font-medium">QR Code</span>
                    </button>
                  </div>
                ) : method === "qr" ? (
                  <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                    <h3 className="mb-2 text-lg font-medium text-gray-800">
                      Scan QR to Pay
                    </h3>
                    <img src={payment?.qrCodeData} alt="QR Code" className="mx-auto w-48 h-48" />
                    <button
                      onClick={() => confirmPayment(true)}
                      disabled={paymentProcessing}
                      className="mt-4 px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Mark as Paid
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                    <h3 className="mb-2 text-lg font-medium text-gray-800">
                      Paying with {method}
                    </h3>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => confirmPayment(true)}
                        disabled={paymentProcessing}
                        className="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        {paymentProcessing ? "Processing..." : "Complete Payment"}
                      </button>
                      <button
                        onClick={() => confirmPayment(false)}
                        disabled={paymentProcessing}
                        className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        {paymentProcessing ? "Processing..." : "Payment Failed"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 rounded-lg bg-gray-50 h-fit">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Order Summary
              </h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Bike:</span>
                  <span>{reservation.bikeId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{reservation.distance} km</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>LKR {reservation.cost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
