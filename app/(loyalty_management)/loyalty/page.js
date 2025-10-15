'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function LoyaltyManagement() {
  const { data: session } = useSession();
  const [points, setPoints] = useState(0);
  const [distance, setDistance] = useState('');
  const [rideHistory, setRideHistory] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [lastRedemption, setLastRedemption] = useState(null);
  const [loading, setLoading] = useState(true);

  const discountAvailable = points >= 50;
  const freeRideAvailable = points >= 100;

  // Fetch loyalty points and ride history on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ride history
        const ridesRes = await fetch('/api/user/rides', { cache: 'no-store' });
        console.log('Rides response status:', ridesRes.status);
        if (ridesRes.ok) {
          const ridesData = await ridesRes.json();
          console.log('Rides data received:', ridesData);
          
          // Transform rides data to match the UI format
          const formattedRides = ridesData.map(ride => ({
            id: ride._id,
            distance: ride.distance || 0,
            pointsEarned: Math.floor(ride.distance || 0),
            date: new Date(ride.end_time).toLocaleDateString(),
            time: new Date(ride.end_time).toLocaleTimeString()
          }));
          setRideHistory(formattedRides);
          
          // Calculate total points from all rides (1km = 1 point)
          const totalPoints = ridesData.reduce((sum, ride) => {
            return sum + Math.floor(ride.distance || 0);
          }, 0);
          
          console.log('Total points calculated from rides:', totalPoints);
          setPoints(totalPoints);
        } else {
          console.error('Failed to fetch rides:', await ridesRes.text());
        }
      } catch (error) {
        console.error('Failed to fetch loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleAddRide = () => {
    if (!distance || isNaN(distance) || distance <= 0) {
      alert('Please enter a valid distance');
      return;
    }

    const distanceNum = parseFloat(distance);
    const pointsEarned = Math.floor(distanceNum);
    const newPoints = points + pointsEarned;

    setPoints(newPoints);

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

  const handleRedeemDiscount = async () => {
    if (points < 50) {
      alert('You need at least 50 points to redeem a discount');
      return;
    }

    try {
      const res = await fetch('/api/user/loyalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pointsToDeduct: 10, 
          reason: '20% Discount' 
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to redeem discount');
      }

      const data = await res.json();
      setPoints(data.loyaltyPoints);

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

      setTimeout(() => setLastRedemption(null), 5000);
    } catch (error) {
      alert(error.message || 'Failed to redeem discount');
    }
  };

  const handleRedeemFreeRide = async () => {
    if (points < 100) {
      alert('You need at least 100 points to redeem a free weekend ride');
      return;
    }

    try {
      const res = await fetch('/api/user/loyalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pointsToDeduct: 20, 
          reason: 'Free Weekend Ride' 
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to redeem free ride');
      }

      const data = await res.json();
      setPoints(data.loyaltyPoints);

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

      setTimeout(() => setLastRedemption(null), 5000);
    } catch (error) {
      alert(error.message || 'Failed to redeem free ride');
    }
  };

  const getPointsToNextDiscount = () => points >= 50 ? 0 : 50 - points;
  const getPointsToNextFreeRide = () => points >= 100 ? 0 : 100 - points;
  const getDiscountProgressPercentage = () => points >= 50 ? 100 : (points / 50) * 100;
  const getFreeRideProgressPercentage = () => points >= 100 ? 100 : (points / 100) * 100;

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your loyalty points...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-green-800 mb-4">Bike Rental Loyalty Program</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Earn 1 point for every kilometer you ride. Unlock discounts and free rides with your loyalty points!
          </p>
        </div>

        {/* Points Summary */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">{points}</div>
            <div className="text-xl font-medium text-gray-700">Loyalty Points</div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Discount Progress */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-green-800">20% Discount</span>
                  <span className="text-sm font-medium text-green-600">
                    {discountAvailable ? 'Available!' : `${getPointsToNextDiscount()} pts to go`}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getDiscountProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-green-600">Requires 50 points</div>
              </div>

              {/* Free Ride Progress */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-emerald-800">Free Weekend Ride</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {freeRideAvailable ? 'Available!' : `${getPointsToNextFreeRide()} pts to go`}
                  </span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getFreeRideProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-emerald-600">Requires 100 points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rewards */}
          <div className="space-y-8">
            {/* Rewards */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h2>

              {lastRedemption && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-800 font-medium">
                      {lastRedemption.reward} redeemed! {lastRedemption.pointsDeducted} points deducted.
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-green-800">20% Discount</h3>
                    <p className="text-sm text-green-600">Get 20% off your next ride</p>
                    <p className="text-xs text-green-500 mt-1">Costs 10 points</p>
                  </div>
                  <button
                    onClick={handleRedeemDiscount}
                    disabled={!discountAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                      discountAvailable
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {discountAvailable ? 'Redeem' : 'Locked'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-800">Free Weekend Ride</h3>
                    <p className="text-sm text-emerald-600">Enjoy a free weekend bike rental</p>
                    <p className="text-xs text-emerald-500 mt-1">Costs 20 points</p>
                  </div>
                  <button
                    onClick={handleRedeemFreeRide}
                    disabled={!freeRideAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                      freeRideAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {freeRideAvailable ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-8">
            {/* Rides */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rides</h2>
              {rideHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rides recorded yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {rideHistory.map((ride) => (
                    <div key={ride.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{ride.distance} km</div>
                        <div className="text-sm text-gray-500">
                          {ride.date} at {ride.time}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        +{ride.pointsEarned} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redemptions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Redemption History</h2>
              {redemptionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rewards redeemed yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {redemptionHistory.map((redemption) => (
                    <div
                      key={redemption.id}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        redemption.type === 'discount' ? 'bg-green-50' : 'bg-emerald-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{redemption.reward}</div>
                        <div className="text-sm text-gray-500">
                          {redemption.date} at {redemption.time}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium px-2.5 py-0.5 rounded ${
                          redemption.type === 'discount'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        -{redemption.pointsDeducted} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 bg-green-50 rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 font-bold text-lg mb-2">Earn Points</div>
              <p className="text-gray-700">Ride our bikes and earn 1 point per kilometer.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 font-bold text-lg mb-2">Get Discounts</div>
              <p className="text-gray-700">With 50+ points, redeem a 20% discount (costs 10 points).</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-emerald-600 font-bold text-lg mb-2">Free Rides</div>
              <p className="text-gray-700">With 100+ points, unlock a free weekend ride (costs 20 points).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyManagement;
