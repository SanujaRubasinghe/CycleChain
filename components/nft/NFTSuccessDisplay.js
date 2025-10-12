"use client";
import { useState } from "react";
import DemoNFTViewer from "./DemoNFTViewer";

export default function NFTSuccessDisplay({ 
  bikeData, 
  transactionHash, 
  tokenId, 
  userAddress,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState("model");
  
  const serialNumber = `CC-${bikeData.model.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}`;
  
  const nftMetadata = {
    name: `${bikeData.name} #${serialNumber}`,
    description: `Ownership certificate for ${bikeData.name} - ${bikeData.description}`,
    image: bikeData.image || "/bike-placeholder.jpg",
    animation_url: "/assets/model.glb",
    attributes: [
      { trait_type: "Model", value: bikeData.name },
      { trait_type: "Serial Number", value: serialNumber },
      { trait_type: "Price", value: `$${bikeData.price}` },
      { trait_type: "Range", value: bikeData.specs.range },
      { trait_type: "Top Speed", value: bikeData.specs.topSpeed },
      { trait_type: "Battery", value: bikeData.specs.battery },
      { trait_type: "Weight", value: bikeData.specs.weight },
      { trait_type: "Purchase Date", value: new Date().toISOString().split('T')[0] },
      { trait_type: "Owner", value: userAddress }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                🎉 NFT Minted Successfully!
              </h2>
              <p className="text-gray-600">
                Your e-bike ownership certificate has been created on the blockchain
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Transaction Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Transaction Hash:</span>
                <p className="text-green-700 font-mono break-all">
                  {transactionHash || "0x1234...abcd"}
                </p>
              </div>
              <div>
                <span className="font-medium text-green-800">Token ID:</span>
                <p className="text-green-700 font-mono">
                  #{tokenId || "1"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("model")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "model"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🎮 3D Model
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📋 NFT Details
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "metadata"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🔗 Metadata
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "model" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Your 3D NFT Certificate</h3>
                <DemoNFTViewer 
                  bikeModel={bikeData.name}
                  serialNumber={serialNumber}
                  ownerAddress={userAddress}
                  showMetadata={false}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">🏆 Ownership Verified</h4>
                <p className="text-blue-700 text-sm">
                  This 3D model represents your ownership certificate stored permanently on the blockchain. 
                  You can view it in any NFT marketplace or wallet that supports 3D models.
                </p>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">E-Bike Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{bikeData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial Number:</span>
                      <span className="font-medium font-mono">{serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-medium text-green-600">LKR {bikeData.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-medium font-mono text-xs">{userAddress}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {Object.entries(bikeData.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Features</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {bikeData.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4">NFT Metadata (JSON)</h3>
                <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-800">
                    {JSON.stringify(nftMetadata, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">📝 About Metadata</h4>
                <p className="text-yellow-700 text-sm">
                  This metadata is stored on IPFS and linked to your NFT on the blockchain. 
                  It contains all the information about your e-bike and ensures your ownership 
                  certificate displays correctly in wallets and marketplaces.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank')}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View on Etherscan
            </button>
            <button
              onClick={() => window.open('https://testnets.opensea.io/', '_blank')}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View on OpenSea
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
