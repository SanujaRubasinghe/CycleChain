'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Dynamically load the ClientMap with no SSR
const ClientMap = dynamic(() => import('@/components/reservation/ClientMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function BikeRentalSystem() {
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default Sri Lanka center
  const [mapKey, setMapKey] = useState(0); // Key to force map re-render
  
  const router = useRouter();

  useEffect(() => {
    fetchBikes();
    getUserLocation();
  }, []);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bikes');
      if (!response.ok) throw new Error('Failed to fetch bikes');
      const data = await response.json();
      setBikes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (typeof window === 'undefined') return; // guard for SSR
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapKey(prev => prev + 1); // Force map re-render
        },
        () => {
          setError('Unable to get your location. Please search instead.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchLocation
        )}`
      );
      if (!response.ok) throw new Error('Location search failed');
      const data = await response.json();
      if (data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapKey(prev => prev + 1); // Force map re-render
        setError('');
      } else {
        setError('Location not found. Try a different term.');
      }
    } catch {
      setError('Error searching location. Try again.');
    }
  };

  const handleBikeSelect = (bike) => {
    setSelectedBike(bike);
    setShowReservationForm(true);
  };

  const handleCloseReservation = () => {
    setShowReservationForm(false);
    setSelectedBike(null);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bikes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Header */}

      <main className='max-w-7xl mx-auto p-4 pb-24'>
        {/* Location Search Section */}
        <section className='mb-4 bg-white p-4 rounded-xl shadow-md z-20 relative'>
          <h2 className='font-semibold text-lg mb-3 text-gray-800'>Choose Location</h2>
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={getUserLocation}
              className='flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium transition-colors'
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Current Location
            </button>
            
            <div className="flex-1 flex gap-2">
              <input
                type='text'
                placeholder='Search for a location...'
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <button
                onClick={handleLocationSearch}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
              >
                Search
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </section>

        {/* Map Section - Lower z-index than modal */}
        <section className='h-96 rounded-xl overflow-hidden shadow-md mb-4 relative z-10'>
          <ClientMap 
            key={mapKey}
            center={mapCenter} 
            bikes={bikes} 
            onBikeSelect={handleBikeSelect} 
          />
        </section>
      </main>

      {/* Floating Reservation Form - Higher z-index than map */}
      {showReservationForm && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Reserve {selectedBike.name}</h2>
                <button
                  onClick={handleCloseReservation}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ReservationForm
                bike={selectedBike}
                bikes={bikes}
                onCancel={handleCloseReservation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ReservationForm({ bike, bikes, onCancel }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    user_id: session?.user?.id || "",
    bike_id: bike?.id || bike?._id || "",
    start_time: "",
    end_time: "",
    start_location: {
      lat: bike?.currentLocation?.lat || 0,
      lng: bike?.currentLocation?.lng || 0,
    },
  });

  useEffect(() => {
    if (session?.user?.id) {
      setFormData((prev) => ({
        ...prev,
        user_id: session.user.id,
        bike_id: bike?.id || bike?._id || "",
        start_location: {
          lat: bike?.currentLocation?.lat || 0,
          lng: bike?.currentLocation?.lng || 0,
        },
      }));
    }
  }, [session, bike]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setAvailabilityChecked(false);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      start_location: {
        ...formData.start_location,
        [name]: parseFloat(value),
      },
    });
  };

  const checkAvailability = async () => {
    if (!formData.bike_id || !formData.start_time || !formData.end_time) {
      setError("Please select bike, start time, and end time first");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reservation/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bike_id: formData.bike_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to check availability");

      setAvailabilityChecked(true);
      setIsAvailable(result.available);
      if (!result.available) setError("This bike is not available for the selected time period");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError("Please log in to make a reservation");
      return;
    }
    if (!availabilityChecked || !isAvailable) {
      setError("Please check availability first");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create reservation");

      sessionStorage.setItem("hasActiveReservation", "true");
      await response.json();
      router.push(`/reservations/current`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center">
        <div className="bg-white/20 p-2 rounded-lg mr-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">E-Bike Reservation</h2>
          <p className="text-emerald-100">Book your eco-friendly ride in minutes</p>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Bike */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Your E-Bike</label>
            <select
              name="bike_id"
              value={formData.bike_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Choose a bike</option>
              {bikes.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} - {b.bikeId}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="lat"
                step="0.000001"
                value={formData.start_location.lat}
                onChange={handleLocationChange}
                placeholder="Latitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                name="lng"
                step="0.000001"
                value={formData.start_location.lng}
                onChange={handleLocationChange}
                placeholder="Longitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Availability Buttons */}
          <div className="flex gap-4">
            {!availabilityChecked && (
            <button
              type="button"
              onClick={checkAvailability}
              disabled={isSubmitting || !formData.bike_id || !formData.start_time || !formData.end_time}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-gray-300"
            >
              {isSubmitting ? "Checking..." : "Check Availability"}
            </button>
            )}
            {availabilityChecked && isAvailable && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 disabled:border-gray-300"
              >
                {isSubmitting ? "Processing..." : "Confirm"}
              </button>
            )}
          </div>

          {/* Status */}
          {availabilityChecked && (
            <div
              className={`p-3 rounded-xl text-sm ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isAvailable
                ? "Bike is available! Proceed to confirm."
                : "Bike not available. Try another slot or bike."}
            </div>
          )}

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I accept the{" "}
              <a href="#" className="text-emerald-600 hover:underline">
                Terms & Conditions
              </a>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
