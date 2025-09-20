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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  console.log(bike)

  const [formData, setFormData] = useState({
    user_id: session?.user?.id || '',
    bike_id: bike?.id || bike?._id || '',
    start_time: '',
    end_time: '',
    start_location: {
      lat: bike.currentLocation.lat,
      lng: bike.currentLocation.lng
    }
  });

  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prev => ({
        ...prev,
        user_id: session.user.id,
        bike_id: bike?.id || bike?._id || '',
        start_location: {
          lat: bike.currentLocation.lat,
          lng: bike.currentLocation.lng
        }
      }));
    }
  }, [session, bike, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setAvailabilityChecked(false);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      start_location: {
        ...formData.start_location,
        [name]: parseFloat(value)
      }
    });
  };

  const checkAvailability = async () => {
    if (!formData.bike_id || !formData.start_time || !formData.end_time) {
      setError('Please select bike, start time, and end time first');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reservation/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bike_id: formData.bike_id,
          start_time: formData.start_time,
          end_time: formData.end_time
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check availability');
      }

      setAvailabilityChecked(true);
      setIsAvailable(result.available);
      if (!result.available) {
        setError('This bike is not available for the selected time period');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError('Please log in to make a reservation');
      return;
    }

    if (!availabilityChecked || !isAvailable) {
      setError('Please check availability first');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }
      sessionStorage.setItem('hasActiveReservation', 'true');
      const result = await response.json();
      router.push(`/reservations/current`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-lg mr-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">E-Bike Reservation</h2>
            <p className="text-emerald-100">Book your eco-friendly ride in minutes</p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Bike Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Select Your E-Bike
          </label>
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <select
              id="bike_id"
              name="bike_id"
              value={formData.bike_id}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="">Choose a bike model</option>
              {bikes.map((bike) => (
                <option key={bike._id} value={bike._id}>
                  {bike.name} - {bike.bikeId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Time
            </label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              End Time
            </label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pickup Location Coordinates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="lat" className="block text-sm text-gray-600">Latitude</label>
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  step="0.000001"
                  value={bike.currentLocation.lat}
                  onChange={handleLocationChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., 52.5200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="lng" className="block text-sm text-gray-600">Longitude</label>
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  step="0.000001"
                  value={bike.currentLocation.lng}
                  onChange={handleLocationChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., 13.4050"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={checkAvailability}
            disabled={isSubmitting || !formData.bike_id || !formData.start_time || !formData.end_time}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-sm transition-all flex-1 flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Check Availability</span>
              </>
            )}
          </button>

          {availabilityChecked && isAvailable && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium rounded-xl shadow-sm transition-all flex-1 flex items-center justify-center space-x-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Availability Status */}
        {availabilityChecked && (
          <div className={`p-4 rounded-xl border ${isAvailable ? 'bg-emerald-50 border-emerald 200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <div className="flex items-center">
              {isAvailable ? (
                <>
                  <svg className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>This bike is available for your selected time! Proceed to confirm your reservation.</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>This bike is not available for the selected time period. Please choose different dates or try another bike.</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="flex items-start pt-2">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700 flex items-center">
              I accept the
              <a href="#" className="text-emerald-600 hover:text-emerald-500 ml-1 flex items-center">
                Terms and Conditions
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}