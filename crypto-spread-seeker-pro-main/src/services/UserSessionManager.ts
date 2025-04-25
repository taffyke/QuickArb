import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter, ExchangePriceData } from '../adapters/types';
import { ProfileService, ExchangeApiKey } from './ProfileService';
import { EncryptionService } from './EncryptionService';
import { ArbitrageService } from './ArbitrageService';

// Import adapter factory
import { createExchangeAdapter } from '../adapters/adapter-factory';

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
 * Options for the user session manager
 */
export interface UserSessionOptions {
  maxUpdatesPerSecond?: number;
  autoReconnect?: boolean;
  logErrors?: boolean;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: UserSessionOptions = {
  maxUpdatesPerSecond: 10,
  autoReconnect: true,
  logErrors: true
};

/**
 * UserSessionManager
 * 
 * Manages exchange adapters for a specific authenticated user based on their API keys.
 * Dynamic adapter instantiation ensures only exchanges with valid credentials are used.
 */
export class UserSessionManager {
  private adapters: Map<Exchange, ExchangeAdapter> = new Map();
  private priceUpdateListeners: Array<(data: PriceUpdateEvent) => void> = [];
  private errorListeners: Array<(error: Error, exchange: Exchange, isWebSocket: boolean) => void> = [];
  private subscriptionsByExchange: Map<Exchange, Set<string>> = new Map();
  private options: UserSessionOptions;
  private throttledUpdates: Map<string, {
    timer: NodeJS.Timeout | null;
    latest: PriceUpdateEvent;
    updateCount: number;
  }> = new Map();
  
  private profileService: ProfileService;
  private encryptionService: EncryptionService;
  private arbitrageService: ArbitrageService;
  private userId: string | null = null;
  
  constructor(options: UserSessionOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    
    this.profileService = ProfileService.getInstance();
    this.encryptionService = EncryptionService.getInstance();
    this.arbitrageService = ArbitrageService.getInstance();
  }
  
  /**
   * Initialize adapters for a user session
   * @param userId Authenticated user ID
   */
  public async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    try {
      // Initialize encryption with user-specific keys
      await this.encryptionService.initializeForUser(userId);
      
      // Load user profile
      await this.profileService.initializeUserProfile(userId);
      
      // Load and instantiate adapters for active exchanges
      await this.initializeUserAdapters();
      
    } catch (error) {
      console.error('Failed to initialize user session:', error);
      throw new Error('Failed to initialize user exchange adapters');
    }
  }
  
