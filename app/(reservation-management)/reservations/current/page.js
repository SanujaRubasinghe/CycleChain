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

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white text-green-600">
        Loading reservation...
      </div>
    );

  if (!reservation)
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-500">
        No active reservations.
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-white text-gray-800">
      <header className="border-b px-6 py-4 shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-green-600">
          Current Reservation
        </h1>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row p-6 gap-6">
        {/* Left: Details */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border p-4 shadow-sm bg-green-50">
            <p className="text-sm font-medium text-green-700">Bike ID</p>
            <p className="text-xl font-bold">{reservation.bikeId}</p>
          </div>

          {userLocation && reservation.start_location && (
            <div className="rounded-lg border p-4 shadow-sm bg-white flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Distance to Bike</p>
                <p className="text-lg font-semibold">
                  {(
                    Math.sqrt(
                      Math.pow(reservation.start_location.lat - userLocation.lat, 2) +
                        Math.pow(reservation.start_location.lng - userLocation.lng, 2)
                    ) * 111
                  ).toFixed(2)} km
                </p>
              </div>
              <button
                onClick={navigateToBike}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Navigate
              </button>
            </div>
          )}

          <div className="rounded-lg border p-4 shadow-sm bg-white">
            <p className="text-sm text-gray-600">Ride Distance</p>
            <p className="text-lg font-semibold">
              {(reservation.distance || 0).toFixed(2)} km
            </p>
          </div>

          <div className="rounded-lg border p-4 shadow-sm bg-white">
            <p className="text-sm text-gray-600">Cost</p>
            <p className="text-lg font-semibold">
              LKR {(reservation.cost || 0).toFixed(2)}
            </p>
          </div>

          {locationError && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-700">
              {locationError}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <aside className="w-full lg:w-96 space-y-4">
          {!unlockMethod && (
            <div className="space-y-3">
              <button
                onClick={() => handleUnlock("qr")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                Scan QR Code
              </button>
              <button
                onClick={() => handleUnlock("email")}
                className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition"
              >
                Send Email Code
              </button>
            </div>
          )}

          {unlockMethod === "email" && (
            <div className="space-y-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code"
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
              {error && <p className="text-red-600">{error}</p>}
            </div>
          )}

          {unlockMethod === "started" && (
            <p className="text-green-600 font-semibold">🚲 Bike Unlocked!</p>
          )}

          <button
            onClick={handleEndRide}
            className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            End Ride
          </button>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          {showQRScanner && (
            <div className="mt-4 p-4 bg-white shadow rounded-lg w-full max-w-md">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                style={{ width: "100%" }}
              />
              <button
                onClick={stopQRScanner}
                className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
