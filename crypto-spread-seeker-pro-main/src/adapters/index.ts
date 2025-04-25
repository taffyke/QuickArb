// Export adapters and types for easy imports
export * from './types';
export * from './base-adapter';
export * from './mock-adapter'; // Export mock adapter for fallback
export * from './real-ccxt-adapter'; // Export real CCXT adapter
// We're now using CCXT instead of individual adapters
// export * from './binance-adapter';
// export * from './bitget-adapter';
// export * from './bybit-adapter';
// export * from './kucoin-adapter';
// export * from './gateio-adapter';
// export * from './bitmart-adapter';
export * from './exchange-manager';

// Export a singleton instance of the ExchangeManager
import { ExchangeManager } from './exchange-manager';

export const exchangeManager = new ExchangeManager(); 