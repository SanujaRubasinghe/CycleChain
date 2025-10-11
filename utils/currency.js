// Currency conversion utilities for CycleChain

// Exchange rates (these would ideally be fetched from an API in production)
export const EXCHANGE_RATES = {
  USD_TO_LKR: 300, // 1 USD = 300 LKR (approximate)
  USD_TO_ETH: 0.00026274, // 1 USD = 0.00026274 ETH (Sepolia testnet)
};

// Currency formatting functions
export const formatLKR = (usdAmount) => {
  const lkrAmount = usdAmount * EXCHANGE_RATES.USD_TO_LKR;
  // Use custom formatting to ensure consistency between server and client
  return `LKR ${lkrAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatETH = (usdAmount) => {
  const ethAmount = usdAmount * EXCHANGE_RATES.USD_TO_ETH;
  // Format with appropriate decimal places
  if (ethAmount >= 0.01) {
    return `${ethAmount.toFixed(4)} ETH`;
  } else if (ethAmount >= 0.001) {
    return `${ethAmount.toFixed(6)} ETH`;
  } else {
    return `${ethAmount.toExponential(2)} ETH`;
  }
};

export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Combined price display
export const formatPriceDisplay = (usdAmount) => {
  return {
    usd: formatUSD(usdAmount),
    lkr: formatLKR(usdAmount),
    eth: formatETH(usdAmount),
  };
};

// Price component for displaying multiple currencies
export const PriceDisplay = ({ usdAmount, className = "", showEth = true }) => {
  const prices = formatPriceDisplay(usdAmount);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-lg font-bold text-gray-900">{prices.usd}</div>
      <div className="text-sm text-gray-600">{prices.lkr}</div>
      {showEth && (
        <div className="text-xs text-gray-500">{prices.eth}</div>
      )}
    </div>
  );
};

export default {
  formatLKR,
  formatETH,
  formatUSD,
  formatPriceDisplay,
  PriceDisplay,
};
