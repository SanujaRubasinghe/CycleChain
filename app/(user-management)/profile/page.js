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
  const [feedbacks, setFeedbacks] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [cards, setCards] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  });

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

  const loadCards = async () => {
    try {
      // First, ensure cards field exists (migration)
      console.log("Running migration...");
      const migrationRes = await fetch("/api/user/migrate-cards", { 
        method: "POST",
        cache: "no-store" 
      });
      const migrationData = await migrationRes.json();
      console.log("Migration result:", migrationData);
      
      // Then load cards
      const res = await fetch("/api/user/cards", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        console.log("Loaded cards:", data);
        setCards(data);
      } else {
        console.error("Failed to load cards - status:", res.status);
        const errorData = await res.json().catch(() => ({}));
        console.error("Error details:", errorData);
        setCards([]);
      }
    } catch (e) {
      console.error("Failed to load cards:", e);
      setCards([]);
    }
  };

  useEffect(() => {
    if (activeTab === "cards") {
      loadCards();
    }
  }, [activeTab]);

  // Card type detection based on card number
  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, "");
    
    // Visa: starts with 4
    if (/^4/.test(cleaned)) {
      return { type: "Visa", icon: "💳" };
    }
    
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleaned)) {
      return { type: "Mastercard", icon: "💳" };
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleaned)) {
      return { type: "American Express", icon: "💳" };
    }
    
    // Discover: starts with 6011, 622126-622925, 644-649, or 65
    if (/^6011|^622[1-9]|^64[4-9]|^65/.test(cleaned)) {
      return { type: "Discover", icon: "💳" };
    }
    
    return { type: "Unknown", icon: "💳" };
  };

  // Luhn algorithm for card number validation
  const validateCardNumberLuhn = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validate expiry date
  const validateExpiryDate = (month, year) => {
    if (!month || !year) return { valid: false, message: "Month and year are required" };
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate month range
    if (monthNum < 1 || monthNum > 12) {
      return { valid: false, message: "Month must be between 01 and 12" };
    }
    
    // Validate year format
    if (year.length !== 4) {
      return { valid: false, message: "Year must be 4 digits (YYYY)" };
    }
    
    // Check if card is expired
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return { valid: false, message: "Card has expired" };
    }
    
    // Check if year is too far in the future (more than 20 years)
    if (yearNum > currentYear + 20) {
      return { valid: false, message: "Invalid expiry year" };
    }
    
    return { valid: true, message: "" };
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validate numeric fields
    if (name === 'expiryMonth') {
      // Only allow digits
      if (value && !/^\d*$/.test(value)) return;
      // Limit to 2 digits
      if (value.length > 2) return;
      // Auto-pad single digit months
      if (value.length === 1 && parseInt(value) > 1) {
        setCardForm((prev) => ({ ...prev, [name]: '0' + value }));
        return;
      }
      // Validate month range as user types
      if (value.length === 2 && (parseInt(value) < 1 || parseInt(value) > 12)) {
        return;
      }
    }
    
    if (name === 'expiryYear') {
      // Only allow digits
      if (value && !/^\d*$/.test(value)) return;
      // Limit to 4 digits
      if (value.length > 4) return;
    }
    
    if (name === 'cvv') {
      // Only allow digits
      if (value && !/^\d*$/.test(value)) return;
      // Limit to 3 digits only
      if (value.length > 3) return;
    }
    
    setCardForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, "");
    // Allow only digits and limit to 19 digits (some cards can be longer than 16)
    if (/^\d*$/.test(value) && value.length <= 19) {
      setCardForm((prev) => ({ ...prev, cardNumber: value }));
    }
  };

  const addCard = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!cardForm.cardholderName.trim()) {
      alert("Please enter cardholder name");
      return;
    }
    
    // Validate card number length
    if (cardForm.cardNumber.length < 13 || cardForm.cardNumber.length > 19) {
      alert("Card number must be between 13 and 19 digits");
      return;
    }
    
    // Validate card number using Luhn algorithm
    if (!validateCardNumberLuhn(cardForm.cardNumber)) {
      alert("Invalid card number. Please check and try again.");
      return;
    }
    
    // Detect card type
    const cardType = detectCardType(cardForm.cardNumber);
    if (cardType.type === "Unknown") {
      const proceed = confirm("Card type could not be detected. Do you want to continue?");
      if (!proceed) return;
    }
    
    // Validate expiry month
    if (!cardForm.expiryMonth || cardForm.expiryMonth.length !== 2) {
      alert("Please enter expiry month (MM)");
      return;
    }
    
    // Validate expiry year
    if (!cardForm.expiryYear || cardForm.expiryYear.length !== 4) {
      alert("Please enter expiry year (YYYY)");
      return;
    }
    
    // Validate expiry date
    const expiryValidation = validateExpiryDate(cardForm.expiryMonth, cardForm.expiryYear);
    if (!expiryValidation.valid) {
      alert(expiryValidation.message);
      return;
    }
    
    // Validate CVV (3 digits only)
    if (!cardForm.cvv || cardForm.cvv.length !== 3) {
      alert("Please enter valid 3-digit CVV");
      return;
    }
    
    try {
      const res = await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardForm),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add card");
      }
      
      const result = await res.json();
      console.log("Card added:", result);
      
      // Reset form
      setShowAddCard(false);
      setCardForm({
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        isDefault: false,
      });
      
      // Reload cards
      await loadCards();
      alert("Card added successfully!");
    } catch (e) {
      alert(e.message || "Failed to add card");
    }
  };

  const deleteCard = async (cardId) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    
    try {
      const res = await fetch(`/api/user/cards/${cardId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete card");
      }
      
      alert("Card deleted successfully!");
      loadCards();
    } catch (e) {
      alert(e.message || "Failed to delete card");
    }
  };

  const setDefaultCard = async (cardId) => {
    try {
      const res = await fetch(`/api/user/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to set default card");
      }
      
      loadCards();
    } catch (e) {
      alert(e.message || "Failed to set default card");
    }
  };

  const startEditCard = (card) => {
    setEditingCardId(card._id);
    setCardForm({
      cardholderName: card.cardholderName,
      cardNumber: card.cardNumber.replace(/\*/g, "").replace(/\s/g, "").slice(-4), // Only last 4 digits available
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: "", // CVV needs to be re-entered for security
      isDefault: card.isDefault,
    });
    setShowAddCard(true);
  };

  const updateCard = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!cardForm.cardholderName.trim()) {
      alert("Please enter cardholder name");
      return;
    }
    
    // Validate card number length
    if (cardForm.cardNumber.length < 13 || cardForm.cardNumber.length > 19) {
      alert("Card number must be between 13 and 19 digits");
      return;
    }
    
    // Validate card number using Luhn algorithm
    if (!validateCardNumberLuhn(cardForm.cardNumber)) {
      alert("Invalid card number. Please check and try again.");
      return;
    }
    
    // Detect card type
    const cardType = detectCardType(cardForm.cardNumber);
    if (cardType.type === "Unknown") {
      const proceed = confirm("Card type could not be detected. Do you want to continue?");
      if (!proceed) return;
    }
    
    // Validate expiry month
    if (!cardForm.expiryMonth || cardForm.expiryMonth.length !== 2) {
      alert("Please enter expiry month (MM)");
      return;
    }
    
    // Validate expiry year
    if (!cardForm.expiryYear || cardForm.expiryYear.length !== 4) {
      alert("Please enter expiry year (YYYY)");
      return;
    }
    
    // Validate expiry date
    const expiryValidation = validateExpiryDate(cardForm.expiryMonth, cardForm.expiryYear);
    if (!expiryValidation.valid) {
      alert(expiryValidation.message);
      return;
    }
    
    // Validate CVV (3 digits only)
    if (!cardForm.cvv || cardForm.cvv.length !== 3) {
      alert("Please enter valid 3-digit CVV");
      return;
    }
    
    try {
      const res = await fetch(`/api/user/cards/${editingCardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardForm),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update card");
      }
      
      const result = await res.json();
      console.log("Card updated:", result);
      
      // Reset form
      setShowAddCard(false);
      setEditingCardId(null);
      setCardForm({
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        isDefault: false,
      });
      
      // Reload cards
      await loadCards();
      alert("Card updated successfully!");
    } catch (e) {
      alert(e.message || "Failed to update card");
    }
  };

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
        <div className="text-2xl mb-2">⚠️</div>
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
                <button
                  onClick={() => setActiveTab("cards")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "cards" 
                      ? "bg-green-100 text-green-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Payment Cards
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={logout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">↩️</span>
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
                              {new Date(r.start_time).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(r.end_time).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {r.distance} km
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
          
            {activeTab === "cards" && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Payment Cards</h2>
                    <p className="text-sm text-gray-500 mt-1">{cards.length} card(s) saved</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadCards}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center"
                      title="Refresh cards"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={() => {
                        setEditingCardId(null);
                        setCardForm({
                          cardholderName: "",
                          cardNumber: "",
                          expiryMonth: "",
                          expiryYear: "",
                          cvv: "",
                          isDefault: false,
                        });
                        setShowAddCard(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <span className="mr-2">+</span>
                      Add Card
                    </button>
                  </div>
                </div>

                {showAddCard && (
                  <div className="mb-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {editingCardId ? "Edit Card" : "Add New Card"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddCard(false);
                          setEditingCardId(null);
                          setCardForm({
                            cardholderName: "",
                            cardNumber: "",
                            expiryMonth: "",
                            expiryYear: "",
                            cvv: "",
                            isDefault: false,
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {editingCardId && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ For security reasons, you need to re-enter the full card number and CVV.
                        </p>
                      </div>
                    )}
                    
                    <form onSubmit={editingCardId ? updateCard : addCard} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardholderName"
                          value={cardForm.cardholderName}
                          onChange={handleCardFormChange}
                          placeholder="John Doe"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                          {cardForm.cardNumber.length >= 4 && (
                            <span className="ml-2 text-xs font-normal text-blue-600">
                              ({detectCardType(cardForm.cardNumber).type})
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            value={formatCardNumber(cardForm.cardNumber)}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />
                          {cardForm.cardNumber.length >= 4 && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl">
                              {detectCardType(cardForm.cardNumber).icon}
                            </div>
                          )}
                        </div>
                        {cardForm.cardNumber.length >= 13 && !validateCardNumberLuhn(cardForm.cardNumber) && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Invalid card number
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month
                          </label>
                          <input
                            type="text"
                            name="expiryMonth"
                            value={cardForm.expiryMonth}
                            onChange={handleCardFormChange}
                            placeholder="MM"
                            maxLength="2"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year
                          </label>
                          <input
                            type="text"
                            name="expiryYear"
                            value={cardForm.expiryYear}
                            onChange={handleCardFormChange}
                            placeholder="YYYY"
                            maxLength="4"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardForm.cvv}
                            onChange={handleCardFormChange}
                            placeholder="123"
                            maxLength="3"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={cardForm.isDefault}
                          onChange={handleCardFormChange}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Set as default payment method
                        </label>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                        >
                          {editingCardId ? "Update Card" : "Add Card"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCard(false);
                            setEditingCardId(null);
                            setCardForm({
                              cardholderName: "",
                              cardNumber: "",
                              expiryMonth: "",
                              expiryYear: "",
                              cvv: "",
                              isDefault: false,
                            });
                          }}
                          className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {cards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💳</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No cards saved</h3>
                    <p className="text-gray-500">Add a payment card to make checkouts faster</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {cards.map((card) => (
                      <div
                        key={card._id}
                        className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-2">
                              {card.isDefault && (
                                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium w-fit">
                                  Default
                                </span>
                              )}
                              <span className="text-xs opacity-90 font-medium">
                                {detectCardType(card.cardNumber).type}
                              </span>
                            </div>
                            <div className="text-2xl">💳</div>
                          </div>

                          <div className="mb-6">
                            <div className="text-xl tracking-wider font-mono">
                              {card.cardNumber}
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs opacity-75 mb-1">Cardholder</div>
                              <div className="font-medium">{card.cardholderName}</div>
                            </div>
                            <div>
                              <div className="text-xs opacity-75 mb-1">Expires</div>
                              <div className="font-medium">{card.expiryMonth}/{card.expiryYear}</div>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            {!card.isDefault && (
                              <button
                                onClick={() => setDefaultCard(card._id)}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={() => startEditCard(card)}
                              className="bg-yellow-500 bg-opacity-80 hover:bg-opacity-100 px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCard(card._id)}
                              className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

