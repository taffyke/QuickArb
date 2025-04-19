/**
 * Examples of how to use exchange adapters directly
 * 
 * This file contains examples of how to use the exchange adapters
 * outside of the React context. These examples can be used in
 * Node.js scripts or other non-React environments.
 */

import { exchangeManager, BinanceAdapter, ExchangePriceData } from './index';

/**
 * Example 1: Using the exchange manager
 */
async function exchangeManagerExample() {
  try {
    // Connect to all exchanges
    await exchangeManager.connectAll();
    
    // Register a price update handler
    exchangeManager.onPriceUpdate((data) => {
      console.log(`Price update from ${data.exchange} for ${data.symbol}: Bid=${data.bid}, Ask=${data.ask}`);
      
      // Here you can implement your arbitrage detection logic
      // or other business logic based on the price updates
    });
    
    // Register an error handler
    exchangeManager.onError((error, exchange, isWebSocket) => {
      console.error(`Error from ${exchange} (${isWebSocket ? 'WebSocket' : 'REST'}):`, error);
    });
    
    // Subscribe to price updates for a symbol
    await exchangeManager.subscribeToSymbol('BTC-USDT');
    
    // Subscribe to multiple symbols at once
    await exchangeManager.subscribeToSymbols(['ETH-USDT', 'SOL-USDT', 'BNB-USDT']);
    
    console.log('Subscribed to price updates for multiple symbols');
    
    // Get common symbols supported by all exchanges
    const commonSymbols = await exchangeManager.getCommonSymbols();
    console.log(`Found ${commonSymbols.length} common symbols across all exchanges:`, commonSymbols.slice(0, 10));
    
    // Keep the process running to receive updates
    console.log('Listening for price updates. Press Ctrl+C to exit.');
    
    // Cleanup when done (e.g., on process exit)
    process.on('SIGINT', async () => {
      console.log('Disconnecting from exchanges...');
      await exchangeManager.disconnectAll();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in exchange manager example:', error);
  }
}

/**
 * Example 2: Using a specific exchange adapter directly
 */
async function specificExchangeExample() {
  // Create a Binance adapter
  const binanceAdapter = new BinanceAdapter();
  
  try {
    // Connect to Binance
    await binanceAdapter.connect();
    
    // Register a price update handler
    binanceAdapter.onPriceUpdate((data: ExchangePriceData) => {
      console.log(`Binance price update for ${data.symbol}: Bid=${data.bid}, Ask=${data.ask}`);
    });
    
    // Get all supported symbols
    const symbols = await binanceAdapter.getSupportedSymbols();
    console.log(`Binance supports ${symbols.length} symbols`);
    
    // Subscribe to a specific symbol
    await binanceAdapter.subscribeToSymbol('BTC-USDT');
    
    // Fetch price data directly via REST API
    const priceData = await binanceAdapter.fetchPrice('ETH-USDT');
    console.log('ETH-USDT price data via REST:', priceData);
    
    // Keep running to receive WebSocket updates
    console.log('Listening for Binance price updates. Press Ctrl+C to exit.');
    
    // Cleanup when done
    process.on('SIGINT', async () => {
      console.log('Disconnecting from Binance...');
      await binanceAdapter.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in Binance adapter example:', error);
  }
}

/**
 * Example 3: Simple cross-exchange arbitrage detection
 */
async function arbitrageDetectionExample() {
  try {
    const priceData: Map<string, Map<string, ExchangePriceData>> = new Map();
    
    // Connect to exchanges
    await exchangeManager.connectAll();
    
    // Handler for price updates
    exchangeManager.onPriceUpdate((data) => {
      // Store the price data
      if (!priceData.has(data.symbol)) {
        priceData.set(data.symbol, new Map());
      }
      
      priceData.get(data.symbol)!.set(data.exchange, data);
      
      // Check for arbitrage opportunities
      checkArbitrageOpportunities(data.symbol);
    });
    
    // Function to check for arbitrage opportunities
    function checkArbitrageOpportunities(symbol: string) {
      const symbolData = priceData.get(symbol);
      if (!symbolData || symbolData.size < 2) return;
      
      // Find the exchange with the lowest ask (buy price)
      let lowestAsk: ExchangePriceData | null = null;
      let highestBid: ExchangePriceData | null = null;
      
      for (const data of symbolData.values()) {
        if (!lowestAsk || data.ask < lowestAsk.ask) {
          lowestAsk = data;
        }
        
        if (!highestBid || data.bid > highestBid.bid) {
          highestBid = data;
        }
      }
      
      // If the best bid price is higher than the best ask price, we have an arbitrage opportunity
      if (lowestAsk && highestBid && highestBid.bid > lowestAsk.ask) {
        const spreadAmount = highestBid.bid - lowestAsk.ask;
        const spreadPercent = (spreadAmount / lowestAsk.ask) * 100;
        
        console.log(`\n💰 ARBITRAGE OPPORTUNITY DETECTED 💰`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Buy from ${lowestAsk.exchange} at ${lowestAsk.ask}`);
        console.log(`Sell on ${highestBid.exchange} at ${highestBid.bid}`);
        console.log(`Spread: ${spreadAmount.toFixed(8)} (${spreadPercent.toFixed(4)}%)`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log('---------------------------------------------');
      }
    }
    
    // Subscribe to common pairs
    const symbolsToMonitor = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'BNB-USDT'];
    await exchangeManager.subscribeToSymbols(symbolsToMonitor);
    
    console.log(`Monitoring ${symbolsToMonitor.length} symbols for arbitrage opportunities...`);
    console.log('Press Ctrl+C to exit.');
    
    // Cleanup when done
    process.on('SIGINT', async () => {
      console.log('Disconnecting from exchanges...');
      await exchangeManager.disconnectAll();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in arbitrage detection example:', error);
  }
}

// Choose which example to run
// exchangeManagerExample();
// specificExchangeExample();
// arbitrageDetectionExample();

// Export examples for potential use elsewhere
export {
  exchangeManagerExample,
  specificExchangeExample,
  arbitrageDetectionExample
}; 