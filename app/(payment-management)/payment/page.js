"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";
import { convertLkrToEth } from "@/lib/currencyConverter";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

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
  const [txHash, setTxHash] = useState("");

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
          if (latestPayment.transactionId) {
            setTxHash(latestPayment.transactionId);
          }
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
    setError("");
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

        const receiverWallet = process.env.NEXT_PUBLIC_RECEIVER_WALLET;
        if (!receiverWallet || receiverWallet === "0x") {
          throw new Error("Receiver wallet not configured. Please add NEXT_PUBLIC_RECEIVER_WALLET to .env.local");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        // Check and switch to Sepolia if needed
        const targetChainId = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111"; // Sepolia
        const currentChainId = await provider.send("eth_chainId", []);
        const targetChainIdHex = "0x" + parseInt(targetChainId).toString(16);
        
        if (currentChainId !== targetChainIdHex) {
          try {
            await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainIdHex }]);
          } catch (switchError) {
            if (switchError.code === 4902) {
              throw new Error("Sepolia testnet not added to MetaMask. Please add it manually.");
            }
            throw switchError;
          }
        }

        const signer = await provider.getSigner();

        // Convert LKR to ETH
        const ethAmount = await convertLkrToEth(reservation.cost);
        console.log(`Sending ${ethAmount} ETH for ${reservation.cost} LKR`);

        const tx = await signer.sendTransaction({
          to: receiverWallet,
          value: ethers.parseEther(ethAmount),
        });

        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed:", tx.hash);

        txHash = tx.hash;
        setTxHash(tx.hash);
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
                  <div className="p-6 text-center border border-green-200 rounded-lg bg-green-50">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 mx-auto text-green-600"
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
                    <h3 className="mb-2 text-xl font-bold text-green-800">
                      Payment Completed Successfully!
                    </h3>
                    <p className="mb-4 text-sm text-green-700">
                      Your payment has been processed and confirmed.
                    </p>
                    {txHash && (
                      <div className="mb-4 p-3 bg-white border border-green-300 rounded-lg">
                        <p className="mb-1 text-xs font-medium text-gray-600">Transaction Hash:</p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {txHash}
                        </a>
                      </div>
                    )}
                    <button
                      onClick={() => window.location.href = "/"}
                      className="px-6 py-3 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      OK
                    </button>
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
                ) : method === "crypto" ? (
                  <div className="p-6 text-center border-2 border-green-300 border-dashed rounded-lg bg-green-50">
                    <h3 className="mb-2 text-lg font-medium text-gray-800">
                      Pay with MetaMask
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      Amount: {reservation.cost} LKR
                    </p>
                    <p className="mb-4 text-xs text-gray-500">
                      Network: Sepolia Testnet
                    </p>
                    {!window.ethereum && (
                      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          MetaMask not detected. Please install MetaMask extension.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => confirmPayment(true)}
                        disabled={paymentProcessing}
                        className="px-6 py-3 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {paymentProcessing ? "Processing Transaction..." : "Pay with MetaMask"}
                      </button>
                      <button
                        onClick={() => {
                          setMethod("");
                          setPayment(null);
                          setError("");
                        }}
                        disabled={paymentProcessing}
                        className="px-4 py-3 text-gray-700 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                    {error && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
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
