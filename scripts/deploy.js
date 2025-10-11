async function main() {
  console.log("🚀 Deploying BikeOwnershipNFT to Sepolia...");
  
  // Get the contract factory
  const Contract = await ethers.getContractFactory("BikeOwnershipNFT");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const nft = await Contract.deploy();
  
  // Wait for deployment to complete
  await nft.waitForDeployment();
  
  const contractAddress = await nft.getAddress();
  console.log("✅ BikeOwnershipNFT deployed to:", contractAddress);
  console.log("🔗 View on Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save contract address for easy access
  console.log("\n📋 Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
