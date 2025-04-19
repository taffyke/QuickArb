#!/usr/bin/env node

/**
 * Standalone script to detect cross-exchange arbitrage opportunities
 * 
 * Run with:
 * npx ts-node src/scripts/arbitrage-detector.ts [symbols]
 * 
 * Example:
 * npx ts-node src/scripts/arbitrage-detector.ts BTC-USDT ETH-USDT SOL-USDT
 */

import { exchangeManager, ExchangePriceData } from '../adapters';

// Process command line arguments
const symbols = process.argv.slice(2).length > 0 
  ? process.argv.slice(2)
  : ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'BNB-USDT'];

// Store price data from different exchanges
const priceData: Map<string, Map<string, ExchangePriceData>> = new Map();

// Statistics
let updatesReceived = 0;
let opportunitiesFound = 0;
let startTime = Date.now();

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Cross-Exchange Arbitrage Detector');
    console.log('-----------------------------------');
    console.log(`Monitoring symbols: ${symbols.join(', ')}`);
    
    // Connect to all exchanges
    console.log('\nConnecting to exchanges...');
    await exchangeManager.connectAll();
    console.log('Connected to exchanges successfully.');
    
    // Register price update handler
    exchangeManager.onPriceUpdate((data) => {
      // Update price data
      if (!priceData.has(data.symbol)) {
        priceData.set(data.symbol, new Map());
      }
      
      priceData.get(data.symbol)!.set(data.exchange, data);
      updatesReceived++;
      
      // Check for arbitrage opportunities
      checkArbitrageOpportunities(data.symbol);
      
      // Periodically show stats
      if (updatesReceived % 100 === 0) {
        printStats();
      }
    });
    
    // Register error handler
    exchangeManager.onError((error, exchange, isWebSocket) => {
      console.error(`❌ Error from ${exchange} (${isWebSocket ? 'WebSocket' : 'REST'}):`, error.message);
    });
    
    // Subscribe to specified symbols
    console.log('\nSubscribing to price updates...');
    await exchangeManager.subscribeToSymbols(symbols);
    
    console.log('\n📊 Monitoring market data for arbitrage opportunities...');
    console.log('Press Ctrl+C to exit.\n');
    
    // Print periodic stats even if no new updates
    setInterval(() => {
      printStats();
    }, 30000);
    
    // Cleanup when done
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down...');
      printStats(true);
      await exchangeManager.disconnectAll();
      console.log('Disconnected from exchanges.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Check for arbitrage opportunities
 */
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
  if (lowestAsk && highestBid && lowestAsk.exchange !== highestBid.exchange && highestBid.bid > lowestAsk.ask) {
    const spreadAmount = highestBid.bid - lowestAsk.ask;
    const spreadPercent = (spreadAmount / lowestAsk.ask) * 100;
    
    // Only report if spread is meaningful (e.g., > 0.1%)
    if (spreadPercent > 0.1) {
      opportunitiesFound++;
      
      console.log('\n💰 ARBITRAGE OPPORTUNITY DETECTED');
      console.log('-------------------------------');
      console.log(`Symbol: ${symbol}`);
      console.log(`Buy from: ${lowestAsk.exchange} @ ${lowestAsk.ask.toFixed(8)}`);
      console.log(`Sell on:  ${highestBid.exchange} @ ${highestBid.bid.toFixed(8)}`);
      console.log(`Spread:   ${spreadAmount.toFixed(8)} (${spreadPercent.toFixed(4)}%)`);
      console.log(`Time:     ${new Date().toLocaleTimeString()}`);
      
      // Calculate potential profit (assuming $1000 investment)
      const investment = 1000;
      const units = investment / lowestAsk.ask;
      const sellValue = units * highestBid.bid;
      const profit = sellValue - investment;
      
      console.log(`Profit:   $${profit.toFixed(2)} on $${investment.toFixed(2)} investment`);
      
      // Add extra details about the opportunity
      console.log('\nDetails:');
      console.log(`- Timestamp: ${new Date(lowestAsk.timestamp).toISOString()}`);
      const allExchanges = Array.from(symbolData.entries())
        .map(([exchange, data]) => `${exchange}: ${data.bid}/${data.ask}`)
        .join(', ');
      console.log(`- All prices: ${allExchanges}`);
      console.log('-------------------------------\n');
    }
  }
}

/**
 * Print statistics
 */
function printStats(final = false) {
  const runtime = (Date.now() - startTime) / 1000;
  const updatesPerSecond = updatesReceived / runtime;
  
  console.log('\n📊 STATISTICS');
  console.log('----------------');
  console.log(`Runtime: ${formatTime(runtime)}`);
  console.log(`Updates received: ${updatesReceived} (${updatesPerSecond.toFixed(2)}/sec)`);
  console.log(`Arbitrage opportunities found: ${opportunitiesFound}`);
  console.log(`Symbols monitored: ${symbols.length}`);
  console.log(`Exchanges connected: ${Array.from(exchangeManager.getAdapters().keys()).join(', ')}`);
  
  if (final) {
    console.log(`\nThank you for using the Crypto Arbitrage Detector!`);
  } else {
    console.log('----------------\n');
  }
}

/**
 * Format time in seconds to a readable format
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    `${secs}s`
  ].filter(Boolean).join(' ');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 