'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BikeRentalSystem() {
    const [bikes, setBikes] = useState([]);
    const [selectedBike, setSelectedBike] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState('');
    const [showBikeList, setShowBikeList] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Fetch bikes from MongoDB
    const fetchBikes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bikes');

            if (!response.ok) {
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).join(', ');
                    throw new Error(errorMessages || 'Validation failed');
                }
                throw new Error(result.message || 'Failed to create reservation');
            }

            const result = await response.json();

            if (result.success) {
                setBikes(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch bikes');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching bikes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load Google Maps script and fetch bikes
    useEffect(() => {
        // Fetch bikes first
        fetchBikes();

        // Then load Google Maps
        if (typeof window !== 'undefined' && !window.google) {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY';

            if (apiKey === 'DEMO_KEY') {
                setMapError('Google Maps API key not properly configured. Showing fallback view.');
                setMapLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setMapLoaded(true);
            script.onerror = () => {
                setMapError('Failed to load Google Maps. Showing fallback view.');
                setMapLoaded(true);
            };
            document.head.appendChild(script);
        } else {
            setMapLoaded(true);
        }
    }, []);

    // Initialize map when component mounts and Google Maps is loaded
    useEffect(() => {
        if (mapLoaded && typeof google !== 'undefined' && bikes.length > 0) {
            try {
                initMap();
            } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('Error initializing map. Showing fallback view.');
            }
        }
    }, [mapLoaded, bikes]);

    const initMap = () => {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // Center map on Sri Lanka
        const map = new google.maps.Map(mapElement, {
            center: { lat: 6.9271, lng: 79.8612 }, // Center of Sri Lanka
            zoom: 13,
            styles: [
                {
                    featureType: "all",
                    elementType: "geometry",
                    stylers: [{ color: "#f5f5f5" }]
                },
                {
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#616161" }]
                },
                {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]
                },
                {
                    featureType: "road",
                    stylers: [{ saturation: -100 }, { lightness: 45 }]
                },
                {
                    featureType: "transit",
                    stylers: [{ visibility: "off" }]
                },
                {
                    featureType: "water",
                    stylers: [{ color: "#c8e6c9" }, { visibility: "on" }]
                }
            ]
        });

        // Add bike markers to the map
        bikes.forEach(bike => {
            // Skip bikes without valid location data
            if (!bike.currentLocation || typeof bike.currentLocation.lat !== 'number' || typeof bike.currentLocation.lng !== 'number') {
                console.warn('Skipping bike with invalid location:', bike._id || bike.bikeId);
                return;
            }

            const icon = {
                url: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
                <circle cx="50" cy="50" r="40" fill="#4CAF50" opacity="0.8"/>
                <text x="50" y="55" font-size="30" text-anchor="middle" fill="white">🚴</text>
            </svg>
        `)))}`,
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 20)
            };

            const marker = new google.maps.Marker({
                position: { lat: bike.currentLocation.lat, lng: bike.currentLocation.lng },
                map: map,
                icon: icon,
                title: bike.name
            });

            // Add click event to marker
            marker.addListener('click', () => {
                setSelectedBike(bike);
                setSelectedLocation(`${bike.currentLocation.lat.toFixed(6)}, ${bike.currentLocation.lng.toFixed(6)}`);
                setShowReservationForm(true);
            });
        });
    };

    const handleBikeSelect = (bike) => {
        setSelectedBike(bike);

        let locationString = '';
        if (bike.currentLocation && typeof bike.currentLocation.lat === 'number' && typeof bike.currentLocation.lng === 'number') {
            locationString = `${bike.currentLocation.lat.toFixed(6)}, ${bike.currentLocation.lng.toFixed(6)}`;
        }

        setSelectedLocation(locationString);
        setShowReservationForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bikes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <svg className="w-12 h-12 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-red-800">Error Loading Bikes</h3>
                        <p className="mt-2 text-red-600">{error}</p>
                        <button
                            onClick={fetchBikes}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="ml-3 text-2xl font-bold text-gray-900">EcoBike Rentals</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            {bikes.length} bikes available
                        </span>
                        <button
                            onClick={fetchBikes}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm"
                        >
                            Refresh
                        </button>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" onClick={() => router.push('/myBookings')}>
                            My Reservations
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Map Section */}
                    <div className={`w-full ${showReservationForm ? 'lg:w-1/2' : 'lg:w-2/3'} transition-all duration-300`}>
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Find Available Bikes Near You
                            </h2>

                            {mapError && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 mb-4 rounded-lg">
                                    <p>{mapError}</p>
                                    <p className="text-sm mt-1">To enable maps, please add a valid Google Maps API key to your environment variables.</p>
                                </div>
                            )}

                            <div id="map" className="w-full h-96 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {!mapLoaded ? (
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Loading map...</p>
                                    </div>
                                ) : mapError ? (
                                    <div className="text-center p-6">
                                        <div className="bg-gray-200 rounded-lg p-4 inline-block">
                                            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <p className="mt-4 text-gray-600">Map unavailable. Select a bike from the list below.</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Available Bikes List */}
                        {showBikeList && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Available Bikes ({bikes.length})
                                </h2>
                                {bikes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-4 text-gray-600">No bikes available at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bikes.map(bike => (
                                            <div
                                                key={bike._id || bike.bikeId}
                                                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => handleBikeSelect(bike)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{bike.name}</h3>
                                                        <p className="text-gray-600 text-sm mt-1">{bike.rate}</p>
                                                        <p className="text-xs text-gray-500 capitalize mt-1">{bike.type}</p>
                                                    </div>
                                                    <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        {bike.battery}%
                                                    </div>
                                                </div>
                                                <div className="flex items-center mt-3 text-sm text-gray-500">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {bike.location && typeof bike.location.lat === 'number' && typeof bike.location.lng === 'number'
                                                        ? `${bike.location.lat.toFixed(4)}, ${bike.location.lng.toFixed(4)}`
                                                        : 'Location not available'
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reservation Form */}
                    {showReservationForm && (
                        <div className="w-full lg:w-1/3 lg:pl-4">
                            <ReservationForm
                                bike={selectedBike}
                                location={selectedLocation}
                                onCancel={() => {
                                    setShowReservationForm(false);
                                    setSelectedLocation('');
                                }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function ReservationForm({ bike, location, onCancel }) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [formData, setFormData] = useState({
        user_id: '',
        user_name: '',
        user_email: '',
        bike_id: bike?.id || '',
        start_time: '',
        end_time: '',
        start_location: location || ''
    });

    useEffect(() => {
        if (bike) {
            let startLocation = location;

            if (!startLocation && bike.location && typeof bike.location.lat === 'number' && typeof bike.location.lng === 'number') {
                startLocation = `${bike.location.lat.toFixed(6)}, ${bike.location.lng.toFixed(6)}`;
            }

            if (!startLocation) {
                startLocation = 'Location not available';
            }

            setFormData(prev => ({
                ...prev,
                bike_id: bike.id || bike._id || '',
                start_location: startLocation
            }));
        }
    }, [bike, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Add client-side validation function
    const validateForm = () => {
        const errors = [];

        if (!formData.user_id.trim()) {
            errors.push('User ID is required');
        }

        if (!formData.start_time || !formData.end_time) {
            errors.push('Start and end times are required');
        } else if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            errors.push('End time must be after start time');
        }

        if (!formData.start_location.trim()) {
            errors.push('Pickup location is required');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Add this helper function
        const parseLocationString = (locationString) => {
            if (!locationString) return { lat: 0, lng: 0 };

            // Check if it's already in coordinate format "lat, lng"
            if (locationString.includes(',')) {
                const parts = locationString.split(',');
                if (parts.length === 2) {
                    const lat = parseFloat(parts[0].trim());
                    const lng = parseFloat(parts[1].trim());
                    if (!isNaN(lat) && !isNaN(lng)) {
                        return { lat, lng };
                    }
                }
            }

            // If we can't parse coordinates, try to use the bike's location as fallback
            if (bike?.location && typeof bike.location.lat === 'number' && typeof bike.location.lng === 'number') {
                return {
                    lat: bike.location.lat,
                    lng: bike.location.lng
                };
            }

            // Default fallback
            return { lat: 0, lng: 0 };
        };

        const startLocation = parseLocationString(formData.start_location);

        // Client-side validation
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Parse the location string into lat/lng coordinates
            let startLocation = {
                lat: 0,
                lng: 0
            };

            // Try to extract coordinates from the location string if it's in "lat, lng" format
            if (formData.start_location && formData.start_location.includes(',')) {
                const [lat, lng] = formData.start_location.split(',').map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    startLocation = { lat, lng };
                }
            }

            // If we have the bike's location, use it as fallback
            if (bike?.location && typeof bike.location.lat === 'number' && typeof bike.location.lng === 'number') {
                startLocation = {
                    lat: bike.location.lat,
                    lng: bike.location.lng
                };
            }

            // Prepare data for backend
            const reservationData = {
                user_id: formData.user_id || `user_${Date.now()}`,
                user_name: formData.user_name,
                user_email: formData.user_email,
                bike_id: formData.bike_id,
                start_time: formData.start_time,
                end_time: formData.end_time,
                start_location: startLocation  // Send as object, not string
            };

            console.log('Submitting reservation:', reservationData);

            // Make API call to your backend
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();
            console.log('Response status:', response.status, 'Data:', result);

            if (!response.ok) {
                // Check if it's a validation error with detailed messages
                if (result.errors) {
                    // Format validation errors into a readable string
                    const errorMessages = Object.values(result.errors).join(', ');
                    throw new Error(errorMessages || 'Validation failed');
                }
                throw new Error(result.message || 'Failed to create reservation');
            }

            // Handle different response structures
            const reservationId = result._id || result.id || result.data?._id || result.data?.id;

            if (reservationId) {
                alert(`Reservation confirmed for ${bike.name}! Reservation ID: ${reservationId}`);
            } else {
                alert(`Reservation confirmed for ${bike.name}!`);
            }

            onCancel();

        } catch (err) {
            setError(err.message || 'Failed to create reservation. Please try again.');
            console.error('Reservation error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Reserve {bike?.name}</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Bike Summary */}
            <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">{bike?.name}</h3>
                        <div className="flex items-center mt-1">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${bike?.battery || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-600 ml-2">{bike?.battery || 0}% battery</span>
                        </div>
                    </div>
                    <div className="ml-auto text-lg font-bold text-green-600">
                        {bike?.rate || 'Rate not available'}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6 rounded-lg">
                    <p className="font-medium">Reservation Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                    <p className="text-xs mt-2">Please check your information and try again.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <input
                            type="text"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Enter your user ID"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Your Name</label>
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input
                            type="text"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Enter your full name"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input
                            type="email"
                            name="user_email"
                            value={formData.user_email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="your.email@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <div className="relative">
                            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <div className="relative">
                            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                            type="text"
                            name="start_location"
                            value={formData.start_location}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Enter pickup location"
                        />
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                            I accept the <a href="#" className="text-green-600 hover:text-green-500">Terms and Conditions</a>
                        </label>
                        <p className="text-gray-500 mt-1">By checking this, you agree to our rental policies and fee structure.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !acceptedTerms}
                        className="px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-all flex-1 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Confirm Reservation
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}