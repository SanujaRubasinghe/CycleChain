/**
 * Currency Conversion Utilities
 * LKR → USD → ETH conversion for crypto payments
 */

/**
 * Convert LKR to USD
 * Current rate: 1 USD ≈ 300 LKR (update as needed)
 */
export function lkrToUsd(lkrAmount) {
  const LKR_TO_USD_RATE = 0.00333; // 1 LKR = 0.00333 USD (approx 300 LKR = 1 USD)
  return lkrAmount * LKR_TO_USD_RATE;
}

/**
 * Fetch current ETH price in USD from CoinGecko API (free, no API key needed)
 */
export async function getEthPriceInUsd() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    // Fallback to approximate price if API fails
    return 2000; // Default fallback (update periodically)
  }
}

/**
 * Convert USD to ETH
 */
export function usdToEth(usdAmount, ethPriceInUsd) {
  const ethAmount = usdAmount / ethPriceInUsd;
  return ethAmount.toFixed(6); // Return with 6 decimal precision
}

/**
 * Main conversion function: LKR → ETH
 * @param {number} lkrAmount - Amount in LKR
 * @returns {Promise<string>} - ETH amount as string (e.g., "0.001650")
 */
export async function convertLkrToEth(lkrAmount) {
  // Step 1: LKR → USD
  const usdAmount = lkrToUsd(lkrAmount);
  
  // Step 2: Get current ETH price
  const ethPrice = await getEthPriceInUsd();
  
  // Step 3: USD → ETH
  const ethAmount = usdToEth(usdAmount, ethPrice);
  
  console.log(`Converting ${lkrAmount} LKR → $${usdAmount.toFixed(2)} USD → ${ethAmount} ETH (ETH price: $${ethPrice})`);
  
  return ethAmount;
}
