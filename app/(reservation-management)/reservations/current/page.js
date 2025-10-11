"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, BrowserCodeReader } from "@zxing/browser";

export default function CurrentReservationPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockMethod, setUnlockMethod] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const qrScannerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!session) return;

    const fetchReservation = async () => {
      try {
        const res = await fetch("/api/reservation/current");
        const data = await res.json();
        if (res.ok) setReservation(data);
        else setReservation(null);
      } catch {
        setReservation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
    const interval = setInterval(fetchReservation, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => setLocationError("Unable to get your location.")
      );
    } else {
      setLocationError("Geolocation not supported.");
    }
  }, []);

  const startReservation = async (method) => {
    try {
      const res = await fetch(`/api/reservation/start/${reservation._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });

      if (!res.ok) throw new Error("Failed to start reservation");
      console.log("Ride started!");
      setUnlockMethod("started");
    } catch {
      setError("Failed to start ride.");
    }
  };

  const handleUnlock = async (method) => {
    setUnlockMethod(method);
    setError("");

    try {
      if (method === "email") {
        const res = await fetch(
          `/api/reservation/send-code/${reservation._id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) throw new Error("Failed to send code");
      }

      if (method === "qr") {
        setShowQRScanner(true);
        startQRScanner();
      }
    } catch {
      setError("Failed to start ride.");
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch(
        `/api/reservation/verify-code/${reservation._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: verificationCode }),
        }
      );

      if (!res.ok) throw new Error("Invalid code");

      await fetch(`/api/bikes/unlock/${reservation._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: null }),
      });

      await startReservation("email");
    } catch {
      setError("Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const startQRScanner = async () => {
    qrScannerRef.current = new BrowserQRCodeReader();

    try {
      const videoInputDevices =
        await BrowserCodeReader.listVideoInputDevices();

      const selectedDeviceId =
        videoInputDevices.length > 0 ? videoInputDevices[0].deviceId : null;

      if (!selectedDeviceId) throw new Error("No camera found");

      await qrScannerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, err) => {
          if (!!result) {
            console.log("QR Scanned:", result.getText());
            stopQRScanner();

            try {
              const res = await fetch(`/api/bikes/unlock/${reservation._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrCode: result.getText() }),
              });

              if (!res.ok) throw new Error("Failed QR unlock");

              await startReservation("qr");
            } catch {
              setError("Failed to unlock with QR.");
            }
          }

          if (err) {
            console.error(err);
          }
        }
      );
    } catch (e) {
      setError("Failed to start QR scanner.");
      console.error(e);
    }
  };

  const stopQRScanner = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setShowQRScanner(false);
      }
      if (qrScannerRef.current) {
        qrScannerRef.current = null;
      }
    } catch (e) {
      console.warn("Failed to stop camera:", e);
    }
  };

  const handleEndRide = async () => {
    try {
      await fetch(`/api/reservation/end/${reservation._id}`, { method: "POST" });
      setReservation(null);
      await fetch(`/api/bikes/lock/${reservation._id}`, { method: "POST" });
      sessionStorage.setItem("hasActiveReservation", "false");
      router.push(`/payment?id=${reservation._id}`);
    } catch {
      setError("Failed to end ride.");
    }
  };

  const navigateToBike = () => {
    if (!userLocation || !reservation?.start_location) return;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${reservation.start_location.lat},${reservation.start_location.lng}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`,
      "_blank"
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-green-600 border-r-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-green-200 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading your reservation...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your ride details</p>
        </div>
      </div>
    );
  }

  // No Reservation State
  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Reservation</h2>
          <p className="text-gray-600 mb-6">You don't have any active bike reservations at the moment.</p>
          <button
            onClick={() => router.push('/reserve')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Reserve a Bike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Current Reservation</h1>
            <p className="text-green-100 text-lg">Your bike is ready for pickup</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 pb-24">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-2xl flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Reservation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bike Information Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bike Information</h3>
                    <p className="text-green-100">Your reserved e-bike details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Bike ID</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{reservation.bikeId}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Ride Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {reservation.start_time ? new Date(reservation.start_time).toLocaleTimeString() : 'Not started'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Statistics Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Trip Statistics</h3>
                    <p className="text-purple-100">Your ride progress and costs</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{(reservation.distance || 0).toFixed(2)} km</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">LKR {(reservation.cost || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Card */}
            {userLocation && reservation.start_location && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Navigate to Bike</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Distance</span>
                        <span className="font-semibold text-lg">
                          {(
                            Math.sqrt(
                              Math.pow(reservation.start_location.lat - userLocation.lat, 2) +
                                Math.pow(reservation.start_location.lng - userLocation.lng, 2)
                            ) * 111
                          ).toFixed(2)} km
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={navigateToBike}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Navigate
                  </button>
                </div>
              </div>
            )}

            {/* Location Error */}
            {locationError && (
              <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-800">Location Warning</p>
                    <p className="text-sm text-yellow-700">{locationError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Unlock Actions */}
          <div className="space-y-6">
            {/* Unlock Status Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Unlock Bike</h3>
                    <p className="text-green-100">Choose your preferred unlock method</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!unlockMethod && (
                  <div className="space-y-4">
                    <button
                      onClick={() => handleUnlock("qr")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01" />
                      </svg>
                      Scan QR Code
                    </button>
                    <button
                      onClick={() => handleUnlock("email")}
                      className="w-full border-2 border-purple-500 text-purple-600 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:bg-purple-50 flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Verification
                    </button>
                  </div>
                )}

                {unlockMethod === "email" && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-800">Enter Verification Code</p>
                      <p className="text-sm text-gray-600">Check your email for the unlock code</p>
                    </div>

                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 4-digit code"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono"
                    />

                    <button
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length < 4}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg disabled:shadow-none"
                    >
                      {isVerifying ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Verifying...
                        </div>
                      ) : (
                        "Verify Code"
                      )}
                    </button>
                  </div>
                )}

                {unlockMethod === "started" && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-2">🚲 Bike Unlocked!</p>
                    <p className="text-gray-600">Your e-bike is ready to ride. Enjoy your journey!</p>
                  </div>
                )}
              </div>
            </div>

            {/* End Ride Button */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <button
                onClick={handleEndRide}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                End Ride & Pay
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                This will end your current ride and redirect you to payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Scan QR Code</h3>
                  <p className="text-green-100 text-sm">Point camera at bike QR code</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-2xl border-2 border-gray-200"
                  style={{ maxHeight: "300px" }}
                />
                <div className="absolute inset-0 border-2 border-green-500 rounded-2xl pointer-events-none" style={{ width: "calc(100% - 8px)", height: "calc(100% - 8px)", top: "4px", left: "4px" }}></div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={stopQRScanner}
                  className="w-full border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-gray-50"
                >
                  Cancel Scanning
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Position the QR code within the frame to unlock your bike
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
