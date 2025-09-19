'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

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
      <header className='bg-white shadow-md sticky top-0 z-30 p-4 flex justify-between items-center'>
        <div className="flex items-center">
          <div className="bg-green-500 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className='text-xl font-bold text-gray-800'>EcoBike Rentals</h1>
        </div>
        <button
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium'
          onClick={() => router.push('/myBookings')}
        >
          My Reservations
        </button>
      </header>

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
                location={userLocation || { lat: mapCenter[0], lng: mapCenter[1] }}
                onCancel={handleCloseReservation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservationForm({ bike, location, onCancel }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    bike_id: bike?.id || bike._id || '',
    start_time: '',
    end_time: '',
    start_location: location
      ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      : '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      bike_id: bike?.id || bike._id || '',
      start_location: location
        ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        : '',
    }));
  }, [bike, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = [];
    if (!formData.user_name.trim()) errs.push('Name is required');
    if (!formData.user_email.trim()) errs.push('Email is required');
    else if (!/\S+@\S+\.\S+/.test(formData.user_email))
      errs.push('Invalid email format');
    if (!formData.start_time || !formData.end_time)
      errs.push('Start and End time required');
    else if (new Date(formData.start_time) >= new Date(formData.end_time))
      errs.push('End time must be after start time');
    if (!formData.start_location.trim()) errs.push('Pickup location required');
    if (!acceptedTerms) errs.push('You must accept Terms and Conditions');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      setError(errs.join(', '));
      return;
    }
    setError('');
    setIsSubmitting(true);

    let parsedLocation = { lat: 0, lng: 0 };
    if (formData.start_location.includes(',')) {
      const parts = formData.start_location.split(',');
      if (parts.length === 2) {
        parsedLocation = {
          lat: parseFloat(parts[0].trim()),
          lng: parseFloat(parts[1].trim()),
        };
      }
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: `user_${Date.now()}`,
          user_name: formData.user_name,
          user_email: formData.user_email,
          bike_id: formData.bike_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          start_location: parsedLocation,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create reservation');
      }

      alert(`Reservation confirmed for ${bike.name}!`);
      onCancel();
    } catch (err) {
      setError(err.message || 'Reservation failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Bike Summary */}
      <div className="bg-green-50 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900">{bike.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{bike.type}</p>
            <div className="flex items-center mt-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${bike.battery || 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 ml-2">{bike.battery || 0}% battery</span>
            </div>
          </div>
          <div className="ml-auto text-lg font-bold text-green-600">
            {bike.rate || 'Rate not available'}
          </div>
        </div>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg'>
          <p className="font-medium">Reservation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type='text'
            name='user_name'
            value={formData.user_name}
            onChange={handleChange}
            placeholder='Your full name'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type='email'
            name='user_email'
            value={formData.user_email}
            onChange={handleChange}
            placeholder='your.email@example.com'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type='datetime-local'
              name='start_time'
              value={formData.start_time}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type='datetime-local'
              name='end_time'
              value={formData.end_time}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <input
            type='text'
            name='start_location'
            value={formData.start_location}
            onChange={handleChange}
            placeholder='Pickup Location'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type='checkbox'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">
              I accept the <a href="#" className="text-green-600 hover:text-green-500">Terms and Conditions</a>
            </label>
            <p className="text-gray-500 mt-1">By checking this, you agree to our rental policies and fee structure.</p>
          </div>
        </div>
        
        <div className='flex gap-3 pt-4'>
          <button
            type='button'
            onClick={onCancel}
            className='flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting || !acceptedTerms}
            className='flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Reservation'
            )}
          </button>
        </div>
      </form>
    </>
  );
}