  /**
   * Initialize exchange adapters based on user's API keys
   */
  private async initializeUserAdapters(): Promise<void> {
    // Clear any existing adapters
    await this.disconnectAll();
    this.adapters.clear();
    
    if (!this.profileService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    // Get all exchanges where the user has active API keys
    const exchanges = this.profileService.getExchangesWithActiveKeys();
    console.log(`[UserSessionManager] Initializing adapters for ${exchanges.length} exchanges`);
    
    // Initialize adapters for each exchange
    for (const exchange of exchanges) {
      try {
        await this.initializeAdapter(exchange);
      } catch (error) {
        console.error(`[UserSessionManager] Failed to initialize adapter for ${exchange}:`, error);
        this.emitError(error instanceof Error ? error : new Error(`Failed to initialize ${exchange}`), 
          exchange, false);
      }
    }
  }
  
  /**
   * Initialize a specific exchange adapter
   * @param exchange Exchange to initialize
   */
  private async initializeAdapter(exchange: Exchange): Promise<void> {
    // Get all API keys for this exchange
    const apiKeys = this.profileService.getApiKeysForExchange(exchange);
    
    if (apiKeys.length === 0) {
      console.warn(`[UserSessionManager] No active API keys found for ${exchange}`);
      return;
    }
    
    // For now, just use the first active key
    // In a production system, you might want to implement fallback logic
    const apiKey = apiKeys[0];
    
    try {
      // Decrypt the API credentials
      const credentials = await this.profileService.getDecryptedCredentials(apiKey.id);
      
      // Create adapter instance
      const adapter = await createExchangeAdapter(exchange, {
        apiKey: credentials.apiKey,
        apiSecret: credentials.secret,
        passphrase: credentials.passphrase
      });
      
      // Register the adapter
      this.registerAdapter(exchange, adapter);
      
      console.log(`[UserSessionManager] Successfully initialized adapter for ${exchange}`);
      
      // Update API key status
      this.updateApiKeyStatus(apiKey.id, true);
      
    } catch (error) {
      console.error(`[UserSessionManager] Error initializing ${exchange} adapter:`, error);
      
      // Update API key status to reflect the failure
      this.updateApiKeyStatus(apiKey.id, false, error instanceof Error ? error.message : 'Unknown error');
      
      throw error;
    }
  }
  
  /**
   * Update API key status after connection attempt
   */
  private async updateApiKeyStatus(keyId: string, success: boolean, errorMessage?: string): Promise<void> {
    try {
      // In a real implementation, you would also update the backend
      const keyIndex = this.profileService.getCurrentUserProfile().apiKeys.findIndex(k => k.id === keyId);
      
      if (keyIndex !== -1) {
        const apiKey = this.profileService.getCurrentUserProfile().apiKeys[keyIndex];
        apiKey.testResultStatus = success ? 'success' : 'failed';
        apiKey.testResultMessage = success ? 'Connection successful' : errorMessage || 'Connection failed';
      }
    } catch (error) {
      console.error('Failed to update API key status:', error);
    }
  }
  
  /**
   * Register an exchange adapter
   */
  private registerAdapter(exchange: Exchange, adapter: ExchangeAdapter): void {
    this.adapters.set(exchange, adapter);
    
    // Register price update handler
    adapter.onPriceUpdate(this.handlePriceUpdate.bind(this));
    
    // Initialize subscription set for this exchange
    this.subscriptionsByExchange.set(exchange, new Set());
  }
  
  /**
   * Handle price updates from exchange adapters
   */
  private handlePriceUpdate(data: ExchangePriceData): void {
    const event: PriceUpdateEvent = {
      symbol: data.symbol,
      exchange: data.exchange,
      bid: data.bid,
      ask: data.ask,
      timestamp: data.timestamp,
      volume24h: data.volume24h
    };
    
    const key = `${data.exchange}-${data.symbol}`;
    
    if (this.options.maxUpdatesPerSecond && this.options.maxUpdatesPerSecond > 0) {
      // Throttle updates
      this.throttleUpdate(key, event);
    } else {
      // Emit immediately
      this.emitPriceUpdate(event);
    }
  }
  
  /**
   * Throttle updates to prevent overwhelming listeners
   */
  private throttleUpdate(key: string, event: PriceUpdateEvent): void {
    const interval = 1000 / (this.options.maxUpdatesPerSecond || 10);
    
    if (this.throttledUpdates.has(key)) {
      const updateData = this.throttledUpdates.get(key)!;
      
      // Update latest data
      updateData.latest = event;
      updateData.updateCount++;
      
      // Timer already set, don't need to do anything else
    } else {
      // First update for this key, emit immediately
      this.emitPriceUpdate(event);
      
      // Set up throttling for future updates
      this.throttledUpdates.set(key, {
        timer: setTimeout(() => this.flushThrottledUpdate(key), interval),
        latest: event,
        updateCount: 0
      });
    }
  }
  
  /**
   * Flush a throttled update
   */
  private flushThrottledUpdate(key: string): void {
    const updateData = this.throttledUpdates.get(key);
    
    if (updateData) {
      if (updateData.updateCount > 0) {
        // Emit the latest update
        this.emitPriceUpdate(updateData.latest);
        
        // Reset counter
        updateData.updateCount = 0;
        
        // Set up next timer
        const interval = 1000 / (this.options.maxUpdatesPerSecond || 10);
        updateData.timer = setTimeout(() => this.flushThrottledUpdate(key), interval);
      } else {
        // No new updates, remove the throttle entry
        updateData.timer = null;
        this.throttledUpdates.delete(key);
      }
    }
  }
  
  /**
   * Connect to all initialized exchanges
   */
  public async connectAll(): Promise<void> {
    if (this.adapters.size === 0) {
      console.warn('[UserSessionManager] No exchange adapters to connect');
      return;
    }
    
    const connectPromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.connect();
        console.log(`[UserSessionManager] Connected to ${exchange}`);
        
        // Restore subscriptions if we had any
        const symbols = this.subscriptionsByExchange.get(exchange);
        if (symbols && symbols.size > 0) {
          await Promise.all(
            Array.from(symbols).map(symbol => adapter.subscribeToSymbol(symbol))
          );
          console.log(`[UserSessionManager] Restored ${symbols.size} subscriptions for ${exchange}`);
        }
      } catch (error) {
        console.error(`[UserSessionManager] Failed to connect to ${exchange}:`, error);
        this.emitError(
          error instanceof Error ? error : new Error(`Failed to connect to ${exchange}`), 
          exchange, 
          true
        );
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
        console.log(`[UserSessionManager] Disconnected from ${exchange}`);
      } catch (error) {
        console.error(`[UserSessionManager] Failed to disconnect from ${exchange}:`, error);
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
   * Subscribe to a symbol on all exchanges
   */
  public async subscribeToSymbol(symbol: string): Promise<void> {
    const subscribePromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.subscribeToSymbol(symbol);
        
        // Add to tracking set
        const symbols = this.subscriptionsByExchange.get(exchange);
        if (symbols) {
          symbols.add(symbol);
        }
        
        console.log(`[UserSessionManager] Subscribed to ${symbol} on ${exchange}`);
      } catch (error) {
        console.error(`[UserSessionManager] Failed to subscribe to ${symbol} on ${exchange}:`, error);
        this.emitError(
          error instanceof Error ? error : new Error(`Failed to subscribe to ${symbol}`), 
          exchange, 
          true
        );
      }
    });
    
