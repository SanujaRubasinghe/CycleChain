import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  walletAddress: {
    type: String,
    default: "",
  },
  
  // NFT-related fields
  nftProfile: {
    totalNFTs: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    favoriteModel: String,
    firstNFTDate: Date,
    lastNFTDate: Date,
    preferredPaymentMethod: {
      type: String,
      enum: ['crypto', 'card', 'bank'],
      default: 'crypto'
    }
  },
  
  // Shipping preferences
  defaultShipping: {
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
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    nftUpdates: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    displayPublicProfile: {
      type: Boolean,
      default: false
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to update NFT profile stats
UserSchema.methods.updateNFTStats = async function(nftData) {
  this.nftProfile.totalNFTs += 1;
  this.nftProfile.totalSpent += nftData.purchasePrice;
  this.nftProfile.lastNFTDate = new Date();
  
  if (!this.nftProfile.firstNFTDate) {
    this.nftProfile.firstNFTDate = new Date();
  }
  
  // Update favorite model based on most purchased
  // This would require aggregating NFT data, simplified for now
  this.nftProfile.favoriteModel = nftData.bikeData.model;
  
  return this.save();
};

// Virtual for NFT collection URL
UserSchema.virtual('nftCollectionUrl').get(function() {
  return `/user/${this._id}/nfts`;
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
