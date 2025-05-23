import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter, ExchangePriceData } from './types';
// Import real CCXT adapter for live data
import { RealCCXTAdapter } from './real-ccxt-adapter';
// Keeping MockAdapter as fallback
import { MockAdapter } from './mock-adapter';
// import { BrowserCCXTAdapter } from './browser-ccxt-adapter';
// import { BinanceAdapter } from './binance-adapter';
// import { BitgetAdapter } from './bitget-adapter';
// import { BybitAdapter } from './bybit-adapter';
// import { KuCoinAdapter } from './kucoin-adapter';
// import { GateIoAdapter } from './gateio-adapter';
// import { BitmartAdapter } from './bitmart-adapter';
// import { BitfinexAdapter } from './bitfinex-adapter';
// import { GeminiAdapter } from './gemini-adapter';
// import { CoinbaseAdapter } from './coinbase-adapter';
// import { KrakenAdapter } from './kraken-adapter';
// import { PoloniexAdapter } from './poloniex-adapter';
// import { OkxAdapter } from './okx-adapter';
// import { AscendExAdapter } from './ascendex-adapter';
// import { BittrueAdapter } from './bittrue-adapter';
// import { HtxAdapter } from './htx-adapter';
// import { MexcAdapter } from './mexc-adapter';

/**
 * Unified price update event with exchange information
 */
export interface PriceUpdateEvent {
  symbol: string;
  exchange: Exchange;
  bid: number;
  ask: number;
  timestamp: number;
  volume24h?: number;
}

/**
 * Options for the exchange manager
 */
export interface ExchangeManagerOptions {
  maxUpdatesPerSecond?: number;
  autoReconnect?: boolean;
  logErrors?: boolean;
  useMockData?: boolean; // Flag to use mock data instead of real data
  userId?: string; // For fetching API keys from Supabase
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: ExchangeManagerOptions = {
  maxUpdatesPerSecond: 10,
  autoReconnect: true,
  logErrors: true,
  useMockData: false, // Always use real data
  userId: '' // Default userId
};

/**
 * Manager for multiple exchange adapters
 */
export class ExchangeManager {
  private adapters: Map<Exchange, ExchangeAdapter> = new Map();
  private priceUpdateListeners: Array<(data: PriceUpdateEvent) => void> = [];
  private errorListeners: Array<(error: Error, exchange: Exchange, isWebSocket: boolean) => void> = [];
  private options: ExchangeManagerOptions;
  private throttledUpdates: Map<string, {
    timer: NodeJS.Timeout | null;
    latest: PriceUpdateEvent;
    updateCount: number;
  }> = new Map();
  
  constructor(options: ExchangeManagerOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    
    // Initialize default adapters
    this.initDefaultAdapters();
  }
  
  /**
   * Initialize default adapters
   */
  private initDefaultAdapters(): void {
    // Define the exchanges we want to use - focus on major ones for reliability
    const exchanges: Exchange[] = [
      'Binance', 
      'Bybit', 
      'KuCoin',
      'Coinbase',
      'Kraken'
    ];
    
    // Always use real CCXT adapter for live data, regardless of useMockData setting
    for (const exchange of exchanges) {
      console.log(`[ExchangeManager] Using real data from CCXT for ${exchange}`);
      this.registerAdapter(exchange, new RealCCXTAdapter(exchange, {
        userId: this.options.userId // Pass the user ID for API key retrieval
      }));
    }
  }
  
  /**
   * Register an exchange adapter
   */
  public registerAdapter(exchange: Exchange, adapter: ExchangeAdapter): void {
    this.adapters.set(exchange, adapter);
    
    // Register price update handler
    adapter.onPriceUpdate(this.handlePriceUpdate.bind(this));
  }
  
  /**
   * Get an adapter by exchange
   */
  public getAdapter(exchange: Exchange): ExchangeAdapter | undefined {
    return this.adapters.get(exchange);
  }
  
  /**
   * Get all registered adapters
   */
  public getAdapters(): Map<Exchange, ExchangeAdapter> {
    return this.adapters;
  }
  
