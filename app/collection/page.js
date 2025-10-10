"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function CollectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session;
  const [selectedBike, setSelectedBike] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredBikes = filter === "all" 
    ? BIKE_COLLECTION 
    : BIKE_COLLECTION.filter(bike => bike.category === filter);

  const handlePurchase = (bike) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    // Redirect to purchase flow
    router.push(`/purchase/${bike.id}`);
  };

  const BikeCard = ({ bike }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">🚲 {bike.name}</span>
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

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedBike(bike)}
            className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => handlePurchase(bike)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLoggedIn ? 'Purchase' : 'Sign In to Buy'}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚲 E-Bike Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our premium electric bikes. Each purchase includes a unique NFT ownership certificate.
          </p>
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
                    ? "bg-blue-600 text-white"
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
      {selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                <span className="text-gray-500 text-2xl">🚲 {selectedBike.name}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedBike.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Features</h3>
                  <ul className="space-y-1">
                    {selectedBike.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-green-600">
                    ${selectedBike.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handlePurchase(selectedBike)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold"
                  >
                    {isLoggedIn ? 'Purchase Now' : 'Sign In to Buy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
