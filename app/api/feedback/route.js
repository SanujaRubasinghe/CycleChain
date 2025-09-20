import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

// GET all feedbacks
export async function GET() {
  try {
    await dbConnect();
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { message: 'Error fetching feedbacks' },
      { status: 500 }
    );
  }
}

// POST new feedback
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const { name, email, message, rating, userId, isAdmin } = body;
    
    if (!name || !email || !message || !rating || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create new feedback
    const feedback = new Feedback({
      name,
      email,
      message,
      rating,
      userId,
      isAdmin: isAdmin || false
    });

    await feedback.save();
    
    return NextResponse.json(
      { message: 'Feedback created successfully', feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { message: 'Error creating feedback' },
      { status: 500 }
    );
  }
}
