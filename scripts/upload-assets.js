#!/usr/bin/env node

/**
 * IPFS Asset Upload Script for CycleChain NFTs
 * 
 * This script helps you upload your bike images and 3D model to IPFS
 * Make sure your local IPFS node is running: `ipfs daemon`
 */

const fs = require('fs');
const path = require('path');

console.log(`
🚲 CycleChain NFT Asset Upload Helper
=====================================

📋 Steps to upload your assets:

1. Start IPFS daemon:
   ipfs daemon

2. Upload your bike images (one by one):
   ipfs add path/to/cyclechain-pro.jpg
   ipfs add path/to/cyclechain-urban.jpg
   ipfs add path/to/cyclechain-sport.jpg
   ipfs add path/to/cyclechain-eco.jpg

3. Upload your 3D model:
   ipfs add path/to/bike-model.glb

4. Copy the returned hashes and update MintButton.js:

   Replace these lines in MintButton.js:
   
   const imageHashes = {
     'CycleChain Pro': 'QmYOUR_PRO_HASH_HERE',
     'CycleChain Urban': 'QmYOUR_URBAN_HASH_HERE', 
     'CycleChain Sport': 'QmYOUR_SPORT_HASH_HERE',
     'CycleChain Eco': 'QmYOUR_ECO_HASH_HERE'
   };

   And update the 3D model URL:
   animation_url: "https://gateway.pinata.cloud/ipfs/QmYOUR_3D_MODEL_HASH"

5. Test your URLs:
   https://ipfs.io/ipfs/YOUR_HASH
   https://gateway.pinata.cloud/ipfs/YOUR_HASH

🎯 Pro Tips:
- Use high-quality images (1024x1024 recommended)
- Optimize your GLB file size (< 10MB recommended)
- Consider using Pinata.cloud for better reliability
- Test all URLs before deploying

🔧 Alternative: Pinata Cloud
If you prefer a web interface:
1. Sign up at https://pinata.cloud
2. Upload files through their dashboard
3. Use their gateway URLs for better performance

📝 Example metadata structure:
{
  "name": "CycleChain Pro #CC-PRO-123456",
  "description": "Ownership certificate for CycleChain Pro...",
  "image": "https://gateway.pinata.cloud/ipfs/QmYourImageHash",
  "animation_url": "https://gateway.pinata.cloud/ipfs/QmYour3DModelHash",
  "attributes": [...]
}

✅ Once uploaded, your NFTs will display properly in:
- MetaMask
- OpenSea
- Other NFT marketplaces
- Any wallet supporting NFT metadata standards
`);

// Check if IPFS is available
const { exec } = require('child_process');

exec('ipfs version', (error, stdout, stderr) => {
  if (error) {
    console.log(`
❌ IPFS not found. Please install IPFS:
   https://docs.ipfs.io/install/

   Or use Pinata.cloud for easier upload.
    `);
  } else {
    console.log(`
✅ IPFS found: ${stdout.trim()}
   
   Run 'ipfs daemon' in another terminal to start uploading!
    `);
  }
});

module.exports = {
  // Helper function to generate metadata
  generateMetadata: (bikeData, serialNumber, userAddress, imageHash, modelHash) => {
    return {
      name: `${bikeData.name} #${serialNumber}`,
      description: `Ownership certificate for ${bikeData.name} - ${bikeData.description}. This NFT represents verified ownership of a premium electric bike with blockchain-backed authenticity.`,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      animation_url: `https://gateway.pinata.cloud/ipfs/${modelHash}`,
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
  }
};
