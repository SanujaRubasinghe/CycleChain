# MetaMask Crypto Payment Setup Guide

## ✅ Configuration Complete!

Your `.env.local` file is already configured with:
- **Receiver Wallet**: `0x561356c01C96035d5CC0CAa239146140ff630418`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **MongoDB**: Connected to Atlas cluster
- **All environment variables**: Set and ready

## Quick Start (2 steps)

### 1. Restart Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Switch MetaMask to Sepolia
1. Open MetaMask extension
2. Click network dropdown (top left)
3. Enable "Show test networks" in settings (if not visible)
4. Select "Sepolia test network"

---

## Testing on Testnet (Recommended)

**Use Sepolia testnet** to avoid spending real money:

### Switch to Sepolia in MetaMask:
1. Click network dropdown (top left)
2. Enable "Show test networks" in settings
3. Select "Sepolia test network"

### Get Free Test ETH:
- Visit: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia
- Enter your wallet address
- Receive 0.5 ETH (fake, for testing only)

---

## Current Payment Flow

1. User ends ride → navigates to payment page
2. Clicks "Crypto" payment method
3. Clicks "Pay with MetaMask" button
4. MetaMask popup appears asking for confirmation
5. User confirms → transaction sent to blockchain
6. Wait for confirmation (5-15 seconds)
7. Payment marked as completed in database

---

## Configuration Options

### Change Payment Amount
Edit `page.js` line 111:
```js
value: ethers.parseEther("0.01"), // Change "0.01" to your amount in ETH
```

### Add Chain Switching (Polygon, BSC, etc.)
See advanced configuration in the code comments.

---

## Troubleshooting

### "MetaMask not installed"
- Install MetaMask browser extension: https://metamask.io/download/

### "Receiver wallet not configured"
- You forgot to create `.env.local` or restart the dev server

### "Insufficient funds"
- Your MetaMask wallet doesn't have enough ETH
- Get testnet ETH from faucets (see above)

### Transaction stuck on "Processing"
- Check browser console (F12) for errors
- Ensure MetaMask is unlocked
- Try refreshing the page

### User rejected transaction
- This is normal if user clicks "Reject" in MetaMask
- They can try again by clicking "Pay with MetaMask" again

---

## Security Notes

⚠️ **Never commit `.env.local` to Git** (already in `.gitignore`)
⚠️ **Use testnet for development**
⚠️ **Validate transactions on backend** (already implemented in `/api/payment/[id]/confirm`)

---

## Next Steps (Optional Improvements)

- [ ] Dynamic amount calculation (LKR → ETH conversion)
- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] ERC-20 token payments (USDC, USDT)
- [ ] Transaction receipt display
- [ ] Email confirmation with tx hash
