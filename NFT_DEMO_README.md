# 🚲 CycleChain E-Bike NFT Demo

## Overview
This demo showcases the complete e-bike purchase and NFT minting workflow. When customers buy an e-bike, they receive a 3D NFT ownership certificate that can be displayed and verified on the blockchain.

## 🎮 Demo Features

### 1. **Quick Demo** (`/demo`)
- **Purpose**: Fast demonstration of NFT minting and 3D display
- **Features**: 
  - Simulated minting process with progress indicators
  - 3D bike model display using local GLB file
  - Interactive NFT metadata display
  - Reset functionality for repeated demos

### 2. **Full Purchase Flow** (`/purchase`)
- **Purpose**: Complete e-bike purchasing experience
- **Features**:
  - Bike selection with specifications and pricing
  - Customer information form
  - Payment simulation
  - NFT minting integration
  - Success confirmation

### 3. **NFT Viewer** (`/nft`)
- **Purpose**: Display minted NFTs with 3D models
- **Features**:
  - Demo mode with local 3D model
  - Blockchain mode for real NFTs
  - Interactive 3D viewer with orbit controls
  - Comprehensive metadata display

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MetaMask (for blockchain features)
- Modern web browser with WebGL support

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo URLs
- **Quick Demo**: http://localhost:3000/demo
- **Full Purchase**: http://localhost:3000/purchase  
- **NFT Viewer**: http://localhost:3000/nft
- **Legacy Store**: http://localhost:3000/bike-store

## 📁 Project Structure

```
components/nft/
├── DemoNFTViewer.js     # 3D NFT display with local assets
├── NFTViewer.js         # Blockchain NFT viewer  
└── MintButton.js        # NFT minting component

app/(bike-purchase)/
├── demo/                # Quick demo page
├── purchase/            # Full purchase flow
├── nft/                 # NFT viewing page
└── layout.js           # Navigation layout

assets/
├── model.glb           # 3D bike model
└── preview.jpg         # Model preview image

contracts/
└── BikeOwnershipNFT.sol # Smart contract
```

## 🎨 3D Model Integration

### Current Setup
- **Model File**: `assets/model.glb` (515KB)
- **Display**: React Three Fiber + Drei
- **Features**: Auto-rotation, orbit controls, lighting, shadows
- **Fallback**: Placeholder display if model fails to load

### Model Requirements
- **Format**: GLB (recommended) or GLTF
- **Size**: < 10MB for web performance
- **Optimization**: Use tools like gltf-pipeline for compression

## 🔗 Blockchain Integration

### Smart Contract
- **Standard**: ERC-721 (NFT)
- **Features**: Ownership tracking, metadata URI storage
- **Network**: Configurable (currently set for demo)

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Deployed contract address
```

### Demo vs Production Modes
- **Demo Mode**: Simulated minting, local assets
- **Production Mode**: Real blockchain transactions, IPFS metadata

## 🧪 Testing the Demo

### 1. Quick Test (Recommended)
1. Navigate to `/demo`
2. Click "Mint Ownership NFT"
3. Watch the minting simulation
4. View the 3D NFT certificate

### 2. Full Flow Test
1. Navigate to `/purchase`
2. Select an e-bike model
3. Fill out customer information
4. Complete simulated payment
5. Mint NFT and view result

### 3. NFT Viewer Test
1. Navigate to `/nft`
2. Toggle between Demo and Blockchain modes
3. Interact with 3D model (rotate, zoom)
4. Review metadata display

## 🚀 Production Deployment

### 1. Smart Contract Deployment
```bash
# Compile contracts
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy.js --network <network>

# Set contract address in environment
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_address>
```

### 2. IPFS Setup
- Upload 3D models to IPFS
- Create metadata JSON files
- Update metadata CIDs in minting flow

### 3. Payment Integration
- Integrate Stripe or other payment processor
- Add webhook handlers for payment confirmation
- Connect payment success to NFT minting

## 🎯 Next Steps for Production

### High Priority
1. **Deploy Smart Contract** to testnet/mainnet
2. **IPFS Integration** for decentralized asset storage
3. **Payment Processing** with real payment gateway
4. **Wallet Integration** improvements (WalletConnect, etc.)

### Medium Priority
1. **Model Optimization** for faster loading
2. **Metadata Standards** (OpenSea compatibility)
3. **Error Handling** and user feedback
4. **Mobile Responsiveness** for 3D viewer

### Low Priority
1. **Advanced 3D Features** (animations, interactions)
2. **NFT Marketplace** integration
3. **Batch Minting** for multiple bikes
4. **Analytics** and tracking

## 🐛 Troubleshooting

### Common Issues
1. **3D Model Not Loading**
   - Check GLB file is in `public/assets/`
   - Verify file permissions and size
   - Check browser console for errors

2. **MetaMask Connection Issues**
   - Ensure MetaMask is installed
   - Check network configuration
   - Verify contract address

3. **Performance Issues**
   - Reduce model complexity
   - Optimize textures and materials
   - Consider model compression

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📞 Support
For technical issues or questions about the NFT implementation, check:
- Browser console for error messages
- Network tab for failed requests
- React DevTools for component state

---

**Ready to test?** Start with `/demo` for the quickest experience! 🎮
