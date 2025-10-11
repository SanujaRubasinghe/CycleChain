"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MintButton from "@/components/nft/MintButton";
import WalletConnect from "@/components/WalletConnect";

// Same bike data as collection page
const BIKE_COLLECTION = [
  {
    id: 1,
    name: "CycleChain Pro",
    model: "Pro",
    price: 2500,
    image: "/bikes/pro.jpg",
    description: "Premium electric bike with advanced features and long-range battery",
    specs: {
      range: "80 miles",
      topSpeed: "28 mph",
      battery: "48V 17.5Ah",
      weight: "55 lbs",
      motor: "750W Mid-Drive",
      charging: "4-6 hours"
    },
    features: [
      "Carbon fiber frame",
      "Hydraulic disc brakes",
      "Smart display with GPS",
      "Integrated lights",
      "Anti-theft system"
    ]
  },
  {
    id: 2,
    name: "CycleChain Urban",
    model: "Urban",
    price: 1800,
    image: "/bikes/urban.jpg",
    description: "Perfect for city commuting with sleek design and reliable performance",
    specs: {
      range: "60 miles",
      topSpeed: "25 mph",
      battery: "48V 14Ah",
      weight: "50 lbs",
      motor: "500W Hub Motor",
      charging: "3-5 hours"
    },
    features: [
      "Lightweight aluminum frame",
      "Puncture-resistant tires",
      "LED display",
      "Removable battery",
      "Foldable pedals"
    ]
  },
  {
    id: 3,
    name: "CycleChain Sport",
    model: "Sport",
    price: 3200,
    image: "/bikes/sport.jpg",
    description: "High-performance e-bike for enthusiasts and long-distance riders",
    specs: {
      range: "100 miles",
      topSpeed: "32 mph",
      battery: "52V 20Ah",
      weight: "58 lbs",
      motor: "1000W Mid-Drive",
      charging: "5-7 hours"
    },
    features: [
      "Full suspension",
      "Premium components",
      "Advanced motor controller",
      "Weather-resistant design",
      "Mobile app integration"
    ]
  },
  {
    id: 4,
    name: "CycleChain Eco",
    model: "Eco",
    price: 1200,
    image: "/bikes/eco.jpg",
    description: "Affordable and eco-friendly option for everyday transportation",
    specs: {
      range: "45 miles",
      topSpeed: "20 mph",
      battery: "36V 12Ah",
      weight: "45 lbs",
      motor: "350W Hub Motor",
      charging: "2-4 hours"
    },
    features: [
      "Sustainable materials",
      "Basic LCD display",
      "Standard brakes",
      "Comfortable seat",
      "Simple controls"
    ]
  }
];

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const user = session?.user;
  const [bike, setBike] = useState(null);
  const [step, setStep] = useState("review"); // review, payment, minting, complete
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/collection");
      return;
    }

    const bikeId = parseInt(params.id);
    const selectedBike = BIKE_COLLECTION.find(b => b.id === bikeId);
    
    if (!selectedBike) {
      router.push("/collection");
      return;
    }
    
    setBike(selectedBike);
  }, [params.id, isLoggedIn, router]);

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setStep("minting");
    }, 3000);
  };

  const handleMintComplete = () => {
    // In a real app, you would save the order to your database here
    console.log("Order completed:", {
      bikeId: bike.id,
      bikeName: bike.name,
      price: bike.price,
      shippingInfo: shippingInfo,
      nftMinted: true,
      user: user
    });

    setStep("complete");
    
    // Redirect to 3D NFT display page after 3 seconds
    setTimeout(() => {
      router.push(`/nft-display/1`); // In real app, use actual token ID
    }, 3000);
  };

  if (!bike || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderReviewStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Complete Your Purchase</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Bike Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500 text-xl">🚲 {bike.name}</span>
          </div>
          
          <h3 className="text-lg font-bold">{bike.name}</h3>
          <p className="text-gray-600 mb-4">{bike.description}</p>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">${bike.price.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Includes NFT ownership certificate
            </p>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("payment")}
            disabled={!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Payment</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span>{bike.name}</span>
          <span className="font-bold">${bike.price.toLocaleString()}</span>
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">${bike.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This is a demo. In production, this would integrate with Stripe, PayPal, or other payment processors.
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={paymentProcessing}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold"
      >
        {paymentProcessing ? "Processing Payment..." : `Pay $${bike.price.toLocaleString()}`}
      </button>
    </div>
  );

  const renderMintingStep = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-8">Payment Successful!</h1>
      
      <div className="bg-green-100 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Congratulations!</h3>
        <p className="text-green-700 mb-2">Your payment has been processed successfully.</p>
        <p className="text-green-700">Now let's mint your ownership NFT!</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-bold">{bike.name}</h3>
        <p className="text-gray-600">Your e-bike will be shipped to:</p>
        <p className="text-sm text-gray-600">
          {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
        </p>
      </div>

      <WalletConnect>
        <MintButton 
          contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
          bikeData={bike}
          onMintComplete={handleMintComplete}
          userAddress={user?.walletAddress}
        />
      </WalletConnect>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-8">🎉 Purchase Complete!</h1>
      
      <div className="bg-green-100 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Your E-Bike is On Its Way!</h3>
        <p className="text-green-700 mb-2">✅ Payment Processed</p>
        <p className="text-green-700 mb-2">✅ NFT Minted Successfully</p>
        <p className="text-green-700 mb-4">✅ Ownership Verified on Blockchain</p>
        <p className="text-sm text-gray-600">Redirecting to your NFT collection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {["Review", "Payment", "NFT Minting", "Complete"].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= ["review", "payment", "minting", "complete"].indexOf(step)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= ["review", "payment", "minting", "complete"].indexOf(step)
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}>
                  {stepName}
                </span>
                {index < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === "review" && renderReviewStep()}
      {step === "payment" && renderPaymentStep()}
      {step === "minting" && renderMintingStep()}
      {step === "complete" && renderCompleteStep()}
    </div>
  );
}
