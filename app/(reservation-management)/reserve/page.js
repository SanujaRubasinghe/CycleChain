'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchBikes();
    getUserLocation();

    // Check for location parameter in URL
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSearchLocation(locationParam);
      geocodeLocation(locationParam);
    }
  }, [searchParams]);

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

  const geocodeLocation = async (locationString) => {
    if (!locationString || locationString.trim() === '') return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationString
        )}`
      );
      if (!response.ok) throw new Error('Location search failed');
      const data = await response.json();
      if (data.length > 0) {
        const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(newCenter);
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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50'>
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 border-r-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading available bikes...</p>
          <p className="mt-2 text-sm text-gray-500">Finding the perfect ride for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 relative'>
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <main className='max-w-7xl mx-auto p-6 pb-24 relative z-10'>
        {/* Location Search Section */}
        <section className='mb-8 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20'>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-800'>Choose Your Location</h2>
              <p className="text-gray-600">Find e-bikes near you or search for a specific area</p>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-4'>
            <button
              onClick={getUserLocation}
              className='flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use Current Location
            </button>

            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative">
                <input
                  type='text'
                  placeholder='Search for a city, address, or landmark...'
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className='w-full bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 px-6 py-4 pl-12 rounded-2xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-lg'
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleLocationSearch}
                className='bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 rounded-2xl flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Location Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </section>

        {/* Map Section */}
        <section className='h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative'>
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Map</span>
            </div>
          </div>
          <ClientMap
            key={mapKey}
            center={mapCenter}
            bikes={bikes}
            onBikeSelect={handleBikeSelect}
          />
        </section>
      </main>

      {/* Enhanced Reservation Form Modal */}
      {showReservationForm && selectedBike && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Reserve {selectedBike.name}
                    </h2>
                    <p className="text-gray-600 mt-1">Complete your booking in minutes</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseReservation}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">E-Bike Reservation</h2>
            <p className="text-emerald-100 text-lg">Complete your booking in just a few simple steps</p>
          </div>
        </div>
      </div>

      {/* Landscape Body Layout */}
      <form onSubmit={handleSubmit} className="p-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-sm font-medium text-green-600">Select Bike</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm font-medium text-blue-600">Choose Time</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm font-medium text-purple-600">Set Location</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span className="text-sm font-medium text-gray-600">Confirm</span>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Reservation Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Landscape Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Step 1: Bike Selection */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Select Your E-Bike
              </h3>
              <select
                name="bike_id"
                value={formData.bike_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose your e-bike</option>
                {bikes.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Time Selection */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Choose Time
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Step 3: Location Selection */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pickup Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    name="lat"
                    step="0.000001"
                    value={formData.start_location.lat}
                    onChange={handleLocationChange}
                    placeholder="e.g., 6.9271"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    name="lng"
                    step="0.000001"
                    value={formData.start_location.lng}
                    onChange={handleLocationChange}
                    placeholder="e.g., 79.8612"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Confirmation */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm Reservation
              </h3>

              <div className="space-y-4">
                {!availabilityChecked ? (
                  <button
                    type="button"
                    onClick={checkAvailability}
                    disabled={isSubmitting || !formData.bike_id || !formData.start_time || !formData.end_time}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? "Checking..." : "Check Availability"}
                  </button>
                ) : availabilityChecked && isAvailable ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Reservation"}
                  </button>
                ) : null}

                {availabilityChecked && (
                  <div className={`p-3 rounded-lg text-sm ${isAvailable ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    {isAvailable ? "✓ Available" : "✗ Not available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions - Full Width */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
          <div className="flex items-start gap-4">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 text-green-600 bg-white border border-gray-300 rounded focus:ring-green-500 mt-0.5"
            />
            <div>
              <label htmlFor="terms" className="text-gray-800 font-medium cursor-pointer">
                I accept the{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Terms & Conditions
                </a>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
