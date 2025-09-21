"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";

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
    setPaymentProcessing(true);

    try {
      let txHash = null;

      // ✅ If crypto method, trigger MetaMask transaction
      if (method === "crypto" && success) {
        if (!window.ethereum) {
          throw new Error("MetaMask not installed");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        // Example: send 0.01 ETH → replace with dynamic cost if needed
        const tx = await signer.sendTransaction({
          to: process.env.NEXT_PUBLIC_RECEIVER_WALLET, // ✅ must be set in .env
          value: ethers.parseEther("0.01"),
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
          paymentId: payment.paymentId,
          success,
          txHash, // ✅ include blockchain tx hash
        }),
      });

      if (!res.ok) throw new Error("Failed to confirm payment");

      const data = await res.json();
      setPayment(data);
      setPaymentStatus(data.status);

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

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading reservation details...</p>
      </div>
    );
  }

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
            <p className="opacity-90">Complete your payment to secure your bike rental</p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
            {/* Reservation Details */}
            <div className="lg:col-span-2">
              {/* ... keep your reservation details UI ... */}

              {/* Payment Methods */}
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
              {/* ... keep your order summary UI ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
