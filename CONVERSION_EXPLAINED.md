# Currency Conversion - Simple Explanation

## How It Works

When a user pays with crypto, the system automatically converts LKR to ETH:

```
1000 LKR → $3.33 USD → 0.001665 ETH
```

## Where the Conversion Happens

### File: `lib/currencyConverter.js`

**Main Function:**
```js
convertLkrToEth(lkrAmount)
```

**Example:**
```js
await convertLkrToEth(1000)  // Returns: "0.001665"
```

### How It Converts

1. **LKR → USD**
   - Uses fixed rate: 1 USD = 300 LKR
   - Example: 1000 LKR = $3.33 USD

2. **USD → ETH**
   - Fetches live ETH price from CoinGecko API
   - Example: If ETH = $2000, then $3.33 = 0.001665 ETH

## Where It's Used

### File: `app/(payment-management)/payment/page.js`

**Line 132-133:**
```js
// Convert LKR to ETH
const ethAmount = await convertLkrToEth(reservation.cost);
```

**Line 137:**
```js
value: ethers.parseEther(ethAmount),  // Sends the converted ETH amount
```

## User Experience

**What user sees:**
- Payment page shows: "Amount: 1000 LKR"
- Clicks "Pay with MetaMask"
- MetaMask opens with: "0.001665 ETH"

**Behind the scenes:**
- System converts 1000 LKR → 0.001665 ETH
- Sends exact ETH amount to blockchain

## Update Exchange Rate

Edit `lib/currencyConverter.js` line 11:

```js
const LKR_TO_USD_RATE = 0.00333;  // Change this if rate changes
```

**How to calculate:**
- If 1 USD = 300 LKR, then rate = 1/300 = 0.00333
- If 1 USD = 350 LKR, then rate = 1/350 = 0.00286

## That's It!

✅ Payment page shows LKR
✅ Conversion happens automatically
✅ MetaMask shows ETH
✅ Uses live ETH price
