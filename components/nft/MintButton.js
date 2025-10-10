"use client";
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "@/contracts/BikeOwnershipNFT.json"; // ABI from Hardhat

import NFTSuccessDisplay from "./NFTSuccessDisplay";
import { getImageUrl, getModelUrl } from "@/config/nft-assets";

// IPFS upload function
const uploadMetadataToIPFS = async (bikeData, serialNumber, userAddress) => {
  try {
    // Create proper metadata with IPFS-hosted image and 3D model
    const metadata = {
      name: `${bikeData.name} #${serialNumber}`,
      description: `Ownership certificate for ${bikeData.name} - ${bikeData.description}. This NFT represents verified ownership of a premium electric bike with blockchain-backed authenticity.`,
      image: getImageUrl(bikeData.name),
      animation_url: getModelUrl(),
      external_url: "https://cyclechain.com",
      attributes: [
        { trait_type: "Model", value: bikeData.name },
        { trait_type: "Serial Number", value: serialNumber },
        { trait_type: "Price", value: `$${bikeData.price}` },
        { trait_type: "Range", value: bikeData.specs.range },
        { trait_type: "Top Speed", value: bikeData.specs.topSpeed },
        { trait_type: "Battery", value: bikeData.specs.battery },
        { trait_type: "Weight", value: bikeData.specs.weight },
        { trait_type: "Motor", value: bikeData.specs.motor },
        { trait_type: "Charging Time", value: bikeData.specs.charging },
        { trait_type: "Purchase Date", value: new Date().toISOString().split('T')[0] },
        { trait_type: "Owner", value: userAddress },
        { trait_type: "Blockchain", value: "Ethereum" },
        { trait_type: "Network", value: "Sepolia Testnet" }
      ]
    };

    // Upload to your local IPFS node
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    formData.append('file', blob, 'metadata.json');
    
    const response = await fetch('http://127.0.0.1:5001/api/v0/add', {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const result = await response.json();
    const ipfsHash = result.Hash;
    
    // Return the IPFS URL
    return `https://ipfs.io/ipfs/${ipfsHash}`;
    
  } catch (error) {
    console.error('IPFS upload failed:', error);
    
    // Fallback to base64 encoded metadata if IPFS fails
    const fallbackMetadata = {
      name: `${bikeData.name} #${serialNumber}`,
      description: `Ownership certificate for ${bikeData.name}`,
      image: bikeData.image || "/bike-placeholder.jpg",
      animation_url: "/assets/model.glb",
      attributes: [
        { trait_type: "Model", value: bikeData.name },
        { trait_type: "Serial Number", value: serialNumber },
        { trait_type: "Price", value: `$${bikeData.price}` },
        { trait_type: "Owner", value: userAddress }
      ]
    };
    
    return `data:application/json;base64,${btoa(JSON.stringify(fallbackMetadata))}`;
  }
};

export default function MintButton({ contractAddress, bikeData, onMintComplete, userAddress }) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState("");
  const [canCancel, setCanCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  const handleMint = async () => {
    setIsMinting(true);
    setMintStatus("Connecting to wallet...");

    try {
      // Check if contract address is provided
      if (!contractAddress) {
        setMintStatus("❌ Contract address not configured. Please contact support.");
        setTimeout(() => {
          setMintStatus("");
          setIsMinting(false);
        }, 5000);
        return;
      }

      // Real minting process
      if (!window.ethereum) {
        alert("Please install MetaMask");
        setIsMinting(false);
        return;
      }

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chain ID
        alert("Please switch to Sepolia testnet");
        setIsMinting(false);
        return;
      }

      // Connect wallet
      setCanCancel(true);
      setMintStatus("Requesting wallet connection...");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Connect contract
      setMintStatus("Connecting to contract...");
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      // Create metadata for the NFT using bike data
      const serialNumber = `CC-${bikeData.model.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}`;
      
      setMintStatus("Creating NFT metadata...");
      
      // Create metadata with your uploaded IPFS assets
      const metadata = {
        name: `${bikeData.name} #${serialNumber}`,
        description: `Ownership certificate for ${bikeData.name} - ${bikeData.description}. This NFT represents verified ownership of a premium electric bike with blockchain-backed authenticity.`,
        image: getImageUrl(bikeData.name),
        animation_url: getModelUrl(),
        external_url: "https://cyclechain.com",
        attributes: [
          { trait_type: "Model", value: bikeData.name },
          { trait_type: "Serial Number", value: serialNumber },
          { trait_type: "Price", value: `$${bikeData.price}` },
          { trait_type: "Range", value: bikeData.specs.range },
          { trait_type: "Top Speed", value: bikeData.specs.topSpeed },
          { trait_type: "Battery", value: bikeData.specs.battery },
          { trait_type: "Weight", value: bikeData.specs.weight },
          { trait_type: "Motor", value: bikeData.specs.motor },
          { trait_type: "Charging Time", value: bikeData.specs.charging },
          { trait_type: "Purchase Date", value: new Date().toISOString().split('T')[0] },
          { trait_type: "Owner", value: userAddress },
          { trait_type: "Blockchain", value: "Ethereum" },
          { trait_type: "Network", value: "Sepolia Testnet" }
        ]
      };
      
      // For now, use base64 encoded metadata (you can upload to IPFS manually later)
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      setMintStatus("Estimating gas...");
      const signerAddress = await signer.getAddress();
      const gasEstimate = await contract.estimateGas.issueBikeNFT(signerAddress, tokenURI);
      
      setMintStatus("Minting NFT...");
      const tx = await contract.issueBikeNFT(signerAddress, tokenURI, {
        gasLimit: gasEstimate.add(50000) // Add some buffer
      });
      
      setMintStatus(`Transaction submitted: ${tx.hash.slice(0, 10)}...`);
      setCanCancel(false); // Can't cancel once transaction is submitted
      setMintStatus("Waiting for confirmation...");
      const receipt = await tx.wait();
      
      // Extract token ID from transaction receipt
      const tokenId = receipt.events?.find(event => event.event === 'Transfer')?.args?.tokenId?.toString() || "1";
      
      setMintStatus(`NFT minted successfully! 🎉 Block: ${receipt.blockNumber}`);
      
      // Store mint result for success display  
      const mintResult = {
        transactionHash: tx.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        serialNumber: serialNumber
      };
      
      setMintResult(mintResult);
      
      // Store NFT data in localStorage for the display page
      const nftData = {
        tokenId: tokenId,
        bikeData: bikeData,
        serialNumber: serialNumber,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        mintDate: new Date().toISOString(),
        owner: userAddress
      };
      
      localStorage.setItem(`nft_${tokenId}`, JSON.stringify(nftData));
      
      // Save NFT data to MongoDB
      try {
        console.log('Attempting to save NFT to database...', {
          tokenId: tokenId,
          contractAddress: contractAddress,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          ownerAddress: userAddress,
          serialNumber: serialNumber,
          purchasePrice: bikeData.price,
          network: 'sepolia'
        });

        const dbResponse = await fetch('/api/nfts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: tokenId,
            contractAddress: contractAddress,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            ownerAddress: userAddress,
            bikeData: bikeData,
            serialNumber: serialNumber,
            purchasePrice: bikeData.price,
            metadataUri: tokenURI,
            imageUrl: getImageUrl(bikeData.name),
            animationUrl: getModelUrl(),
            network: 'sepolia'
          })
        });

        console.log('Database response status:', dbResponse.status);
        
        if (dbResponse.ok) {
          const dbResult = await dbResponse.json();
          console.log('NFT data saved to database successfully:', dbResult);
        } else {
          const errorData = await dbResponse.json().catch(() => ({}));
          console.error('Failed to save NFT data to database:', {
            status: dbResponse.status,
            statusText: dbResponse.statusText,
            error: errorData
          });
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
      }
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        setIsMinting(false);
        if (onMintComplete) onMintComplete();
        
        // Redirect to dedicated 3D NFT display page
        window.location.href = `/nft-display/${tokenId}`;
      }, 2000);
      
    } catch (err) {
      console.error("Minting error:", err);
      
      // Handle different types of errors gracefully
      let errorMessage = "Minting failed. Please try again.";
      
      if (err.code === 4001) {
        // User rejected the transaction
        errorMessage = "Transaction cancelled by user.";
      } else if (err.code === -32603) {
        // Internal JSON-RPC error
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (err.message?.includes("gas")) {
        errorMessage = "Gas estimation failed. Try increasing gas limit.";
      } else if (err.message?.includes("nonce")) {
        errorMessage = "Transaction nonce error. Please reset MetaMask.";
      } else if (err.message?.includes("network")) {
        errorMessage = "Network error. Please check Sepolia connection.";
      } else if (err.message?.includes("contract")) {
        errorMessage = "Contract error. Please verify contract address.";
      }
      
      setMintStatus(errorMessage);
      
      // Show error for longer if it's a cancellation (less urgent)
      const errorDisplayTime = err.code === 4001 ? 2000 : 5000;
      
      setTimeout(() => {
        setMintStatus("");
        setIsMinting(false);
        setCanCancel(false);
      }, errorDisplayTime);
    }
  };

  const handleCancel = () => {
    setMintStatus("Transaction cancelled by user.");
    setIsMinting(false);
    setCanCancel(false);
    
    setTimeout(() => {
      setMintStatus("");
    }, 2000);
  };

  return (
    <div className="text-center">
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleMint}
          disabled={isMinting}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {isMinting ? "Minting..." : "🎨 Mint Ownership NFT"}
        </button>
        
        {canCancel && (
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
      
      {mintStatus && (
        <div className={`mt-4 p-3 rounded-lg border ${
          mintStatus.includes("successfully") || mintStatus.includes("🎉")
            ? "bg-green-50 border-green-200"
            : mintStatus.includes("cancelled") || mintStatus.includes("Transaction cancelled")
            ? "bg-yellow-50 border-yellow-200"
            : mintStatus.includes("failed") || mintStatus.includes("error") || mintStatus.includes("insufficient")
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <p className={`text-sm ${
            mintStatus.includes("successfully") || mintStatus.includes("🎉")
              ? "text-green-800"
              : mintStatus.includes("cancelled") || mintStatus.includes("Transaction cancelled")
              ? "text-yellow-800"
              : mintStatus.includes("failed") || mintStatus.includes("error") || mintStatus.includes("insufficient")
              ? "text-red-800"
              : "text-blue-800"
          }`}>
            {mintStatus.includes("cancelled") ? "⚠️ " : ""}
            {mintStatus.includes("failed") || mintStatus.includes("error") ? "❌ " : ""}
            {mintStatus.includes("successfully") ? "✅ " : ""}
            {mintStatus}
          </p>
          {isMinting && !mintStatus.includes("cancelled") && !mintStatus.includes("failed") && (
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: "60%"}}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Display Modal */}
      {showSuccess && mintResult && (
        <NFTSuccessDisplay
          bikeData={bikeData}
          transactionHash={mintResult.transactionHash}
          tokenId={mintResult.tokenId}
          userAddress={userAddress}
          onClose={() => {
            setShowSuccess(false);
            setMintResult(null);
            setMintStatus("");
          }}
        />
      )}
    </div>
  );
}
