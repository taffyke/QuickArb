// Exchange logo fetcher utility
// Uses CoinGecko API to fetch reliable exchange logos

// Define exchange mapping to CoinGecko IDs for consistency
const exchangeToCoinGeckoMap: Record<string, string> = {
  "Binance": "binance",
  "Bybit": "bybit",
  "KuCoin": "kucoin",
  "OKX": "okex", // CoinGecko uses okex as the ID
  "Gate.io": "gate",
  "Coinbase": "gdax", // CoinGecko uses gdax as the ID
  "Kraken": "kraken",
  "Bitfinex": "bitfinex",
  "Gemini": "gemini",
  "Bitget": "bitget",
  "Bitmart": "bitmart",
  "Poloniex": "poloniex",
  "MEXC": "mxc", // CoinGecko uses mxc as the ID
  "HTX": "huobi", // CoinGecko uses huobi as the ID
  "AscendEX": "ascendex",
  "Bittrue": "bitrue" // Corrected spelling if needed
};

// Fallback logo URLs if CoinGecko API fails
const fallbackLogoUrls: Record<string, string> = {
  "Binance": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/binance.png",
  "Bybit": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bybit.png",
  "KuCoin": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kucoin.png",
  "OKX": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/okx.png",
  "Gate.io": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gate.png",
  "Coinbase": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/coinbase.png",
  "Kraken": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kraken.png",
  "Bitfinex": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitfinex.png",
  "Gemini": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gemini.png",
  "Bitget": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitget.png",
  "Bitmart": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitmart.png",
  "Poloniex": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/poloniex.png",
  "MEXC": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/mexc.png",
  "HTX": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/htx.png",
  "AscendEX": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/ascendex.png",
  "Bittrue": "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitrue.png"
};

// Types for exchange logo data
export interface ExchangeLogo {
  name: string;
  logo: string;
}

// Get exchange logo URL from CoinGecko API
export const getExchangeLogoUrl = async (exchangeName: string): Promise<string> => {
  try {
    // Try to get the CoinGecko ID for the exchange
    const coinGeckoId = exchangeToCoinGeckoMap[exchangeName];
    
    if (!coinGeckoId) {
      console.warn(`No CoinGecko mapping found for ${exchangeName}`);
      return getFallbackLogo(exchangeName);
    }
    
    // Use CoinGecko API to fetch exchange data
    const response = await fetch(`https://api.coingecko.com/api/v3/exchanges/${coinGeckoId}`);
    
    if (!response.ok) {
      console.warn(`CoinGecko API error for ${exchangeName}: ${response.status}`);
      return getFallbackLogo(exchangeName);
    }
    
    const data = await response.json();
    
    // Return the image URL from the API response
    if (data && data.image) {
      return data.image;
    } else {
      console.warn(`No image found in CoinGecko data for ${exchangeName}`);
      return getFallbackLogo(exchangeName);
    }
  } catch (error) {
    console.error(`Error fetching logo for ${exchangeName}:`, error);
    return getFallbackLogo(exchangeName);
  }
};

// Get fallback logo for an exchange
export const getFallbackLogo = (exchangeName: string): string => {
  return fallbackLogoUrls[exchangeName] || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(exchangeName)}&background=0D8ABC&color=fff&size=128`;
};

// Load exchange logos for a list of exchanges
export const loadExchangeLogos = async (exchangeNames: string[]): Promise<ExchangeLogo[]> => {
  const logoPromises = exchangeNames.map(async (name) => {
    const logo = await getExchangeLogoUrl(name);
    return { name, logo };
  });
  
  return Promise.all(logoPromises);
};

export default {
  getExchangeLogoUrl,
  getFallbackLogo,
  loadExchangeLogos
}; 