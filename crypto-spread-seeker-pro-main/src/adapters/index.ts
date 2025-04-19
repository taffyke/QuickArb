// Export adapters and types for easy imports
export * from './types';
export * from './base-adapter';
export * from './binance-adapter';
export * from './exchange-manager';

// Export a singleton instance of the ExchangeManager
import { ExchangeManager } from './exchange-manager';

export const exchangeManager = new ExchangeManager(); 