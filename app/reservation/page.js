'use client';

import { useEffect, useState } from 'react';
import ReservationForm from '@/app/components/ReservationForm';

export default function NewReservationPage() {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchBikes() {
            try {
                const response = await fetch('/api/bikes');
                if (!response.ok) {
                    new Error('Failed to fetch bikes');
                }
                const data = await response.json();
                setBikes(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchBikes();
    }, []);

    const userId = 'user123'; // me auth session ekata auth/session

    if (loading) return <div className="text-center py-8">Loading bikes...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">New E-Bike Reservation</h1>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <ReservationForm bikes={bikes} userId={userId} />
            </div>
        </div>
    );
}