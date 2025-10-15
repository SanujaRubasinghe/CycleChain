# IPFS Setup Guide for CycleChain NFTs

## 🔧 Fix IPFS CORS Issues

Your IPFS node needs to be configured to allow CORS requests from your web app.

### 1. Configure IPFS CORS Settings

Run these commands in your terminal:

```bash
# Allow CORS from your local development server
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "Content-Type"]'

# Restart IPFS daemon
ipfs shutdown
ipfs daemon
```

### 2. Verify IPFS is Running

Check these URLs in your browser:
- Gateway: http://127.0.0.1:8080
- API: http://127.0.0.1:5001/api/v0/version

### 3. Test Your Uploaded Assets

Your current IPFS hashes:
- **Image**: `QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb`
- **3D Model**: `QmXJqejfM6oey6Mifzw3p4bKiu1SYCo4dqPbXEGCCV1EbS`

Test these URLs:
- Image: https://gateway.pinata.cloud/ipfs/QmX4VeJz8aypxG435rQAM23id5eyFpT54pvq1RTzMSMeSb
- 3D Model: https://gateway.pinata.cloud/ipfs/QmXJqejfM6oey6Mifzw3p4bKiu1SYCo4dqPbXEGCCV1EbS

### 4. Alternative: Use Pinata Cloud

If local IPFS continues to have issues:

1. Sign up at https://pinata.cloud
2. Upload your files through their web interface
3. Use their gateway URLs (more reliable)

### 5. 3D Model Requirements

Make sure your GLB file:
- ✅ Is under 10MB
- ✅ Uses standard materials
- ✅ Has proper UV mapping
- ✅ Is optimized for web viewing

### 6. Troubleshooting

**If 3D model doesn't show:**
1. Check browser console for errors
2. Verify GLB file loads in a 3D viewer
3. Test the IPFS URL directly in browser
4. Check file size and format

**If CORS errors persist:**
1. Restart IPFS daemon after config changes
2. Clear browser cache
3. Try different IPFS gateway
4. Use Pinata.cloud as alternative

### 7. Production Deployment

For production:
1. Pin your files to a reliable IPFS service
2. Use multiple gateway URLs for redundancy
3. Consider CDN for faster loading
4. Monitor IPFS availability

## 🎯 Current Status

✅ IPFS hashes updated in config
✅ 3D model integration fixed
⚠️ CORS configuration needed
⚠️ Test 3D model loading

Run the CORS commands above and restart IPFS to fix the "Failed to fetch" error!
