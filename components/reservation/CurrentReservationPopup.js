"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CurrentReservationPopup() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check sessionStorage for active reservation
    const hasActiveReservation = sessionStorage.getItem("hasActiveReservation");
    if (hasActiveReservation === "true") {
      setShowPopup(true);
    }
  }, []);

  const handleGoToReservation = () => {
    router.push("/reservations/current");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // Optionally keep showing until the reservation ends
    // sessionStorage.setItem("hasActiveReservation", "false");
  };

  if (!showPopup) return null;

  return (
    <div className="fixed top-20 right-5 z-50 w-80 rounded-lg bg-white shadow-lg border border-green-600 p-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-800">
          You have an active reservation!
        </p>
        <button
          onClick={handleClosePopup}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <button
        onClick={handleGoToReservation}
        className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        Go to Reservation
      </button>
    </div>
  );
}
