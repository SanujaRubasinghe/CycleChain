"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Eco Impact Card
function EcoImpactCard({ totalDistanceKm = 0 }) {
  const km = Number(totalDistanceKm) || 0;
  const co2AvoidedKg = km * 0.21;
  const calories = km * 35;
  const treesEq = co2AvoidedKg / 22;

  const Stat = ({ label, value, sub, icon }) => (
    <div className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-green-600 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-green-600 text-xl">🌍</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Environmental Impact</h2>
      </div>
      
      <p className="text-gray-500 text-sm mb-6">
        Your sustainable choices are making a difference! Every ride contributes to a greener planet.
      </p>
      
      <div className="grid grid-cols-4 gap-4">
        <Stat 
          label="CO₂ Avoided" 
          value={`${co2AvoidedKg.toFixed(1)}kg`} 
          sub="Equivalent to car emissions" 
          icon="🌱"
        />
        <Stat 
          label="Calories Burned" 
          value={`${Math.round(calories).toLocaleString()}`} 
          sub="kcal estimated" 
          icon="💪"
        />
        <Stat 
          label="Trees Equivalent" 
          value={`${treesEq.toFixed(1)}`} 
          sub="tree years of absorption" 
          icon="🌳"
        />
        <Stat 
          label="Distance" 
          value={`${km.toFixed(1)}km`} 
          sub="total ridden" 
          icon="🚴"
        />
      </div>
      
      <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-100">
        <div className="flex items-start">
          <span className="text-green-600 mr-2">💡</span>
          <p className="text-xs text-green-700">
            Based on average emissions data. Your actual impact may vary based on riding conditions and bike type.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [feedbacks, setFeedbacks] = useState([])
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch("/api/user", { cache: "no-store" });
      if (r.status === 401) { router.push("/login?callbackUrl=/user"); return; }
      if (!r.ok) throw new Error("Failed to load profile");
      const p = await r.json();
      setProfile(p);
      setUsername(p.username || "");
      const rr = await fetch("/api/user/rides", { cache: "no-store" }).catch(() => null);
      setRides(rr && rr.ok ? await rr.json() : []);

      const fb = await fetch(`/api/feedback/user/${session.user.id}`)
      setFeedbacks(fb && fb.ok ? await fb.json() : [])
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fetchUserFeedbacks = async () => {
    try {
      const fb = await fetch(`/api/feedback/user/${session.user.id}`)
      setFeedbacks(fb && fb.ok ? await fb.json() : [])
    } catch (err) {
      setErr(err.message || "Failed to load");
    }
  }

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Update failed");
      }
      setPassword("");
      load();
      alert("Profile updated successfully!");
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) await signOut({ callbackUrl: "/" });
    else alert("Failed to delete account");
  };

  const handleEditFeedback = (feedbackId) => {
    router.push(`/feedback/update_form?id=${feedbackId}`);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUserFeedbacks(userId);
      } else {
        console.error("failed to delete feedback")
      }
    } catch (error) {
      setErr(err.message || "Failed to load");
    }
  };

  const logout = async () => { await signOut({ callbackUrl: "/login" }); };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
  
  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-red-500 p-6 bg-red-50 rounded-xl max-w-md">
        <div className="text-2xl mb-2">⚠️</div>
        <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
        <p>{err}</p>
        <button 
          onClick={load}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (!profile) return null;

  const usage = profile.usage || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-500">Manage your account and view your riding history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚴</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{profile.username || profile.email}</h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab("rides")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "rides" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Ride History
                </button>
                <button
                  onClick={() => setActiveTab("loyalty")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "loyalty" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Loyalty Points
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "stats" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setActiveTab("feedbacks")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "feedbacks" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Feedbacks
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={logout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">↩️</span>
                  Logout
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Rides</span>
                  <span className="font-semibold">{usage.totalRides || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Distance</span>
                  <span className="font-semibold">{usage.totalDistance?.toFixed?.(1) || 0} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "profile" && (
              <>
                {/* Profile Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>
                  
                  <form onSubmit={save} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                          {profile.email}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                      <button 
                        type="button"
                        onClick={deleteAccount}
                        className="border border-red-300 text-red-600 hover:bg-red-50 py-3 px-6 rounded-lg transition-colors font-medium"
                      >
                        Delete Account
                      </button>
                    </div>
                  </form>
                </div>

                {/* Eco Impact Card */}
                <EcoImpactCard totalDistanceKm={usage.totalDistance || 0} />
              </>
            )}

            {activeTab === "rides" && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Ride History</h2>
                  <span className="text-sm text-gray-500">{rides.length} rides total</span>
                </div>

                {rides.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🚴</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No rides yet</h3>
                    <p className="text-gray-500">Start your first ride to see your history here</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rides.map((r) => (
                          <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {r.bikeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(r.startTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(r.endTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {r.distanceKm} km
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              LKR {r.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Ride Statistics</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-green-800 mb-2">{usage.totalRides || 0}</div>
                    <div className="text-green-600 font-medium">Total Rides</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-blue-800 mb-2">
                      {usage.totalDistance?.toFixed?.(1) || 0}
                    </div>
                    <div className="text-blue-600 font-medium">Total Distance (km)</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-medium text-gray-800 mb-4">Additional Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">LKR {usage.totalCost || 0}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {usage.lastRideAt ? new Date(usage.lastRideAt).toLocaleDateString() : "—"}
                      </div>
                      <div className="text-sm text-gray-600">Last Ride</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {usage.totalRides ? Math.round(usage.totalDistance / usage.totalRides) : 0} km
                      </div>
                      <div className="text-sm text-gray-600">Avg. Distance/Ride</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "feedbacks" && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">My Feedbacks</h2>

                {feedbacks && feedbacks.length > 0 ? (
                  <div className="grid gap-6">
                    {feedbacks.map((fb) => (
                      <div key={fb._id} className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <p className="text-gray-800 mb-2">{fb.message}</p>
                          <p className="text-sm text-gray-500">Submitted on {new Date(fb.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFeedback(fb._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(fb._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">You have not submitted any feedback yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}