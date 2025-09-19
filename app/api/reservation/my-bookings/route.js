// app/api/myBookings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        console.log('API called with userId:', userId);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        try {
            await dbConnect()

            const reservations = await db
                .collection('reservations')
                .find({ user_id: userId })
                .sort({ start_time: -1 })
                .toArray();

            console.log(`Found ${reservations.length} reservations for user ${userId}`);

            return NextResponse.json({
                success: true,
                data: reservations
            });
        } catch (err) {
            return NextResponse.json({error: err.message}, {status: 500})
        }

    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error.message,
                data: []
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { reservationId } = await request.json();

        if (!reservationId) {
            return NextResponse.json(
                { success: false, message: 'Reservation ID is required' },
                { status: 400 }
            );
        }

        try {
            await dbConnect()
            // Delete the reservation
            const result = await db.collection('reservations').deleteOne({
                _id: reservationId
            });

            if (result.deletedCount === 0) {
                return NextResponse.json(
                    { success: false, message: 'Reservation not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Reservation cancelled successfully'
            });

        } catch(err) {
            return NextResponse.json({error: err.message}, {status: 500})
        }

    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}