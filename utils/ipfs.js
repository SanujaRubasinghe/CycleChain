// IPFS Upload Utilities
// Make sure your local IPFS node is running: ipfs daemon

export const uploadToIPFS = async (file, filename = 'file') => {
  try {
    const formData = new FormData();
    
    if (typeof file === 'string') {
      // If it's a string (JSON), convert to blob
      const blob = new Blob([file], { type: 'application/json' });
      formData.append('file', blob, filename);
    } else {
      // If it's already a file/blob
      formData.append('file', file, filename);
    }

    const response = await fetch('http://localhost:5001/api/v0/add', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      hash: result.Hash,
      url: `https://ipfs.io/ipfs/${result.Hash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.Hash}` // Alternative gateway
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

export const uploadImageToIPFS = async (imageFile) => {
  return await uploadToIPFS(imageFile, 'bike-image.jpg');
};

export const upload3DModelToIPFS = async (modelFile) => {
  return await uploadToIPFS(modelFile, 'bike-model.glb');
};

export const uploadMetadataToIPFS = async (metadata) => {
  const metadataString = JSON.stringify(metadata, null, 2);
  return await uploadToIPFS(metadataString, 'metadata.json');
};

// Pre-upload assets for your bike collection
export const uploadBikeAssets = async () => {
  try {
    console.log('Starting IPFS asset upload...');
    
    // You'll need to replace these with actual file uploads
    // For now, we'll create placeholder metadata
    
    const bikeImages = {
      'CycleChain Pro': 'QmYourProBikeImageHash',
      'CycleChain Urban': 'QmYourUrbanBikeImageHash', 
      'CycleChain Sport': 'QmYourSportBikeImageHash',
      'CycleChain Eco': 'QmYourEcoBikeImageHash'
    };
    
    const model3D = 'QmYour3DModelHash'; // Upload your GLB file
    
    return {
      images: bikeImages,
      model3D: model3D
    };
    
  } catch (error) {
    console.error('Failed to upload bike assets:', error);
    throw error;
  }
};

// Instructions for manual upload
export const getUploadInstructions = () => {
  return `
📋 IPFS Upload Instructions:

1. Start your local IPFS node:
   ipfs daemon

2. Upload your bike images:
   ipfs add bike-pro.jpg
   ipfs add bike-urban.jpg  
   ipfs add bike-sport.jpg
   ipfs add bike-eco.jpg

3. Upload your 3D model:
   ipfs add model.glb

4. Copy the returned hashes and update the metadata in MintButton.js

5. Test the URLs:
   https://ipfs.io/ipfs/YOUR_HASH
   https://gateway.pinata.cloud/ipfs/YOUR_HASH

🔧 Alternative: Use Pinata.cloud for easier IPFS hosting
   - Sign up at pinata.cloud
   - Upload files through their web interface
   - Use their gateway URLs for better reliability
  `;
};
