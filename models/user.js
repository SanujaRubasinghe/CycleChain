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
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  cards: [
    {
      cardholderName: {
        type: String,
        required: true,
      },
      cardNumber: {
        type: String,
        required: true,
      },
      expiryMonth: {
        type: String,
        required: true,
      },
      expiryYear: {
        type: String,
        required: true,
      },
      cvv: {
        type: String,
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
