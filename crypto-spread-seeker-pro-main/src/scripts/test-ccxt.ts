#!/usr/bin/env node

/**
 * Test script to verify CCXT integration is working correctly
 * 
 * Run with:
 * npx ts-node src/scripts/test-ccxt.ts
 */

import { exchangeManager } from '../adapters';

const TEST_SYMBOLS = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];

async function main() {
  try {
    console.log('🚀 CCXT Integration Test');
    console.log('----------------------');
    console.log(`Monitoring symbols: ${TEST_SYMBOLS.join(', ')}`);
    
    // Connect to exchanges
    console.log('\nConnecting to exchanges...');
    await exchangeManager.connectAll();
    console.log('Connected to exchanges successfully.');
    
    // Register price update handler
    exchangeManager.onPriceUpdate((data) => {
      console.log(`[${new Date().toISOString()}] ${data.exchange} | ${data.symbol} | Bid: ${data.bid} | Ask: ${data.ask} | Volume: ${data.volume24h || 'N/A'}`);
    });
    
    // Register error handler
    exchangeManager.onError((error, exchange, isWebSocket) => {
      console.error(`❌ Error from ${exchange} (${isWebSocket ? 'WebSocket' : 'REST'}):`, error.message);
    });
    
    // Subscribe to test symbols
    console.log('\nSubscribing to price updates...');
    await exchangeManager.subscribeToSymbols(TEST_SYMBOLS);
    
    console.log('\n📊 Monitoring real-time price data from CCXT...');
    console.log('Press Ctrl+C to exit.\n');
    
    // Cleanup when done
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down...');
      await exchangeManager.disconnectAll();
      console.log('Disconnected from exchanges.');
      process.exit(0);
    });
    
    // Run for 60 seconds then exit
    setTimeout(async () => {
      console.log('\n\nTest completed. Shutting down...');
      await exchangeManager.disconnectAll();
      console.log('Disconnected from exchanges.');
      process.exit(0);
    }, 60000);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 