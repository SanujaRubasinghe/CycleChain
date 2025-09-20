'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'user', 'admin'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const { data: session } = useSession();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      if (filter === 'user') return !feedback.isAdmin;
      if (filter === 'admin') return feedback.isAdmin;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map(stars => ({
    stars,
    count: feedbacks.filter(f => f.rating === stars).length,
    percentage: feedbacks.length > 0 ? (feedbacks.filter(f => f.rating === stars).length / feedbacks.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See what our community has to say about their experience with CycleChain
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{feedbacks.length}</div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{averageRating}/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {feedbacks.filter(f => f.rating >= 4).length}
            </div>
            <div className="text-gray-600">Positive Reviews</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {feedbacks.filter(f => f.rating <= 2).length}
            </div>
            <div className="text-gray-600">Needs Improvement</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center">
                <div className="w-16 text-sm text-gray-600">{stars} star{stars !== 1 ? 's' : ''}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          <Link
            href="/feedback/form"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Feedback
          </Link>
        </div>

        {/* Feedback List */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No feedback yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
            <Link
              href="/feedback/form"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Share Your Feedback
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback._id} feedback={feedback} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackCard({ feedback }) {
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();
  const isOwnFeedback = session?.user?.email === feedback.email;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xl ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${
      feedback.isAdmin 
        ? 'border-blue-500' 
        : isOwnFeedback 
          ? 'border-green-500' 
          : 'border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            feedback.isAdmin ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            <span className={feedback.isAdmin ? 'text-blue-600' : 'text-green-600'}>
              {feedback.isAdmin ? '⚙️' : '👤'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {feedback.isAdmin ? 'CycleChain Team' : feedback.name}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex mb-1">{renderStars(feedback.rating)}</div>
          {isOwnFeedback && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Your feedback
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className={`text-gray-700 ${!expanded && feedback.message.length > 200 ? 'line-clamp-3' : ''}`}>
          {feedback.message}
        </p>
        {feedback.message.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-green-600 hover:text-green-700 text-sm font-medium mt-2"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {feedback.isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">💙</span>
            <span className="text-sm text-blue-700 font-medium">Official Response from CycleChain</span>
          </div>
        </div>
      )}
    </div>
  );
}