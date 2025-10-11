"use client";
import { useState } from "react";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";
import MintButton from "@/components/nft/MintButton";
import WalletConnect from "@/components/WalletConnect";
import GasEstimator from "@/components/GasEstimator";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState("purchase"); // purchase, minted, viewing
  const [selectedBike] = useState({
    name: "CycleChain Pro",
    serialNumber: "CC-2024-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    ownerAddress: "0x742d35Cc6634C0532925a3b8D404d4C" + Math.random().toString(36).substr(2, 6)
  });

  const handleMintComplete = () => {
    setCurrentStep("minted");
    setTimeout(() => {
      setCurrentStep("viewing");
    }, 2000);
  };

  const renderPurchaseStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🚲 CycleChain NFT Demo</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Demo Scenario</h2>
        <p className="text-gray-600 mb-4">
          This demo shows the complete e-bike purchase and NFT minting flow. 
          You'll see how customers receive a 3D NFT certificate after purchasing an e-bike.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-blue-800">Selected Bike: {selectedBike.name}</h3>
          <p className="text-blue-600">Serial: {selectedBike.serialNumber}</p>
          <p className="text-blue-600">Price: $2,500</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-bold text-green-800">🎮 Demo Mode</h4>
            <p className="text-green-600 text-sm">Simulated minting (no gas fees)</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-bold text-purple-800">⛓️ Real Blockchain</h4>
            <p className="text-purple-600 text-sm">Actual NFT minting on Sepolia</p>
          </div>
        </div>
      </div>

      <WalletConnect>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">🎮 Demo Mode</p>
            <MintButton 
              contractAddress="demo-contract"
              metadataCID="demo-metadata"
              onMintComplete={handleMintComplete}
              demoMode={true}
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">⛓️ Real Blockchain</p>
            <MintButton 
              contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
              metadataCID="demo-metadata"
              onMintComplete={handleMintComplete}
              demoMode={false}
            />
          </div>
        </div>
        
        <GasEstimator 
          contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
        />
      </WalletConnect>
    </div>
  );

  const renderMintedStep = () => (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="bg-green-100 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-green-800 mb-4">🎉 NFT Minted Successfully!</h1>
        <p className="text-green-700 mb-4">Your ownership certificate has been created on the blockchain.</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-sm text-green-600">Loading your 3D NFT...</p>
      </div>
    </div>
  );

  const renderViewingStep = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2">🏆 Your E-Bike Ownership NFT</h1>
      <p className="text-center text-gray-600 mb-8">
        Congratulations! Here's your blockchain-verified ownership certificate.
      </p>
      
      <DemoNFTViewer 
        bikeModel={selectedBike.name}
        serialNumber={selectedBike.serialNumber}
        ownerAddress={selectedBike.ownerAddress}
        showMetadata={true}
      />

      <div className="mt-8 text-center">
        <button
          onClick={() => setCurrentStep("purchase")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 mr-4"
        >
          🔄 Reset Demo
        </button>
        
        <button
          onClick={() => window.open("/purchase", "_blank")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          🛒 Try Full Purchase Flow
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "purchase" && renderPurchaseStep()}
      {currentStep === "minted" && renderMintedStep()}
      {currentStep === "viewing" && renderViewingStep()}
    </div>
  );
}
