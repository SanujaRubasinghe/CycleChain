// NFT Asset Configuration
// Using local assets from public/assets folder

export const NFT_ASSETS = {
  // Bike Images - Using local assets
  images: {
    'CycleChain Pro': '/assets/car_image1.png',      // Using available car image as bike placeholder
    'CycleChain Urban': '/assets/car_image2.png',    // Using available car image as bike placeholder
    'CycleChain Sport': '/assets/car_image3.png',    // Using available car image as bike placeholder
    'CycleChain Eco': '/assets/car_image4.png'       // Using available car image as bike placeholder
  },

  // 3D Model - Local GLB file
  model3D: '/assets/model.glb',

  // Default fallback image
  defaultImage: '/assets/hero.png',

  // Local asset base path
  basePath: '/assets/'
};

// Helper functions - Updated to use local assets
export const getImageUrl = (bikeName) => {
  return NFT_ASSETS.images[bikeName] || NFT_ASSETS.defaultImage;
};

export const getModelUrl = () => {
  return NFT_ASSETS.model3D;
};

// Instructions for local assets
export const LOCAL_ASSET_INFO = `
📋 Local Asset Configuration:

✅ Now using local assets from /public/assets/:
   - 3D Model: /assets/model.glb
   - Bike Images: /assets/car_image*.png (placeholders)
   - Default Image: /assets/hero.png

🔧 To add proper bike images:
1. Add your bike images to /public/assets/
2. Update the images object in NFT_ASSETS
3. Images will load instantly without IPFS dependency

🎯 Current Status: Using local assets - No IPFS required!
`;

console.log(LOCAL_ASSET_INFO);
