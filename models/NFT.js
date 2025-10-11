import mongoose from 'mongoose';

const NFTSchema = new mongoose.Schema({
  // Blockchain Data
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  network: {
    type: String,
    default: 'sepolia',
    enum: ['mainnet', 'sepolia', 'goerli', 'polygon']
  },
  
  // Owner Information
  ownerAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  ownerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Bike Information
  bikeData: {
    id: Number,
    name: String,
    model: String,
    price: Number,
    description: String,
    specs: {
      range: String,
      topSpeed: String,
      battery: String,
      weight: String,
      motor: String,
      charging: String
    },
    features: [String],
    category: String
  },
  
  // NFT Metadata
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  description: String,
  imageUrl: String,
  animationUrl: String, // 3D model URL
  externalUrl: String,
  
  // IPFS Data
  metadataUri: String,
  ipfsImageHash: String,
  ipfsModelHash: String,
  
  // Purchase Information
  purchasePrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  shippingInfo: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['minted', 'transferred', 'burned'],
    default: 'minted'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  mintedAt: {
    type: Date,
    default: Date.now
  },
  lastTransferredAt: Date,
  
  // Additional Metadata
  attributes: [{
    trait_type: String,
    value: String,
    display_type: String // For numeric traits
  }],
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
NFTSchema.index({ ownerEmail: 1, status: 1 });
NFTSchema.index({ ownerAddress: 1 });
NFTSchema.index({ tokenId: 1, contractAddress: 1 });
NFTSchema.index({ serialNumber: 1 });
NFTSchema.index({ mintedAt: -1 });

// Virtual for OpenSea URL
NFTSchema.virtual('openSeaUrl').get(function() {
  if (this.network === 'mainnet') {
    return `https://opensea.io/assets/ethereum/${this.contractAddress}/${this.tokenId}`;
  } else {
    return `https://testnets.opensea.io/assets/${this.network}/${this.contractAddress}/${this.tokenId}`;
  }
});

// Virtual for Etherscan URL
NFTSchema.virtual('etherscanUrl').get(function() {
  const baseUrl = this.network === 'mainnet' 
    ? 'https://etherscan.io' 
    : `https://${this.network}.etherscan.io`;
  return `${baseUrl}/tx/${this.transactionHash}`;
});

// Method to increment view count
NFTSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

// Static method to find NFTs by owner
NFTSchema.statics.findByOwner = function(email) {
  return this.find({ 
    ownerEmail: email, 
    status: 'minted', 
    isActive: true 
  }).sort({ mintedAt: -1 });
};

// Static method to get user's NFT stats
NFTSchema.statics.getUserStats = function(email) {
  return this.aggregate([
    { $match: { ownerEmail: email, status: 'minted', isActive: true } },
    {
      $group: {
        _id: null,
        totalNFTs: { $sum: 1 },
        totalValue: { $sum: '$purchasePrice' },
        averagePrice: { $avg: '$purchasePrice' },
        firstMint: { $min: '$mintedAt' },
        lastMint: { $max: '$mintedAt' },
        bikeModels: { $addToSet: '$bikeData.model' }
      }
    }
  ]);
};

export default mongoose.models.NFT || mongoose.model('NFT', NFTSchema);
