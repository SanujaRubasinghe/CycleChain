"use client";
import { useState } from "react";
import NFTViewer from "@/components/nft/NFTViewer";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";
import contractABI from "@/contracts/BikeOwnershipNFT.json"; // ABI JSON from Hardhat

export default function NFTPage() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const tokenId = 1; // Example: show token #1
  const [viewMode, setViewMode] = useState("demo"); // demo or blockchain

  const demoData = {
    bikeModel: "CycleChain Pro",
    serialNumber: "CC-2024-DEMO1",
    ownerAddress: "0x742d35Cc6634C0532925a3b8D404d4C6d2b47c"
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏆 Your Bike NFT</h1>
        
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("demo")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "demo" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🎮 Demo Mode
          </button>
          <button
            onClick={() => setViewMode("blockchain")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "blockchain" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ⛓️ Blockchain
          </button>
        </div>
      </div>

      {viewMode === "demo" ? (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Demo Mode:</strong> This shows how your NFT would look after minting. 
              The 3D model is loaded from local assets for demonstration purposes.
            </p>
          </div>
          <DemoNFTViewer 
            bikeModel={demoData.bikeModel}
            serialNumber={demoData.serialNumber}
            ownerAddress={demoData.ownerAddress}
            showMetadata={true}
          />
        </div>
      ) : (
        <div>
          {contractAddress ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>Blockchain Mode:</strong> Loading NFT data from smart contract at {contractAddress}
                </p>
              </div>
              <NFTViewer
                contractAddress={contractAddress}
                abi={contractABI.abi}
                tokenId={tokenId}
              />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ No Contract Address</h3>
              <p className="text-yellow-700 mb-4">
                To view blockchain NFTs, you need to deploy the smart contract and set the contract address.
              </p>
              <button
                onClick={() => setViewMode("demo")}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Switch to Demo Mode
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
