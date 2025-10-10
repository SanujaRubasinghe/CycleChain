"use client";
import { ethers } from "ethers";
import contractABI from "@/contracts/BikeOwnershipNFT.json"; // ABI from Hardhat

export default function MintButton({ contractAddress, metadataCID }) {
  const handleMint = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    // Connect wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Connect contract
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    // Build token URI from IPFS metadata JSON
    const tokenURI = `ipfs://${metadataCID}`;

    try {
      const tx = await contract.issueBikeNFT(await signer.getAddress(), tokenURI);
      await tx.wait();
      alert("NFT minted successfully!");
    } catch (err) {
      console.error(err);
      alert("Minting failed");
    }
  };

  return (
    <button
      onClick={handleMint}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Mint NFT
    </button>
  );
}
