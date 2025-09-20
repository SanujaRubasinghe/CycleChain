import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const {id} = await params
    const feedbacks = await Feedback.find({userId: id});
    console.log(feedbacks)
    
    if (!feedbacks) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}