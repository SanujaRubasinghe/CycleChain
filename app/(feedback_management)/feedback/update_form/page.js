'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';

function UpdateFeedbackForm() {
  const {data: session} = useSession()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const feedbackId = searchParams.get('id');

  useEffect(() => {
    const storedUserId = session.user.id
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (feedbackId && userId) {
      fetchFeedback();
    } else if (feedbackId && !userId) {
      const timer = setTimeout(() => {
        const storedUserId = localStorage.getItem('feedbackUserId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setMessage('No feedback ID provided');
      setFetching(false);
    }
  }, [feedbackId, userId]);

  const fetchFeedback = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/feedback/${feedbackId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.userId !== userId) {
          setMessage('You can only edit your own feedback');
          return;
        }
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          message: data.message || '',
          rating: data.rating || 5
        });
      } else {
        setMessage('Failed to fetch feedback');
      }
    } catch (error) {
      setMessage('Error fetching feedback');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Feedback updated successfully!');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setMessage(result.message || 'Failed to update feedback');
      }
    } catch (error) {
      setMessage('Error updating feedback');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Edit Your Feedback
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ Excellent (5)</option>
                <option value={4}>⭐⭐⭐⭐ Very Good (4)</option>
                <option value={3}>⭐⭐⭐ Good (3)</option>
                <option value={2}>⭐⭐ Fair (2)</option>
                <option value={1}>⭐ Poor (1)</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading || fetching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Updating...' : 'Update Feedback'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/my_feedbacks')}
                disabled={fetching}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateFeedbackForm />
    </Suspense>
  )
}