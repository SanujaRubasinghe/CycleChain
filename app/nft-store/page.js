"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";
import MintButton from "@/components/nft/MintButton";
import WalletConnect from "@/components/WalletConnect";

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
    ],
    inStock: true,
    category: "premium"
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
    ],
    inStock: true,
    category: "urban"
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
    ],
    inStock: true,
    category: "performance"
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
    ],
    inStock: true,
    category: "budget"
  }
];

export default function NFTStorePage() {
  const { data: session } = useSession();
  const [selectedBike, setSelectedBike] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState("info"); // info, payment, minting, complete

  const filteredBikes = filter === "all" 
    ? BIKE_COLLECTION 
    : BIKE_COLLECTION.filter(bike => bike.category === filter);

  const handlePurchase = (bike) => {
    if (!session) {
      alert("Please sign in to purchase e-bikes and mint NFTs");
      return;
    }
    setSelectedBike(bike);
    setShowPurchaseModal(true);
    setPurchaseStep("info");
  };

  const handleMintComplete = () => {
    setPurchaseStep("complete");
    setTimeout(() => {
      setShowPurchaseModal(false);
      setPurchaseStep("info");
      setSelectedBike(null);
    }, 3000);
  };

  const BikeCard = ({ bike }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-2xl">🚲</span>
        <div className="ml-2">
          <div className="font-bold">{bike.name}</div>
          <div className="text-sm text-gray-600">NFT Included</div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
          <span className="text-2xl font-bold text-green-600">${bike.price.toLocaleString()}</span>
        </div>
        
        <p className="text-gray-600 mb-4">{bike.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Range:</span>
            <span className="font-medium">{bike.specs.range}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Top Speed:</span>
            <span className="font-medium">{bike.specs.topSpeed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Battery:</span>
            <span className="font-medium">{bike.specs.battery}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Weight:</span>
            <span className="font-medium">{bike.specs.weight}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-blue-800 text-sm">
            <span className="text-lg mr-2">🏆</span>
            <span className="font-medium">Includes 3D NFT Ownership Certificate</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedBike(bike)}
            className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => handlePurchase(bike)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            {session ? 'Buy & Mint NFT' : 'Sign In to Buy'}
          </button>
        </div>

        {bike.inStock ? (
          <div className="flex items-center text-green-600 text-sm">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            In Stock
          </div>
        ) : (
          <div className="flex items-center text-red-600 text-sm">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 NFT E-Bike Store
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purchase premium electric bikes and receive unique NFT ownership certificates. 
            Each bike comes with a 3D blockchain-verified certificate that proves your ownership forever.
          </p>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This is separate from our bike rental service. 
              These are bikes you can purchase and own permanently with NFT certificates.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border p-1">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-green-600 transition text-sm">
              🚲 Bike Rentals
            </Link>
            <span className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium">
              🏆 NFT Store
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border p-1">
            {[
              { key: "all", label: "All Bikes" },
              { key: "budget", label: "Budget" },
              { key: "urban", label: "Urban" },
              { key: "premium", label: "Premium" },
              { key: "performance", label: "Performance" }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bike Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </div>

        {filteredBikes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bikes found in this category.</p>
          </div>
        )}
      </div>

      {/* Bike Details Modal */}
      {selectedBike && !showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedBike.name}</h2>
                <button
                  onClick={() => setSelectedBike(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-gray-500 text-3xl">🚲 {selectedBike.name}</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">🏆 NFT Certificate Included</h4>
                    <p className="text-green-700 text-sm">
                      Your purchase includes a unique 3D NFT that serves as your permanent ownership certificate, 
                      stored on the blockchain forever.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Specifications</h3>
                  <div className="space-y-2 mb-6">
                    {Object.entries(selectedBike.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-lg mb-3">Features</h3>
                  <ul className="space-y-1 mb-6">
                    {selectedBike.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold text-green-600">
                        ${selectedBike.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handlePurchase(selectedBike)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
                      >
                        {session ? 'Buy & Mint NFT' : 'Sign In to Buy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Purchase & Mint NFT</h2>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {purchaseStep === "info" && (
                <div>
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-bold">{selectedBike.name}</h3>
                    <p className="text-gray-600">{selectedBike.description}</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">${selectedBike.price.toLocaleString()}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-blue-800 mb-2">What's Included:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>✅ Physical e-bike delivered to your address</li>
                      <li>✅ 3D NFT ownership certificate</li>
                      <li>✅ Blockchain verification of ownership</li>
                      <li>✅ Transferable digital certificate</li>
                      <li>✅ Warranty and support</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setPurchaseStep("minting")}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
                  >
                    Continue to NFT Minting
                  </button>
                </div>
              )}

              {purchaseStep === "minting" && (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Ready to Mint Your NFT!</h3>
                    <p className="text-gray-600">
                      Connect your wallet and mint your ownership certificate for {selectedBike.name}
                    </p>
                  </div>

                  <WalletConnect>
                    <MintButton 
                      contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
                      bikeData={selectedBike}
                      onMintComplete={handleMintComplete}
                      userAddress={session?.user?.email}
                    />
                  </WalletConnect>
                </div>
              )}

              {purchaseStep === "complete" && (
                <div className="text-center">
                  <div className="bg-green-100 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-800 mb-4">🎉 Purchase Complete!</h3>
                    <p className="text-green-700 mb-2">✅ Payment Processed</p>
                    <p className="text-green-700 mb-2">✅ NFT Minted Successfully</p>
                    <p className="text-green-700 mb-4">✅ Ownership Verified on Blockchain</p>
                    <p className="text-sm text-gray-600">Your e-bike will be shipped soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
