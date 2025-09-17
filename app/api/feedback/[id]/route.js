import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

// GET specific feedback by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const feedback = await Feedback.findById(params.id);
    
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

// PUT update feedback
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const { name, email, message, rating, userId } = body;
    
    if (!name || !email || !message || !rating) {
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

    // Find and update feedback
    const feedback = await Feedback.findById(params.id);
    
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

// DELETE feedback
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Find feedback first to check ownership
    const feedback = await Feedback.findById(params.id);
    
    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }

    // For now, we'll allow deletion of any feedback
    // In a real app, you'd want to check user permissions here
    // For admin users, they can delete any feedback
    // For regular users, they can only delete their own
    
    await Feedback.findByIdAndDelete(params.id);
    
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
