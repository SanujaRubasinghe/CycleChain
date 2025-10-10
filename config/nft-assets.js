// NFT Asset Configuration
// Update these hashes after uploading your assets to IPFS

export const NFT_ASSETS = {
  // Bike Images - Replace with your actual IPFS hashes
  images: {
    'CycleChain Pro': 'QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb',      // Upload your Pro bike image
    'CycleChain Urban': 'QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb',   // Upload your Urban bike image  
    'CycleChain Sport': 'QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb',   // Upload your Sport bike image
    'CycleChain Eco': 'QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb'        // Upload your Eco bike image
  },

  // 3D Model - Single GLB file for all bikes
  model3D: 'QmXJqejfM6oey6Mifzw3p4bKiu1SYCo4dqPbXEGCCV1EbS',                  // Upload your bike-model.glb

  // Default fallback image
  defaultImage: 'QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb',

  // IPFS Gateways (in order of preference)
  gateways: [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/'
  ]
};

// Helper functions
export const getImageUrl = (bikeName, gatewayIndex = 0) => {
  const hash = NFT_ASSETS.images[bikeName] || NFT_ASSETS.defaultImage;
  const gateway = NFT_ASSETS.gateways[gatewayIndex];
  return `${gateway}${hash}`;
};

export const getModelUrl = (gatewayIndex = 0) => {
  const gateway = NFT_ASSETS.gateways[gatewayIndex];
  return `${gateway}${NFT_ASSETS.model3D}`;
};

// Instructions for updating hashes
export const UPLOAD_INSTRUCTIONS = `
📋 How to Update IPFS Hashes:

1. Upload your assets to IPFS:
   ipfs add cyclechain-pro.jpg     → Copy the hash
   ipfs add cyclechain-urban.jpg   → Copy the hash
   ipfs add cyclechain-sport.jpg   → Copy the hash
   ipfs add cyclechain-eco.jpg     → Copy the hash
   ipfs add bike-model.glb         → Copy the hash

2. Update this file (nft-assets.js) with the real hashes:
   Replace 'QmPro123BikeImageHash' with your actual hash

3. Test the URLs:
   https://gateway.pinata.cloud/ipfs/YOUR_HASH

4. Your NFTs will now display properly in wallets!
`;

console.log(UPLOAD_INSTRUCTIONS);