  /**
   * Connect to all exchanges
   */
  public async connectAll(): Promise<void> {
    const connectPromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.connect();
        console.log(`[ExchangeManager] Connected to ${exchange}`);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to connect to ${exchange}:`, error);
        this.emitError(error as Error, exchange, true);
      }
    });
    
    await Promise.allSettled(connectPromises);
  }
  
  /**
   * Disconnect from all exchanges
   */
  public async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.disconnect();
        console.log(`[ExchangeManager] Disconnected from ${exchange}`);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to disconnect from ${exchange}:`, error);
      }
    });
    
    await Promise.allSettled(disconnectPromises);
    
    // Clear all throttled updates
    for (const [_, data] of this.throttledUpdates) {
      if (data.timer) {
        clearTimeout(data.timer);
      }
    }
    this.throttledUpdates.clear();
  }
  
  /**
   * Subscribe to price updates for a symbol on all exchanges
   */
  public async subscribeToSymbol(symbol: string): Promise<void> {
    const subscribePromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.subscribeToSymbol(symbol);
        console.log(`[ExchangeManager] Subscribed to ${symbol} on ${exchange}`);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to subscribe to ${symbol} on ${exchange}:`, error);
        this.emitError(error as Error, exchange, true);
      }
    });
    
    await Promise.allSettled(subscribePromises);
  }
  
  /**
   * Unsubscribe from price updates for a symbol on all exchanges
   */
  public async unsubscribeFromSymbol(symbol: string): Promise<void> {
    const unsubscribePromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.unsubscribeFromSymbol(symbol);
        console.log(`[ExchangeManager] Unsubscribed from ${symbol} on ${exchange}`);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to unsubscribe from ${symbol} on ${exchange}:`, error);
      }
    });
    
    await Promise.allSettled(unsubscribePromises);
    
    // Clear any throttled updates for this symbol
    for (const [key, data] of this.throttledUpdates) {
      if (key.startsWith(`${symbol}_`)) {
        if (data.timer) {
          clearTimeout(data.timer);
        }
        this.throttledUpdates.delete(key);
      }
    }
  }
  
  /**
   * Subscribe to price updates for multiple symbols on all exchanges
   */
  public async subscribeToSymbols(symbols: string[]): Promise<void> {
    await Promise.allSettled(
      symbols.map(symbol => this.subscribeToSymbol(symbol))
    );
  }
  
  /**
   * Unsubscribe from price updates for multiple symbols on all exchanges
   */
  public async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    await Promise.allSettled(
      symbols.map(symbol => this.unsubscribeFromSymbol(symbol))
    );
  }
  
  /**
   * Get all supported symbols across exchanges
   */
  public async getAllSupportedSymbols(): Promise<Map<Exchange, string[]>> {
    const result = new Map<Exchange, string[]>();
    
    const promises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        const symbols = await adapter.getSupportedSymbols();
        result.set(exchange, symbols);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to get symbols from ${exchange}:`, error);
        this.emitError(error as Error, exchange, false);
        result.set(exchange, []);
      }
    });
    
    await Promise.allSettled(promises);
    return result;
  }
  
  /**
   * Get common symbols supported by all exchanges
   */
  public async getCommonSymbols(): Promise<string[]> {
    const allSymbols = await this.getAllSupportedSymbols();
    
    // Start with the symbols from the first exchange
    const exchanges = Array.from(allSymbols.keys());
    if (exchanges.length === 0) {
      return [];
    }
    
    let commonSymbols = allSymbols.get(exchanges[0]) || [];
    
    // Find intersection with each subsequent exchange
    for (let i = 1; i < exchanges.length; i++) {
      const exchangeSymbols = allSymbols.get(exchanges[i]) || [];
      commonSymbols = commonSymbols.filter(symbol => exchangeSymbols.includes(symbol));
    }
    
    return commonSymbols;
  }
  
  /**
   * Handle price update from an adapter
   */
  private handlePriceUpdate(data: ExchangePriceData): void {
    // Create a unique key for this symbol+exchange combination
    const key = `${data.symbol}_${data.exchange}`;
    
    // Convert to the common event format
    const event: PriceUpdateEvent = {
      symbol: data.symbol,
      exchange: data.exchange,
      bid: data.bid,
      ask: data.ask,
      timestamp: data.timestamp,
      volume24h: data.volume24h
    };
    
    // Throttle updates to not exceed maxUpdatesPerSecond
    if (this.options.maxUpdatesPerSecond && this.options.maxUpdatesPerSecond > 0) {
      this.throttleUpdate(key, event);
    } else {
      // Send update immediately if throttling is disabled
      this.emitPriceUpdate(event);
    }
  }
  
  /**
   * Throttle updates to not exceed maxUpdatesPerSecond per market
   */
  private throttleUpdate(key: string, event: PriceUpdateEvent): void {
    const maxUpdatesPerSecond = this.options.maxUpdatesPerSecond || 10;
    const throttleInterval = Math.floor(1000 / maxUpdatesPerSecond);
    
    let throttleData = this.throttledUpdates.get(key);
    
    if (!throttleData) {
      // First update for this key
      throttleData = {
        timer: null,
        latest: event,
        updateCount: 0
      };
      this.throttledUpdates.set(key, throttleData);
      
      // Emit immediately and schedule next update
      this.emitPriceUpdate(event);
      throttleData.updateCount = 1;
      
      // Schedule cleanup for throttle data
      throttleData.timer = setTimeout(() => {
        // If there are no pending updates, we're done
        if (throttleData!.updateCount <= 1) {
          this.throttledUpdates.delete(key);
        } else {
          // Otherwise, emit the latest data and reset the counter
          this.emitPriceUpdate(throttleData!.latest);
          
          // Schedule the next check
          throttleData!.timer = setTimeout(() => {
            this.throttledUpdates.delete(key);
          }, throttleInterval);
          
          throttleData!.updateCount = 0;
        }
      }, throttleInterval);
    } else {
      // Update already exists, just store latest data and increment count
      throttleData.latest = event;
      throttleData.updateCount++;
    }
  }
  
  /**
   * Register a listener for price updates
   */
  public onPriceUpdate(listener: (data: PriceUpdateEvent) => void): void {
    this.priceUpdateListeners.push(listener);
  }
  
  /**
   * Remove a price update listener
   */
  public removePriceUpdateListener(listener: (data: PriceUpdateEvent) => void): void {
    const index = this.priceUpdateListeners.indexOf(listener);
    if (index !== -1) {
      this.priceUpdateListeners.splice(index, 1);
    }
  }
  
  /**
   * Register a listener for errors
   */
  public onError(listener: (error: Error, exchange: Exchange, isWebSocket: boolean) => void): void {
    this.errorListeners.push(listener);
  }
  
  /**
   * Remove an error listener
   */
  public removeErrorListener(listener: (error: Error, exchange: Exchange, isWebSocket: boolean) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index !== -1) {
      this.errorListeners.splice(index, 1);
    }
  }
  
  /**
   * Emit a price update event to all listeners
   */
  private emitPriceUpdate(data: PriceUpdateEvent): void {
    this.priceUpdateListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[ExchangeManager] Error in price update listener:', error);
      }
    });
  }
  
  /**
   * Emit an error event to all listeners
   */
  private emitError(error: Error, exchange: Exchange, isWebSocket: boolean): void {
    if (this.options.logErrors) {
      console.error(`[ExchangeManager] ${isWebSocket ? 'WebSocket' : 'REST'} error from ${exchange}:`, error);
    }
    
    this.errorListeners.forEach(listener => {
      try {
        listener(error, exchange, isWebSocket);
      } catch (listenerError) {
        console.error('[ExchangeManager] Error in error listener:', listenerError);
      }
    });
  }
  
  /**
   * Refresh all price data from all exchanges
   * This triggers a manual refresh of price data for all subscribed symbols
   */
  public async refreshAllPrices(): Promise<void> {
    console.log('[ExchangeManager] Refreshing all prices');
    
    const refreshPromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        // Get all symbols the adapter is subscribed to
        const symbols = adapter.getSubscribedSymbols();
        
        // Fetch prices for each symbol
        for (const symbol of symbols) {
          try {
            const priceData = await adapter.fetchPrice(symbol);
            this.handlePriceUpdate(priceData);
          } catch (error) {
            console.error(`[ExchangeManager] Failed to refresh price for ${symbol} on ${exchange}:`, error);
          }
        }
        
        console.log(`[ExchangeManager] Refreshed prices on ${exchange}`);
      } catch (error) {
        console.error(`[ExchangeManager] Failed to refresh prices on ${exchange}:`, error);
        this.emitError(error as Error, exchange, false);
      }
    });
    
    await Promise.allSettled(refreshPromises);
  }
  
  /**
   * Switch to mock data mode
   */
  public switchToMockData(): void {
    // Only switch if not already in mock mode
    if (!this.options.useMockData) {
      this.options.useMockData = true;
      this.reinitializeAdapters();
    }
  }
  
  /**
   * Switch to real data mode
   */
  public switchToRealData(): void {
    // Only switch if not already in real data mode
    if (this.options.useMockData) {
      this.options.useMockData = false;
      this.reinitializeAdapters();
    }
  }
  
  /**
   * Reinitialize adapters when switching data modes
   */
  private async reinitializeAdapters(): Promise<void> {
    // Remember subscribed symbols
    const subscribedSymbols = new Set<string>();
    
    // Get all currently subscribed symbols from all adapters
    for (const adapter of this.adapters.values()) {
      adapter.getSubscribedSymbols().forEach(symbol => subscribedSymbols.add(symbol));
    }
    
    // Disconnect from all exchanges
    await this.disconnectAll();
    
    // Clear adapters
    this.adapters.clear();
    
    // Initialize new adapters
    this.initDefaultAdapters();
    
    // Connect to all exchanges
    await this.connectAll();
    
    // Resubscribe to all previously subscribed symbols
    if (subscribedSymbols.size > 0) {
      await this.subscribeToSymbols(Array.from(subscribedSymbols));
    }
  }

  /**
   * Set API key for a specific exchange
   * @param exchange Exchange to set API key for
   * @param keyId API key ID from Supabase
   */
  public setApiKey(exchange: Exchange, keyId: string): void {
    const adapter = this.adapters.get(exchange);
    if (adapter && adapter instanceof RealCCXTAdapter) {
      // Update the adapter configuration with the key ID
      (adapter as RealCCXTAdapter).updateApiKey(keyId);
      console.log(`[ExchangeManager] Updated API key for ${exchange}`);
    }
  }

  /**
   * Set the user ID for fetching API keys
   * @param userId User ID
   */
  public setUserId(userId: string): void {
    this.options.userId = userId;
    console.log(`[ExchangeManager] User ID updated: ${userId}`);
  }
} 