import { Exchange } from '../contexts/crypto-context';
import { ExchangePriceData } from '../adapters/types';

// Base prices for common cryptocurrencies
const basePrices: Record<string, number> = {
  'BTC-USDT': 65000,
  'ETH-USDT': 3200,
  'BNB-USDT': 550,
  'SOL-USDT': 140,
  'ADA-USDT': 0.45,
  'XRP-USDT': 0.55,
  'DOGE-USDT': 0.14,
  'DOT-USDT': 6.8,
  'AVAX-USDT': 28,
  'LINK-USDT': 15
};

// Supported exchanges
const exchanges: Exchange[] = [
  'Binance',
  'Bybit',
  'KuCoin',
  'Coinbase',
  'Kraken'
];

// Cache for the last generated price data
const priceCache: Map<string, Map<Exchange, ExchangePriceData>> = new Map();
let lastGeneratedTime = Date.now();

/**
 * Generate random price variation (up to ±2%)
 */
function getRandomVariation(basePrice: number, spreadFactor = 1): number {
  // Random variation between -2% and +2%
  const variation = (Math.random() * 4 - 2) * spreadFactor;
  return basePrice * (1 + variation / 100);
}

/**
 * Get a mock price for a symbol on a specific exchange
 */
export function getMockPrice(symbol: string, exchange: Exchange): ExchangePriceData {
  // If symbol is not supported, provide a fallback price
  const basePrice = basePrices[symbol] || 100;
  
  // Check if we have a cached price
  const now = Date.now();
  const cacheExpiry = 5000; // 5 seconds
  
  // If enough time has passed, regenerate all prices
  if (now - lastGeneratedTime > cacheExpiry) {
    generateAllPrices();
    lastGeneratedTime = now;
  }
  
  // Get cached prices or generate them if needed
  let exchangePrices = priceCache.get(symbol);
  if (!exchangePrices) {
    exchangePrices = new Map();
    priceCache.set(symbol, exchangePrices);
  }
  
  let priceData = exchangePrices.get(exchange);
  if (!priceData) {
    // Exchange-specific factor to create realistic price differences
    const exchangeFactor = getExchangeFactor(exchange);
    
    // Generate bid and ask with spread
    const midPrice = getRandomVariation(basePrice, exchangeFactor);
    const spread = basePrice * (0.05 + Math.random() * 0.15) / 100; // 0.05% to 0.2% spread
    
    priceData = {
      symbol,
      exchange,
      bid: midPrice - spread / 2,
      ask: midPrice + spread / 2,
      timestamp: now,
      volume24h: basePrice * 1000 * (0.5 + Math.random())
    };
    
    exchangePrices.set(exchange, priceData);
  }
  
  return priceData;
}

/**
 * Generate all prices for all symbols and exchanges
 */
function generateAllPrices(): void {
  for (const symbol of Object.keys(basePrices)) {
    const exchangePrices = new Map<Exchange, ExchangePriceData>();
    priceCache.set(symbol, exchangePrices);
    
    for (const exchange of exchanges) {
      const exchangeFactor = getExchangeFactor(exchange);
      
      // Generate price with slight variations
      const basePrice = basePrices[symbol];
      const midPrice = getRandomVariation(basePrice, exchangeFactor);
      const spread = basePrice * (0.05 + Math.random() * 0.15) / 100;
      
      const priceData: ExchangePriceData = {
        symbol,
        exchange,
        bid: midPrice - spread / 2,
        ask: midPrice + spread / 2,
        timestamp: Date.now(),
        volume24h: basePrice * 1000 * (0.5 + Math.random())
      };
      
      exchangePrices.set(exchange, priceData);
    }
    
    // Occasionally create arbitrage opportunities (approximately 30% chance)
    if (Math.random() > 0.7) {
      createArbitrageOpportunity(symbol);
    }
  }
}

/**
 * Create an artificial arbitrage opportunity for testing
 */
function createArbitrageOpportunity(symbol: string): void {
  const exchangePrices = priceCache.get(symbol);
  if (!exchangePrices || exchangePrices.size < 2) return;
  
  // Select two random exchanges
  const exchangeArray = Array.from(exchangePrices.keys());
  const exchange1 = exchangeArray[Math.floor(Math.random() * exchangeArray.length)];
  let exchange2 = exchange1;
  while (exchange2 === exchange1) {
    exchange2 = exchangeArray[Math.floor(Math.random() * exchangeArray.length)];
  }
  
  const price1 = exchangePrices.get(exchange1)!;
  const price2 = exchangePrices.get(exchange2)!;
  
  // Create a spread of 0.5% to 2%
  const spreadPercent = 0.5 + Math.random() * 1.5;
  const basePrice = basePrices[symbol];
  const spreadAmount = basePrice * spreadPercent / 100;
  
  // Make the second exchange's bid higher than the first exchange's ask
  // This creates a clear arbitrage opportunity
  price1.ask = basePrice - spreadAmount / 2;
  price2.bid = basePrice + spreadAmount / 2;
  
  // Update the cache
  exchangePrices.set(exchange1, price1);
  exchangePrices.set(exchange2, price2);
}

/**
 * Get an exchange-specific factor to create realistic price variations
 */
function getExchangeFactor(exchange: Exchange): number {
  // Each exchange has a slightly different pricing pattern
  switch (exchange) {
    case 'Binance':
      return 0.8; // More stable prices
    case 'Bybit':
      return 1.2;
    case 'KuCoin':
      return 1.0;
    case 'Coinbase':
      return 1.3; // Higher variation
    case 'Kraken':
      return 0.9;
    default:
      return 1.0;
  }
}

/**
 * Get all supported symbols
 */
export function getSupportedSymbols(): string[] {
  return Object.keys(basePrices);
}

/**
 * Get all supported exchanges
 */
export function getSupportedExchanges(): Exchange[] {
  return [...exchanges];
}

/**
 * Get prices for a specific symbol across all exchanges
 */
export function getPricesForSymbol(symbol: string): Map<Exchange, ExchangePriceData> {
  // Make sure we have updated prices
  if (Date.now() - lastGeneratedTime > 5000) {
    generateAllPrices();
    lastGeneratedTime = Date.now();
  }
  
  let exchangePrices = priceCache.get(symbol);
  if (!exchangePrices) {
    exchangePrices = new Map();
    for (const exchange of exchanges) {
      exchangePrices.set(exchange, getMockPrice(symbol, exchange));
    }
    priceCache.set(symbol, exchangePrices);
  }
  
  return exchangePrices;
}

// Generate initial prices
generateAllPrices(); 