"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";
import { getImageUrl, getModelUrl } from "@/config/nft-assets";

// Sample bike data - in a real app, this would come from your database
const BIKE_COLLECTION = [
  {
    id: 1,
    name: "CycleChain Pro",
    model: "Pro",
    price: 2500,
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

export default function NFTDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("model");

  const tokenId = params.tokenId;

  useEffect(() => {
    // In a real app, you would fetch NFT data from blockchain/database using tokenId
    // For now, we'll simulate this with URL parameters or localStorage
    const simulateNFTData = () => {
      // Try to get data from localStorage (set during minting)
      const mintedNFTData = localStorage.getItem(`nft_${tokenId}`);
      
      if (mintedNFTData) {
        const parsedData = JSON.parse(mintedNFTData);
        setNftData(parsedData);
      } else {
        // Fallback: use first bike as example
        const bike = BIKE_COLLECTION[0];
        const serialNumber = `CC-${bike.model.toUpperCase()}-${tokenId}`;
        
        setNftData({
          tokenId: tokenId,
          bikeData: bike,
          serialNumber: serialNumber,
          transactionHash: "0x1234567890abcdef...",
          blockNumber: "12345678",
          mintDate: new Date().toISOString(),
          owner: session?.user?.email || "demo@cyclechain.com"
        });
      }
      
      setLoading(false);
    };

    simulateNFTData();
  }, [tokenId, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your NFT...</p>
        </div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">NFT Not Found</h1>
          <p className="text-gray-600 mb-6">The requested NFT could not be found.</p>
          <button
            onClick={() => router.push('/nft-store')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to NFT Store
          </button>
        </div>
      </div>
    );
  }

  const { bikeData, serialNumber, transactionHash, blockNumber, mintDate, owner } = nftData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Your NFT Certificate
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Congratulations! Your e-bike ownership is now verified on the blockchain forever.
          </p>
        </div>

        {/* NFT Info Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Token ID</h3>
              <p className="text-2xl font-bold text-blue-600">#{tokenId}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Serial Number</h3>
              <p className="text-xl font-mono text-gray-800">{serialNumber}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bike Model</h3>
              <p className="text-xl font-semibold text-green-600">{bikeData.name}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("model")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "model"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              🎮 3D Model
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "details"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              📋 Details
            </button>
            <button
              onClick={() => setActiveTab("blockchain")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "blockchain"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              🔗 Blockchain
            </button>
          </div>

          <div className="p-6">
            {activeTab === "model" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6">Your 3D NFT Certificate</h3>
                  <DemoNFTViewer 
                    bikeModel={bikeData.name}
                    serialNumber={serialNumber}
                    ownerAddress={owner}
                    showMetadata={false}
                  />
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-bold text-green-800 mb-3 text-lg">🏆 Ownership Verified</h4>
                  <p className="text-green-700">
                    This interactive 3D model represents your ownership certificate stored permanently on the blockchain. 
                    You can view it in any NFT marketplace or wallet that supports 3D models. The model is hosted on IPFS 
                    for decentralized access and will remain available forever.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">E-Bike Specifications</h3>
                    <div className="space-y-3">
                      {Object.entries(bikeData.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">Purchase Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Purchase Price:</span>
                        <span className="font-medium text-green-600">${bikeData.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Mint Date:</span>
                        <span className="font-medium">{new Date(mintDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium font-mono text-sm">{owner}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Features & Benefits</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {bikeData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "blockchain" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-3">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Transaction Hash:</span>
                        <p className="font-mono text-blue-600 break-all">{transactionHash}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Block Number:</span>
                        <p className="font-mono">{blockNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Network:</span>
                        <p>Ethereum Sepolia Testnet</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-3">NFT Metadata</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Image URL:</span>
                        <p className="font-mono text-blue-600 break-all text-xs">{getImageUrl(bikeData.name)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">3D Model URL:</span>
                        <p className="font-mono text-blue-600 break-all text-xs">{getModelUrl()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Standard:</span>
                        <p>ERC-721</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-bold text-yellow-800 mb-3">📝 About Your NFT</h4>
                  <p className="text-yellow-700 text-sm">
                    Your NFT is stored on the Ethereum blockchain and follows the ERC-721 standard. 
                    The metadata and 3D model are hosted on IPFS (InterPlanetary File System) for 
                    decentralized, permanent storage. This ensures your ownership certificate will 
                    remain accessible forever, even if our website goes offline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <button
            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View on Etherscan
          </button>
          <button
            onClick={() => window.open('https://testnets.opensea.io/', '_blank')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View on OpenSea
          </button>
          <button
            onClick={() => router.push('/my-nfts')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            My NFT Collection
          </button>
          <button
            onClick={() => router.push('/nft-store')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
