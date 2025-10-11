"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";
import { convertLkrToEth } from "@/lib/currencyConverter";

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
  const [txHash, setTxHash] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardSelection, setShowCardSelection] = useState(false);

  // Fetch reservation + payment status
  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
      fetchSavedCards();
    }
  }, [reservationId]);

  // Fetch saved cards
  const fetchSavedCards = async () => {
    try {
      const res = await fetch("/api/user/cards");
      if (res.ok) {
        const cards = await res.json();
        setSavedCards(cards);
        // Auto-select default card if exists
        const defaultCard = cards.find(card => card.isDefault);
        if (defaultCard) {
          setSelectedCard(defaultCard);
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved cards:", err);
    }
  };

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
    
    // If card method and has saved cards, show selection
    if (selectedMethod === "card" && savedCards.length > 0) {
      setMethod(selectedMethod);
      setShowCardSelection(true);
      return;
    }
    
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

      // Auto-handle Stripe redirect if card (new card)
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

  // Pay with saved card
  const payWithSavedCard = async () => {
    if (!selectedCard) {
      alert("Please select a card");
      return;
    }

    setPaymentProcessing(true);
    setError("");

    try {
      // Create payment record with saved card
      const startRes = await fetch(`/api/payment/${reservationId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          method: "card", 
          amount: reservation.cost,
          savedCardId: selectedCard._id 
        }),
      });

      if (!startRes.ok) throw new Error("Failed to start payment");
      const startData = await startRes.json();
      
      // Set payment data
      setPayment(startData.payment);
      setPaymentStatus("pending");

      // Immediately confirm the payment since card is already saved and validated
      const confirmRes = await fetch(`/api/payment/${reservationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: startData.payment._id,
          success: true,
          txHash: null,
        }),
      });

      if (!confirmRes.ok) throw new Error("Failed to confirm payment");
      const confirmData = await confirmRes.json();
      
      setPaymentStatus(confirmData.status);
      
      // Refresh reservation details
      await fetchReservationDetails();
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your payment to confirm your bike rental</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Reservation & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Reservation Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Bike ID</p>
                  <p className="font-semibold text-gray-800">{reservation.bikeId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Distance</p>
                  <p className="font-semibold text-gray-800">{reservation.distance} km</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Start Time</p>
                  <p className="font-semibold text-gray-800 text-sm">{new Date(reservation.start_time).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">End Time</p>
                  <p className="font-semibold text-gray-800 text-sm">{new Date(reservation.end_time).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>

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
                    {/* Crypto Payment */}
                    <button
                      onClick={() => startPayment("crypto")}
                      disabled={paymentProcessing}
                      className="group relative p-6 transition-all duration-300 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800 text-lg">Cryptocurrency</span>
                        <span className="text-xs text-gray-500 mt-1">Pay with MetaMask</span>
                      </div>
                    </button>

                    {/* Card Payment */}
                    <button
                      onClick={() => startPayment("card")}
                      disabled={paymentProcessing}
                      className="group relative p-6 transition-all duration-300 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-green-50"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800 text-lg">Credit/Debit Card</span>
                        {savedCards.length > 0 ? (
                          <span className="text-xs text-green-600 mt-1 font-medium">
                            {savedCards.length} saved card{savedCards.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 mt-1">Visa, Mastercard, etc.</span>
                        )}
                      </div>
                    </button>

                    {/* QR Payment */}
                    <button
                      onClick={() => startPayment("qr")}
                      disabled={paymentProcessing}
                      className="group relative p-6 transition-all duration-300 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800 text-lg">QR Code</span>
                        <span className="text-xs text-gray-500 mt-1">Scan to pay</span>
                      </div>
                    </button>
                  </div>
                ) : method === "card" && showCardSelection ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                    <div className="flex items-center mb-6">
                      <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-800">
                        Select Your Card
                      </h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {savedCards.map((card) => (
                        <div
                          key={card._id}
                          onClick={() => setSelectedCard(card)}
                          className={`p-5 rounded-xl cursor-pointer transition-all duration-300 transform ${
                            selectedCard?._id === card._id
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105 border-2 border-green-700'
                              : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-green-400 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className={`w-5 h-5 ${selectedCard?._id === card._id ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <div className="font-bold text-lg">{card.cardholderName}</div>
                              </div>
                              <div className={`text-sm font-mono mb-1 ${selectedCard?._id === card._id ? 'opacity-90' : 'opacity-70'}`}>
                                {card.cardNumber}
                              </div>
                              <div className={`text-xs ${selectedCard?._id === card._id ? 'opacity-80' : 'opacity-60'}`}>
                                Expires: {card.expiryMonth}/{card.expiryYear}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {card.isDefault && (
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  selectedCard?._id === card._id
                                    ? 'bg-white bg-opacity-30 text-white'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  Default
                                </span>
                              )}
                              {selectedCard?._id === card._id && (
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={payWithSavedCard}
                        disabled={paymentProcessing || !selectedCard}
                        className="w-full px-6 py-3 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {paymentProcessing ? "Processing Payment..." : `Pay LKR ${reservation.cost} with Selected Card`}
                      </button>
                      
                      <button
                        onClick={async () => {
                          setShowCardSelection(false);
                          setPaymentProcessing(true);
                          try {
                            const res = await fetch(`/api/payment/${reservationId}/start`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ method: "card", amount: reservation.cost }),
                            });
                            if (!res.ok) throw new Error("Failed to start payment");
                            const data = await res.json();
                            setPayment(data.payment);
                            const stripe = await stripePromise;
                            await stripe.redirectToCheckout({ sessionId: data.sessionId });
                          } catch (err) {
                            setError(err.message);
                          } finally {
                            setPaymentProcessing(false);
                          }
                        }}
                        disabled={paymentProcessing}
                        className="w-full px-6 py-3 text-green-700 transition bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
                      >
                        Use a New Card Instead
                      </button>

                      <button
                        onClick={() => {
                          setMethod("");
                          setShowCardSelection(false);
                          setError("");
                        }}
                        disabled={paymentProcessing}
                        className="w-full px-4 py-3 text-gray-700 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Order Summary
                </h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Bike ID</span>
                  <span className="font-semibold text-gray-800">{reservation.bikeId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-semibold text-gray-800">{reservation.distance} km</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {Math.round((new Date(reservation.end_time) - new Date(reservation.start_time)) / (1000 * 60))} mins
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">LKR {reservation.cost}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1">Secure Payment</p>
                    <p className="text-xs text-blue-700">Your payment information is encrypted and secure</p>
                  </div>
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