    await Promise.allSettled(subscribePromises);
  }
  
  /**
   * Unsubscribe from a symbol on all exchanges
   */
  public async unsubscribeFromSymbol(symbol: string): Promise<void> {
    const unsubscribePromises = Array.from(this.adapters.entries()).map(async ([exchange, adapter]) => {
      try {
        await adapter.unsubscribeFromSymbol(symbol);
        
        // Remove from tracking set
        const symbols = this.subscriptionsByExchange.get(exchange);
        if (symbols) {
          symbols.delete(symbol);
        }
        
        console.log(`[UserSessionManager] Unsubscribed from ${symbol} on ${exchange}`);
      } catch (error) {
        console.error(`[UserSessionManager] Failed to unsubscribe from ${symbol} on ${exchange}:`, error);
      }
    });
    
    await Promise.allSettled(unsubscribePromises);
  }
  
  /**
   * Subscribe to multiple symbols
   */
  public async subscribeToSymbols(symbols: string[]): Promise<void> {
    for (const symbol of symbols) {
      await this.subscribeToSymbol(symbol);
    }
  }
  
  /**
   * Unsubscribe from multiple symbols
   */
  public async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    for (const symbol of symbols) {
      await this.unsubscribeFromSymbol(symbol);
    }
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
        console.error(`[UserSessionManager] Failed to get symbols for ${exchange}:`, error);
        result.set(exchange, []);
      }
    });
    
    await Promise.allSettled(promises);
    return result;
  }
  
  /**
   * Get common symbols supported across all exchanges
   */
  public async getCommonSymbols(): Promise<string[]> {
    const allSymbols = await this.getAllSupportedSymbols();
    
    if (allSymbols.size === 0) {
      return [];
    }
    
    // Start with symbols from the first exchange
    const exchanges = Array.from(allSymbols.keys());
    const firstExchange = exchanges[0];
    let commonSymbols = new Set(allSymbols.get(firstExchange) || []);
    
    // Intersect with symbols from all other exchanges
    for (let i = 1; i < exchanges.length; i++) {
      const exchange = exchanges[i];
      const symbols = new Set(allSymbols.get(exchange) || []);
      
      commonSymbols = new Set(
        Array.from(commonSymbols).filter(symbol => symbols.has(symbol))
      );
    }
    
    return Array.from(commonSymbols);
  }
  
  /**
   * Register a price update listener
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
   * Register an error listener
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
   * Emit a price update to all listeners
   */
  private emitPriceUpdate(data: PriceUpdateEvent): void {
    for (const listener of this.priceUpdateListeners) {
      try {
        listener(data);
      } catch (error) {
        console.error('[UserSessionManager] Error in price update listener:', error);
      }
    }
  }
  
  /**
   * Emit an error to all listeners
   */
  private emitError(error: Error, exchange: Exchange, isWebSocket: boolean): void {
    if (this.options.logErrors) {
      console.error(`[UserSessionManager] Error from ${exchange} (${isWebSocket ? 'WebSocket' : 'REST'})`, error);
    }
    
    for (const listener of this.errorListeners) {
      try {
        listener(error, exchange, isWebSocket);
      } catch (listenerError) {
        console.error('[UserSessionManager] Error in error listener:', listenerError);
      }
    }
  }
  
  /**
   * Get active user exchanges
   */
  public getActiveExchanges(): Exchange[] {
    return Array.from(this.adapters.keys());
  }
  
  /**
   * Check if user session is initialized
   */
  public isInitialized(): boolean {
    return this.userId !== null && this.adapters.size > 0;
  }
  
  /**
   * Refresh user adapters (e.g., after adding a new API key)
   */
  public async refreshAdapters(): Promise<void> {
    if (!this.userId) {
      throw new Error('User session not initialized');
    }
    
    // Re-initialize adapters based on current API keys
    await this.initializeUserAdapters();
    
    // Reconnect to exchanges
    await this.connectAll();
  }
  
  /**
   * Clean up when user logs out
   */
  public async cleanup(): Promise<void> {
    // Disconnect from all exchanges
    await this.disconnectAll();
    
    // Clear all adapters and state
    this.adapters.clear();
    this.subscriptionsByExchange.clear();
    this.userId = null;
    
    // Reset encryption service
    this.encryptionService.reset();
  }
  
  /**
   * Refresh all exchange adapters
   */
  public async refreshAllAdapters(): Promise<void> {
    try {
      // First, disconnect all existing adapters
      await this.disconnectAll();
      
      // Get active exchanges with API keys
      const exchanges = this.profileService.getExchangesWithActiveKeys();
      
      // If no exchanges, exit early
      if (exchanges.length === 0) {
        console.log('[UserSessionManager] No active exchanges found');
        return;
      }
      
      // Initialize adapters for each exchange
      const initPromises = exchanges.map(exchange => this.initializeAdapter(exchange));
      await Promise.all(initPromises);
      
      console.log(`[UserSessionManager] Successfully refreshed ${exchanges.length} exchange adapters`);
      
      // Update arbitrage status after refreshing adapters
      await this.arbitrageService.updateArbitrageStatus();
      
      // Start arbitrage detection if possible
      await this.arbitrageService.startArbitrageDetection();
      
    } catch (error) {
      console.error('[UserSessionManager] Error refreshing adapters:', error);
      throw error;
    }
  }
} 