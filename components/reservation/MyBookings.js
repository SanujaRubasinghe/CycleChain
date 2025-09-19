// components/MyBookings.js
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyBookings({ userId }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'upcoming', 'completed', 'cancelled'
    const [cancellingId, setCancellingId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                setError('');
                setReservations([]);

                console.log('Fetching reservations for user:', userId);
                const response = await fetch(`/api/reservation/my-bookings?userId=${userId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        // If no reservations found, use mock data
                        console.log('No reservations found, using mock data');
                        setReservations(getMockReservations(userId));
                        return;
                    }
                    throw new Error(`Server error: ${response.status}`);
                }

                const result = await response.json();
                console.log('API response:', result);

                if (result.success) {
                    setReservations(result.data || []);
                } else {
                    throw new Error(result.message || 'Failed to fetch reservations');
                }
            } catch (err) {
                console.error('Error fetching reservations:', err);
                setError(err.message);
                // Use mock data as fallback
                setReservations(getMockReservations(userId));
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchReservations();
        } else {
            setError('User ID is required');
            setLoading(false);
        }
    }, [userId]);

    const getMockReservations = (userId) => {
        return [
            {
                _id: '1',
                user_id: userId || 'demo_user',
                bike_id: {
                    _id: 'bike1',
                    name: 'Mountain Bike Pro',
                    rate: '$15/hour',
                    type: 'mountain',
                    battery: 85,
                    status: 'reserved'
                },
                start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                start_location: {
                    lat: 6.9271,
                    lng: 79.8612
                },
                status: 'upcoming',
                created_at: new Date().toISOString()
            },
            {
                _id: '2',
                user_id: userId || 'demo_user',
                bike_id: {
                    _id: 'bike2',
                    name: 'City Cruiser',
                    rate: '$10/hour',
                    type: 'city',
                    battery: 75,
                    status: 'reserved'
                },
                start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                start_location: {
                    lat: 6.9271,
                    lng: 79.8612
                },
                status: 'completed',
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                _id: '3',
                user_id: userId || 'demo_user',
                bike_id: {
                    _id: 'bike3',
                    name: 'E-Bike Elite',
                    rate: '$20/hour',
                    type: 'electric',
                    battery: 95,
                    status: 'reserved'
                },
                start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                start_location: {
                    lat: 6.9271,
                    lng: 79.8612
                },
                status: 'active',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
    };

    const handleCancelReservation = async (reservationId) => {
        // Check if reservation can be cancelled (only upcoming or active)
        const reservation = reservations.find(res => res._id === reservationId);

        if (!reservation) {
            setError('Reservation not found');
            return;
        }

        if (reservation.status === 'cancelled') {
            alert('This reservation is already cancelled');
            return;
        }

        if (reservation.status === 'completed') {
            alert('Completed reservations cannot be cancelled');
            return;
        }

        // Check if it's too close to start time (less than 1 hour)
        const startTime = new Date(reservation.start_time);
        const now = new Date();
        const timeDiff = startTime - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 1 && reservation.status === 'upcoming') {
            if (!confirm('Cancelling less than 1 hour before the reservation start time may incur a fee. Do you still want to proceed?')) {
                return;
            }
        }

        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            setCancellingId(reservationId);

            // First, update the bike status to available
            const bikeUpdateResponse = await fetch(`/api/bikes/${reservation.bike_id._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'available' }),
            });

            if (!bikeUpdateResponse.ok) {
                throw new Error('Failed to update bike status');
            }

            // Then, cancel the reservation
            const response = await fetch(`/api/reservation/my-bookings`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id : reservationId }),
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            let result;

            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || 'Server error');
            }

            if (!response.ok) {
                throw new Error(result.message || 'Failed to cancel reservation');
            }

            // Remove the reservation from the list instead of just updating its status
            setReservations(reservations.filter(res => res._id !== reservationId));

            alert('Reservation cancelled successfully and bike is now available');
        } catch (err) {
            setError(err.message);
            console.error('Error cancelling reservation:', err);
            alert('Failed to cancel reservation. Please try again.');
        } finally {
            setCancellingId(null);
        }
    };

    // Filter reservations based on selected filter
    const filteredReservations = reservations.filter(reservation => {
        if (filter === 'all') return true;
        return reservation.status === filter;
    });

    // Check if a reservation is active (current time is between start and end)
    const isCurrentlyActive = (reservation) => {
        const now = new Date();
        const start = new Date(reservation.start_time);
        const end = new Date(reservation.end_time);
        return now >= start && now <= end;
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate time remaining for active reservations
    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end - now;

        if (diffMs <= 0) return 'Expired';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your reservations...</p>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h1 className="ml-3 text-2xl font-bold text-gray-900">My Reservations</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Rent a Bike
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
                        <div className="flex">
                            <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium">Note: Using demo data</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'active', 'upcoming', 'completed', 'cancelled'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                                    filter === filterType
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filterType} {filterType !== 'all' && `(${reservations.filter(r => r.status === filterType).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredReservations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">No {filter !== 'all' ? filter : ''} reservations</h2>
                        <p className="mt-2 text-gray-500">
                            {filter === 'all'
                                ? "You haven't made any bike reservations yet."
                                : `You don't have any ${filter} reservations.`
                            }
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center mx-auto"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Rent a Bike Now
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredReservations.map((reservation) => {
                            const isActive = isCurrentlyActive(reservation);

                            return (
                                <div key={reservation._id} className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h2 className="text-xl font-bold text-gray-800">
                                                    {reservation.bike_id?.name || reservation.bike_name || 'Unknown Bike'}
                                                </h2>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    reservation.status === 'active' || isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : reservation.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-800'
                                                            : reservation.status === 'completed'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {isActive ? 'ACTIVE NOW' : (reservation.status?.toUpperCase() || 'UPCOMING')}
                                                </span>
                                            </div>

                                            {isActive && (
                                                <div className="mt-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <span className="font-medium">Active:</span>
                                                        <span className="ml-1">{getTimeRemaining(reservation.end_time)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm text-gray-500">Start</div>
                                                        <div>{formatDate(reservation.start_time)}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm text-gray-500">End</div>
                                                        <div>{formatDate(reservation.end_time)}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm text-gray-500">Location</div>
                                                        <div>
                                                            {reservation.start_location?.lat && reservation.start_location?.lng
                                                                ? `${reservation.start_location.lat.toFixed(4)}, ${reservation.start_location.lng.toFixed(4)}`
                                                                : 'Location not specified'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm text-gray-500">Rate</div>
                                                        <div>{reservation.bike_id?.rate || reservation.bike_rate || 'Rate not available'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {(reservation.status === 'upcoming' || reservation.status === 'active') && (
                                            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleCancelReservation(reservation._id)}
                                                    disabled={cancellingId === reservation._id}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                >
                                                    {cancellingId === reservation._id ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        'Cancel Reservation'
                                                    )}
                                                </button>
                                                {isActive && (
                                                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
                                                        Extend Rental
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {reservation.status === 'completed' && (
                                            <div className="mt-4 md:mt-0 md:ml-6">
                                                <p className="text-sm text-gray-500 italic">Completed reservations cannot be cancelled</p>
                                            </div>
                                        )}

                                        {reservation.status === 'cancelled' && (
                                            <div className="mt-4 md:mt-0 md:ml-6">
                                                <p className="text-sm text-red-500 italic">Reservation cancelled</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Reservation ID</h3>
                                            <p className="mt-1 text-sm text-gray-900 font-mono">{reservation._id}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Created {new Date(reservation.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}