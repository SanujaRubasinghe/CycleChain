'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MyFeedbacks() {
  const {data: session, status} = useSession()
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = session
    console.log(storedUserId)
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserFeedbacks(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserFeedbacks = async (currentUserId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show user's own feedbacks
        const userFeedbacks = data.filter(feedback => feedback.userId === currentUserId);
        setFeedbacks(userFeedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setMessage('Error fetching your feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Feedback deleted successfully!');
        // Refresh the feedback list
        fetchUserFeedbacks(userId);
      } else {
        setMessage('Failed to delete feedback');
      }
    } catch (error) {
      setMessage('Error deleting feedback');
    }
  };

  const handleEdit = (feedbackId) => {
    router.push(`/feedback/update_form?id=${feedbackId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            My Feedbacks
          </h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Feedback List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your feedbacks...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You haven't submitted any feedback yet.</p>
              <a 
                href="/form" 
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
              >
                Submit Feedback
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{feedback.name}</h4>
                      <p className="text-sm text-gray-600">{feedback.email}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-2">Rating:</span>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(feedback.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{feedback.message}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(feedback._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(feedback._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}