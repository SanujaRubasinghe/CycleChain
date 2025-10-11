"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "@/contracts/BikeOwnershipNFT.json";

export default function GasEstimator({ contractAddress }) {
  const [gasEstimate, setGasEstimate] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const estimateGas = async () => {
    if (!window.ethereum || !contractAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      // Get current gas price
      const currentGasPrice = await provider.getGasPrice();
      setGasPrice(currentGasPrice);

      // Create sample metadata for estimation
      const sampleMetadata = {
        name: "Sample NFT",
        description: "Sample for gas estimation"
      };
      const sampleTokenURI = `data:application/json;base64,${btoa(JSON.stringify(sampleMetadata))}`;

      // Estimate gas for minting
      const signerAddress = await signer.getAddress();
      const gasEstimateResult = await contract.estimateGas.issueBikeNFT(signerAddress, sampleTokenURI);
      
      // Add buffer (50,000 gas)
      const totalGas = gasEstimateResult.add(50000);
      setGasEstimate(totalGas);

      // Calculate cost in ETH
      const costInWei = totalGas.mul(currentGasPrice);
      const costInEth = ethers.utils.formatEther(costInWei);
      setEstimatedCost(costInEth);

    } catch (err) {
      console.error("Gas estimation error:", err);
      setError("Failed to estimate gas. Make sure you're connected to Sepolia.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractAddress && window.ethereum) {
      estimateGas();
    }
  }, [contractAddress]);

  const formatGasPrice = (gasPrice) => {
    if (!gasPrice) return "0";
    return ethers.utils.formatUnits(gasPrice, "gwei");
  };

  const formatNumber = (num) => {
    return num ? parseFloat(num).toFixed(6) : "0";
  };

  if (!contractAddress) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Contract address not configured</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-blue-800">⛽ Gas Estimation</h3>
        <button
          onClick={estimateGas}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isLoading ? "Estimating..." : "🔄 Refresh"}
        </button>
      </div>

      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Gas:</span>
            <span className="font-mono">
              {gasEstimate ? gasEstimate.toLocaleString() : "Loading..."}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Gas Price:</span>
            <span className="font-mono">
              {gasPrice ? `${formatNumber(formatGasPrice(gasPrice))} gwei` : "Loading..."}
            </span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 font-medium">Estimated Cost:</span>
            <span className="font-mono font-bold text-blue-800">
              {estimatedCost ? `${formatNumber(estimatedCost)} ETH` : "Loading..."}
            </span>
          </div>
          
          {estimatedCost && (
            <div className="text-xs text-gray-500 mt-2">
              ≈ ${(parseFloat(estimatedCost) * 2500).toFixed(2)} USD (assuming ETH = $2500)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
