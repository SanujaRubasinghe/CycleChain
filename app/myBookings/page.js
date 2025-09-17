// app/myBookings/page.js
'use client'

import MyBookings from '@/app/components/MyBookings';

export default function MyBookingsPage() {
    // In a real app, you would get the userId from your authentication system
    // For demonstration, we'll use a static userId
    const userId = "test_user_debug"; // Replace with dynamic user ID from your auth system

    return <MyBookings userId={userId} />;
}