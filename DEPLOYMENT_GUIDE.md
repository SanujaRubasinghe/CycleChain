# 🚀 CycleChain NFT Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Smart Contract Deployment
1. **Compile and Deploy Contract**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia  # or mainnet
   ```

2. **Set Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Your deployed contract address
   PRIVATE_KEY=...                     # Contract owner private key
   INFURA_PROJECT_ID=...              # For blockchain connection
   ```

### ✅ IPFS Setup for Production
1. **Upload 3D Models to IPFS**
   ```bash
   # Install IPFS CLI or use Pinata/NFT.Storage
   npm install -g ipfs
   
   # Upload model
   ipfs add assets/model.glb
   # Returns: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Create Metadata JSON**
   ```json
   {
     "name": "CycleChain Pro #001",
     "description": "Ownership certificate for CycleChain Pro e-bike",
     "image": "ipfs://QmPreviewImageHash",
     "animation_url": "ipfs://QmModelHash",
     "attributes": [
       {"trait_type": "Model", "value": "CycleChain Pro"},
       {"trait_type": "Serial Number", "value": "CC-2024-001"},
       {"trait_type": "Battery", "value": "48V 17.5Ah"},
       {"trait_type": "Range", "value": "80 miles"}
     ]
   }
   ```

### ✅ Payment Integration
1. **Stripe Setup**
   ```bash
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Environment Variables**
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🔧 Production Configuration

### 1. Update Next.js Config
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
```

### 2. Environment Variables for Production
```bash
# .env.production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=1  # 1 for mainnet, 11155111 for sepolia
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://...
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Option 3: Self-Hosted
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security Considerations

### 1. Smart Contract Security
- **Audit**: Get contract audited before mainnet deployment
- **Access Control**: Ensure only authorized addresses can mint
- **Rate Limiting**: Implement minting limits per address
- **Pausable**: Add emergency pause functionality

### 2. API Security
```javascript
// middleware.js - Add rate limiting
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add rate limiting logic
  // Verify API keys
  // Sanitize inputs
}
```

### 3. Environment Security
- Never commit private keys to git
- Use encrypted environment variables
- Implement proper CORS policies
- Add request validation

## 📊 Monitoring & Analytics

### 1. Error Tracking
```bash
npm install @sentry/nextjs
```

### 2. Analytics
```bash
npm install @vercel/analytics
```

### 3. Performance Monitoring
- Monitor 3D model loading times
- Track NFT minting success rates
- Monitor blockchain transaction status

## 🧪 Testing Strategy

### 1. Testnet Testing
```bash
# Deploy to Sepolia testnet first
npx hardhat run scripts/deploy.js --network sepolia

# Test all flows:
# - E-bike purchase
# - Payment processing  
# - NFT minting
# - 3D model display
```

### 2. Load Testing
- Test with multiple concurrent users
- Verify 3D model performance on mobile
- Test payment processing under load

### 3. Browser Compatibility
- Chrome/Edge (WebGL support)
- Firefox (WebGL support)
- Safari (limited WebGL)
- Mobile browsers

## 🚀 Go-Live Process

### Phase 1: Soft Launch (1-2 weeks)
1. Deploy to testnet
2. Limited user testing
3. Monitor for issues
4. Gather feedback

### Phase 2: Production Deploy
1. Deploy smart contract to mainnet
2. Update environment variables
3. Deploy frontend to production
4. Enable payment processing

### Phase 3: Full Launch
1. Announce to users
2. Monitor system health
3. Provide customer support
4. Iterate based on feedback

## 🔧 Maintenance Tasks

### Daily
- Monitor transaction success rates
- Check error logs
- Verify IPFS availability

### Weekly  
- Review gas costs and optimize
- Update 3D models if needed
- Analyze user behavior

### Monthly
- Security updates
- Performance optimization
- Feature enhancements

## 📞 Support & Troubleshooting

### Common Production Issues

1. **High Gas Fees**
   - Implement gas price optimization
   - Consider Layer 2 solutions (Polygon, Arbitrum)
   - Batch transactions when possible

2. **IPFS Reliability**
   - Use multiple IPFS gateways
   - Implement fallback mechanisms
   - Consider dedicated IPFS services (Pinata, NFT.Storage)

3. **3D Model Performance**
   - Optimize GLB file sizes
   - Implement progressive loading
   - Add quality settings for mobile

### Emergency Procedures
1. **Contract Issues**: Use pause functionality
2. **IPFS Outage**: Switch to backup gateways
3. **Payment Issues**: Disable purchases temporarily
4. **Performance Issues**: Enable maintenance mode

## 📈 Scaling Considerations

### Database Optimization
- Index frequently queried fields
- Implement caching (Redis)
- Consider read replicas

### CDN Setup
- Serve 3D models from CDN
- Cache static assets
- Optimize image delivery

### Blockchain Scaling
- Consider Layer 2 solutions
- Implement meta-transactions
- Batch operations when possible

---

**Ready for production?** Follow this guide step by step and test thoroughly on testnet first! 🚀
