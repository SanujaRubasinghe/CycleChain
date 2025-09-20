import { NextResponse } from 'next/server';
import Reservation from '@/models/Reservation';
import { dbConnect } from '@/lib/mongodb';

export async function POST(request) {
    try {
        await dbConnect();

        const data = await request.json();

        if (!data.bike_id || !data.start_time || !data.end_time) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const start = new Date(data.start_time);
        const end = new Date(data.end_time);

        const isAvailable = await Reservation.isBikeAvailable(data.bike_id, start, end);

        return NextResponse.json({
            success: true,
            available: isAvailable
        });

    } catch (error) {
        console.error('Availability check failed:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}