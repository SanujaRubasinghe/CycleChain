"use client";
import NFTViewer from "@/components/NFTViewer";
import contractABI from "@/contracts/BikeOwnershipNFT.json"; // ABI JSON from Hardhat

export default function NFTPage() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tokenId = 1; // Example: show token #1

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Bike NFT</h1>
      <NFTViewer
        contractAddress={contractAddress}
        abi={contractABI.abi}
        tokenId={tokenId}
      />
    </div>
  );
}
