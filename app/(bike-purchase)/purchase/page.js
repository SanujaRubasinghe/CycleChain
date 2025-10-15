"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MintButton from "@/components/nft/MintButton";

const BIKE_MODELS = [
  {
    id: 1,
    name: "CycleChain Pro",
    price: 2500,
    image: "/bike-1.jpg",
    description: "Premium electric bike with advanced features",
    specs: {
      range: "80 miles",
      topSpeed: "28 mph",
      battery: "48V 17.5Ah",
      weight: "55 lbs"
    }
  },
  {
    id: 2,
    name: "CycleChain Urban",
    price: 1800,
    image: "/bike-2.jpg", 
    description: "Perfect for city commuting",
    specs: {
      range: "60 miles",
      topSpeed: "25 mph",
      battery: "48V 14Ah",
      weight: "50 lbs"
    }
  },
  {
    id: 3,
    name: "CycleChain Sport",
    price: 3200,
    image: "/bike-3.jpg",
    description: "High-performance e-bike for enthusiasts",
    specs: {
      range: "100 miles",
      topSpeed: "32 mph",
      battery: "52V 20Ah",
      weight: "58 lbs"
    }
  }
];

export default function PurchasePage() {
  const [selectedBike, setSelectedBike] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState("select"); // select, payment, minting, complete
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    address: "",
    walletAddress: ""
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const router = useRouter();

  const handleBikeSelect = (bike) => {
    setSelectedBike(bike);
    setPurchaseStep("payment");
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPurchaseStep("minting");
    }, 3000);
  };

  const handleMintComplete = () => {
    setPurchaseStep("complete");
    // Redirect to NFT page after 3 seconds
    setTimeout(() => {
      router.push("/nft");
    }, 3000);
  };

  const renderBikeSelection = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your E-Bike</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {BIKE_MODELS.map((bike) => (
          <div key={bike.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Bike Image</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{bike.name}</h3>
              <p className="text-gray-600 mb-4">{bike.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-medium">{bike.specs.range}</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Speed:</span>
                  <span className="font-medium">{bike.specs.topSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Battery:</span>
                  <span className="font-medium">{bike.specs.battery}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">{bike.specs.weight}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">LKR {bike.price}</span>
                <button
                  onClick={() => handleBikeSelect(bike)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Complete Your Purchase</h1>
      
      {selectedBike && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-bold">{selectedBike.name}</h3>
          <p className="text-gray-600">{selectedBike.description}</p>
          <p className="text-2xl font-bold text-green-600">LKR {selectedBike.price}</p>
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Shipping Address</label>
          <textarea
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
            className="w-full p-2 border rounded-lg h-20"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Wallet Address (for NFT)</label>
          <input
            type="text"
            value={customerInfo.walletAddress}
            onChange={(e) => setCustomerInfo({...customerInfo, walletAddress: e.target.value})}
            className="w-full p-2 border rounded-lg"
            placeholder="0x..."
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {paymentProcessing ? "Processing Payment..." : `Pay LKR ${selectedBike?.price}`}
          </button>
        </div>
      </form>
    </div>
  );

  const renderMinting = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-8">Payment Successful!</h1>
      <div className="bg-green-100 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Congratulations!</h3>
        <p className="text-green-700">Your payment has been processed successfully.</p>
        <p className="text-green-700">Now let's mint your ownership NFT!</p>
      </div>
      
      {selectedBike && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-bold">{selectedBike.name}</h3>
          <p className="text-gray-600">Serial Number: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      )}

      <MintButton 
        contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "demo-contract"}
        metadataCID="demo-metadata"
        onMintComplete={handleMintComplete}
        demoMode={!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
      />
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-8">🎉 Purchase Complete!</h1>
      <div className="bg-green-100 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Your E-Bike is On Its Way!</h3>
        <p className="text-green-700 mb-2">✅ Payment Processed</p>
        <p className="text-green-700 mb-2">✅ NFT Minted Successfully</p>
        <p className="text-green-700 mb-4">✅ Ownership Verified on Blockchain</p>
        <p className="text-sm text-gray-600">Redirecting to view your NFT...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {purchaseStep === "select" && renderBikeSelection()}
      {purchaseStep === "payment" && renderPaymentForm()}
      {purchaseStep === "minting" && renderMinting()}
      {purchaseStep === "complete" && renderComplete()}
    </div>
  );
}
