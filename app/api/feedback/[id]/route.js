import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const {id} = await params
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const {id} = await params
    
    const { name, email, message, rating, userId} = body;
    
    if (!name || !email || !message || !rating) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Check if user can update this feedback (only their own)
    // if (feedback.userId !== userId) {
    //   return NextResponse.json(
    //     { message: 'You can only update your own feedback' },
    //     { status: 403 }
    //   );
    // }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      params.id,
      { name, email, message, rating },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { message: 'Error updating feedback' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const {id} = await params
    
    // Find feedback first to check ownership
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }
    
    await Feedback.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { message: 'Error deleting feedback' },
      { status: 500 }
    );
  }
}
