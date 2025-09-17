'use client';

import { useState } from 'react';

function LoyaltyManagement() {
  const [points, setPoints] = useState(0);
  const [distance, setDistance] = useState('');
  const [rideHistory, setRideHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [lastRedemption, setLastRedemption] = useState(null);

  // Check reward availability
  const discountAvailable = points >= 50;
  const freeRideAvailable = points >= 100;

  const handleAddRide = () => {
    if (!distance || isNaN(distance) || distance <= 0) {
      alert('Please enter a valid distance');
      return;
    }

    const distanceNum = parseFloat(distance);
    const pointsEarned = Math.floor(distanceNum); // 1 point per km
    const newPoints = points + pointsEarned;
    
    setPoints(newPoints);
    
    // Add to ride history
    const newRide = {
      id: Date.now(),
      distance: distanceNum,
      pointsEarned,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    
    setRideHistory([newRide, ...rideHistory]);
    setDistance('');
  };

  const handleRedeemDiscount = () => {
    if (points < 50) {
      alert('You need at least 50 points to redeem a discount');
      return;
    }

    // Apply discount and deduct 10 points
    const newPoints = points - 10;
    setPoints(newPoints);
    
    // Record redemption
    const redemption = {
      id: Date.now(),
      type: 'discount',
      reward: '20% Discount',
      pointsDeducted: 10,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    
    setRedemptionHistory([redemption, ...redemptionHistory]);
    setLastRedemption(redemption);
    
    // Clear last redemption message after 5 seconds
    setTimeout(() => {
      setLastRedemption(null);
    }, 5000);
  };

  const handleRedeemFreeRide = () => {
    if (points < 100) {
      alert('You need at least 100 points to redeem a free weekend ride');
      return;
    }

    // Apply free ride and deduct 20 points
    const newPoints = points - 20;
    setPoints(newPoints);
    
    // Record redemption
    const redemption = {
      id: Date.now(),
      type: 'free-ride',
      reward: 'Free Weekend Ride',
      pointsDeducted: 20,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    
    setRedemptionHistory([redemption, ...redemptionHistory]);
    setLastRedemption(redemption);
    
    // Clear last redemption message after 5 seconds
    setTimeout(() => {
      setLastRedemption(null);
    }, 5000);
  };

  const getPointsToNextDiscount = () => {
    if (points >= 50) return 0;
    return 50 - points;
  };

  const getPointsToNextFreeRide = () => {
    if (points >= 100) return 0;
    return 100 - points;
  };

  const getDiscountProgressPercentage = () => {
    if (points >= 50) return 100;
    return (points / 50) * 100;
  };

  const getFreeRideProgressPercentage = () => {
    if (points >= 100) return 100;
    return (points / 100) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Bike Rental Loyalty Program</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Earn 1 point for every kilometer you ride. Get exclusive rewards based on your loyalty points!
          </p>
        </div>

        {/* Points Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">{points}</div>
            <div className="text-xl font-medium text-gray-700">Loyalty Points</div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Discount Progress */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-blue-800">20% Discount</span>
                  <span className="text-sm font-medium text-blue-600">
                    {discountAvailable ? 'Available!' : `${getPointsToNextDiscount()} pts to go`}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${getDiscountProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-blue-600">Requires 50 points</div>
              </div>
              
              {/* Free Ride Progress */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-purple-800">Free Weekend Ride</span>
                  <span className="text-sm font-medium text-purple-600">
                    {freeRideAvailable ? 'Available!' : `${getPointsToNextFreeRide()} pts to go`}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${getFreeRideProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-purple-600">Requires 100 points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add Ride & Rewards */}
          <div className="space-y-8">
            {/* Add Ride Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Ride</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                    Distance Ridden (km)
                  </label>
                  <input
                    type="number"
                    id="distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter distance in kilometers"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddRide}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                  >
                    Add Ride
                  </button>
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h2>
              
              {lastRedemption && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">
                      {lastRedemption.reward} redeemed! {lastRedemption.pointsDeducted} points deducted.
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-blue-800">20% Discount</h3>
                    <p className="text-sm text-blue-600">Get 20% off your next ride</p>
                    <p className="text-xs text-blue-500 mt-1">Costs 10 points</p>
                  </div>
                  <button
                    onClick={handleRedeemDiscount}
                    disabled={!discountAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                      discountAvailable 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {discountAvailable ? 'Redeem' : 'Locked'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-purple-800">Free Weekend Ride</h3>
                    <p className="text-sm text-purple-600">Enjoy a free weekend bike rental</p>
                    <p className="text-xs text-purple-500 mt-1">Costs 20 points</p>
                  </div>
                  <button
                    onClick={handleRedeemFreeRide}
                    disabled={!freeRideAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                      freeRideAvailable 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {freeRideAvailable ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - History */}
          <div className="space-y-8">
            {/* Recent Rides */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rides</h2>
              {rideHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rides recorded yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {rideHistory.map((ride) => (
                    <div key={ride.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{ride.distance} km</div>
                        <div className="text-sm text-gray-500">{ride.date} at {ride.time}</div>
                      </div>
                      <div className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        +{ride.pointsEarned} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redemption History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Redemption History</h2>
              {redemptionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rewards redeemed yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {redemptionHistory.map((redemption) => (
                    <div key={redemption.id} className={`flex justify-between items-center p-3 rounded-lg ${
                      redemption.type === 'discount' ? 'bg-blue-50' : 'bg-purple-50'
                    }`}>
                      <div>
                        <div className="font-medium text-gray-900">{redemption.reward}</div>
                        <div className="text-sm text-gray-500">{redemption.date} at {redemption.time}</div>
                      </div>
                      <div className={`text-sm font-medium px-2.5 py-0.5 rounded ${
                        redemption.type === 'discount' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        -{redemption.pointsDeducted} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Program Info */}
        <div className="mt-12 bg-indigo-50 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">Earn Points</div>
              <p className="text-gray-700">Ride our bikes and earn 1 point for every kilometer you travel.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">Get Discounts</div>
              <p className="text-gray-700">With 50+ points, redeem a 20% discount on your next ride (costs 10 points).</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-purple-600 font-bold text-lg mb-2">Free Rides</div>
              <p className="text-gray-700">With 100+ points, enjoy a free weekend ride (costs 20 points).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyManagement;