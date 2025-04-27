import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter, ExchangePriceData, ExchangeAdapterConfig, ExchangeErrorType, ExchangeError } from './types';
import { ProfileService } from '../services/ProfileService';

// We'll dynamically import CCXT from the CDN rather than from node_modules
// This ensures we get the browser-compatible version without Node.js dependencies
let ccxt: any = null;

/**
 * Configuration for CCXT Adapter
 */
export interface RealCCXTAdapterConfig extends ExchangeAdapterConfig {
  exchangeId: string;
  throttleMs?: number;
  userId?: string; // For fetching API keys from Supabase
  keyId?: string;   // Specific API key ID to use
  apiKey?: string;  // Fallback direct API key
  apiSecret?: string; // Fallback direct secret
  apiPassphrase?: string; // Fallback direct passphrase
}

/**
 * An adapter that connects to real exchanges using CCXT
 * This is optimized for browser compatibility using a CDN approach
 */
export class RealCCXTAdapter implements ExchangeAdapter {
  private exchange: any = null;
  private config: RealCCXTAdapterConfig;
  private priceUpdateCallbacks: Array<(data: ExchangePriceData) => void> = [];
  private subscribedSymbols: Set<string> = new Set();
  private updateIntervals: Map<string, number> = new Map();
  private connected: boolean = false;
  private exchangeName: Exchange;
  private cachedSupportedSymbols: string[] | null = null;
  private profileService: ProfileService;
  
  constructor(exchangeName: Exchange, config: Partial<RealCCXTAdapterConfig> = {}) {
    this.exchangeName = exchangeName;
    this.profileService = ProfileService.getInstance();
    
    // Default configuration
    this.config = {
      exchangeId: this.convertExchangeNameToCCXT(exchangeName),
      restBaseUrl: '',
      wsBaseUrl: '',
      throttleMs: 5000, // 5 seconds between updates - respect exchange rate limits
      reconnectDelay: 5000,
      maxRetries: 3,
      ...config
    };
  }
  
  /**
   * Convert our exchange name format to CCXT format
   */
  private convertExchangeNameToCCXT(name: Exchange): string {
    // Convert exchange name to lowercase and remove non-alphanumeric chars
    const mapping: Record<Exchange, string> = {
      'Binance': 'binance',
      'Bitget': 'bitget',
      'Bybit': 'bybit',
      'KuCoin': 'kucoin',
      'Gate.io': 'gateio',
      'Bitmart': 'bitmart',
      'Bitfinex': 'bitfinex',
      'Gemini': 'gemini',
      'Coinbase': 'coinbasepro', // Use proper CCXT identifier
      'Kraken': 'kraken',
      'Poloniex': 'poloniex',
      'OKX': 'okx',
      'AscendEX': 'ascendex',
      'Bittrue': 'bittrue',
      'HTX': 'htx',
      'MEXC': 'mexc'
    };
    
    return mapping[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  /**
   * Load the CCXT library dynamically from CDN
   */
  private async loadCCXTLibrary(): Promise<any> {
    if (ccxt !== null) {
      return ccxt;
    }
    
    try {
      // Load the browser version of CCXT from CDN
      const ccxtScript = document.createElement('script');
      ccxtScript.src = 'https://unpkg.com/ccxt@latest/dist/ccxt.browser.js';
      
      // Wait for script to load
      await new Promise<void>((resolve, reject) => {
        ccxtScript.onload = () => resolve();
        ccxtScript.onerror = () => reject(new Error('Failed to load CCXT library'));
        document.head.appendChild(ccxtScript);
      });
      
      // Now the global window.ccxt should be available
      ccxt = (window as any).ccxt;
      
      if (!ccxt) {
        throw new Error('CCXT library not available after loading');
      }
      
      return ccxt;
    } catch (error) {
      console.error('Error loading CCXT:', error);
      throw new Error(`Failed to load CCXT: ${(error as Error).message}`);
    }
  }
  
  /**
   * Create CCXT exchange instance
   */
  private async createExchange(): Promise<any> {
    try {
      const ccxtLib = await this.loadCCXTLibrary();
      const exchangeId = this.config.exchangeId;
      
      // Check if exchange is supported by CCXT
      if (!ccxtLib[exchangeId]) {
        throw new Error(`Exchange ${exchangeId} is not supported by CCXT`);
      }
      
      // Create exchange instance with proper configuration
      const options: any = {
        enableRateLimit: true,
      };
      
      // Try to use API key from Supabase if user ID and key ID are provided
      if (this.config.userId && this.config.keyId) {
        try {
          // Get the API keys from Supabase through the profile service
          const credentials = await this.profileService.getDecryptedCredentials(this.config.keyId);
          
          // Set the credentials
          options.apiKey = credentials.apiKey;
          options.secret = credentials.secret;
          
          // Add passphrase for exchanges that require it
          if (credentials.passphrase) {
            options.password = credentials.passphrase;
          }
          
          console.log(`[RealCCXTAdapter] Successfully loaded API key for ${this.exchangeName}`);
        } catch (error) {
          console.warn(`[RealCCXTAdapter] Failed to load API key from Supabase: ${error}`);
          // Fall back to config keys if provided
          this.setFallbackCredentials(options);
        }
      } else {
        // Use direct credentials from config if provided
        this.setFallbackCredentials(options);
      }
      
      // Create exchange instance
      return new ccxtLib[exchangeId](options);
    } catch (error) {
      console.error('Error creating exchange:', error);
      throw error;
    }
  }
  
  /**
   * Set fallback credentials from config
   */
  private setFallbackCredentials(options: any): void {
    // Add API keys if provided in config
    if (this.config.apiKey && this.config.apiSecret) {
      options.apiKey = this.config.apiKey;
      options.secret = this.config.apiSecret;
      
      // Add passphrase for exchanges that require it
      if (this.config.apiPassphrase) {
        options.password = this.config.apiPassphrase;
      }
      
      console.log(`[RealCCXTAdapter] Using API key from config for ${this.exchangeName}`);
    } else {
      console.log(`[RealCCXTAdapter] No API key available for ${this.exchangeName}, using public endpoints`);
    }
  }
  
  /**
   * Connect to the exchange
   */
  public async connect(): Promise<void> {
    try {
      // Initialize the exchange
      this.exchange = await this.createExchange();
      
      // Load markets to get available symbols
      await this.exchange.loadMarkets();
      this.connected = true;
      
      console.log(`[RealCCXTAdapter] Connected to ${this.exchangeName}`);
    } catch (error) {
      const ccxtError = new ExchangeError(
        `Failed to connect to ${this.exchangeName}: ${(error as Error).message}`,
        ExchangeErrorType.CONNECTION_ERROR,
        this.exchangeName,
        error
      );
      throw ccxtError;
    }
  }
  
  /**
   * Subscribe to price updates for a symbol
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  public async subscribeToSymbol(symbol: string): Promise<void> {
    try {
      if (!this.connected || !this.exchange) {
        await this.connect();
      }
      
      // Convert from our format to CCXT format
      const ccxtSymbol = this.convertToCCXTSymbol(symbol);
      
      // Check if symbol is supported
      if (!this.exchange.markets || !this.exchange.markets[ccxtSymbol]) {
        await this.exchange.loadMarkets();
        if (!this.exchange.markets[ccxtSymbol]) {
          throw new Error(`Symbol ${symbol} (${ccxtSymbol}) not supported on ${this.exchangeName}`);
        }
      }
      
      // If already subscribed, do nothing
      if (this.subscribedSymbols.has(symbol)) {
        return;
      }
      
      this.subscribedSymbols.add(symbol);
      
      // Set up polling interval to fetch the latest ticker data
      this.setupPollingInterval(symbol, ccxtSymbol);
      
      // Fetch initial price data
      try {
        const initialData = await this.fetchPrice(symbol);
        this.emitPriceUpdate(initialData);
      } catch (error) {
        console.warn(`[RealCCXTAdapter] Failed to fetch initial data for ${symbol}:`, error);
      }
      
      console.log(`[RealCCXTAdapter] Subscribed to ${symbol} on ${this.exchangeName}`);
    } catch (error) {
      const ccxtError = new ExchangeError(
        `Failed to subscribe to ${symbol} on ${this.exchangeName}: ${(error as Error).message}`,
        ExchangeErrorType.SUBSCRIPTION_ERROR,
        this.exchangeName,
        error
      );
      throw ccxtError;
    }
  }
  
  /**
   * Setup polling interval for price updates
   */
  private setupPollingInterval(symbol: string, ccxtSymbol: string): void {
    // Clear existing interval if any
    this.clearPollingInterval(symbol);
    
    // Create a polling interval to fetch data periodically
    const interval = window.setInterval(async () => {
      if (!this.connected || !this.exchange) {
        this.clearPollingInterval(symbol);
        return;
      }
      
      try {
        // Fetch latest ticker data
        const ticker = await this.exchange.fetchTicker(ccxtSymbol);
        
        // Transform and emit
        const priceData = this.transformTickerToExchangePriceData(ticker, symbol);
        this.emitPriceUpdate(priceData);
      } catch (error) {
        console.warn(`[RealCCXTAdapter] Error polling ${symbol} on ${this.exchangeName}:`, error);
        
        // If the error is severe (like connection lost), try to reconnect
        if ((error as Error).message?.includes('ECONNRESET') || 
            (error as Error).message?.includes('NetworkError')) {
          this.connected = false;
          try {
            await this.connect();
          } catch (reconnectError) {
            console.error(`[RealCCXTAdapter] Failed to reconnect to ${this.exchangeName}:`, reconnectError);
          }
        }
      }
    }, this.config.throttleMs || 5000);
    
    // Store interval ID
    this.updateIntervals.set(symbol, interval);
  }
  
  /**
   * Clear polling interval for a symbol
   */
  private clearPollingInterval(symbol: string): void {
    const interval = this.updateIntervals.get(symbol);
    if (interval) {
      window.clearInterval(interval);
      this.updateIntervals.delete(symbol);
    }
  }
  
  /**
   * Unsubscribe from price updates for a symbol
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  public async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.subscribedSymbols.has(symbol)) {
      return;
    }
    
    this.subscribedSymbols.delete(symbol);
    
    // Clear interval
    this.clearPollingInterval(symbol);
    
    console.log(`[RealCCXTAdapter] Unsubscribed from ${symbol} on ${this.exchangeName}`);
  }
  
  /**
   * Register a callback to receive price updates
   * @param callback Function to call when prices are updated
   */
  public onPriceUpdate(callback: (priceData: ExchangePriceData) => void): void {
    this.priceUpdateCallbacks.push(callback);
  }
  
  /**
   * Emit price update to all registered callbacks
   */
  private emitPriceUpdate(priceData: ExchangePriceData): void {
    for (const callback of this.priceUpdateCallbacks) {
      callback(priceData);
    }
  }
  
  /**
   * Disconnect from the exchange
   */
  public async disconnect(): Promise<void> {
    // Clear all intervals
    for (const [symbol, interval] of this.updateIntervals.entries()) {
      this.clearPollingInterval(symbol);
    }
    
    // Clear subscribed symbols
    this.subscribedSymbols.clear();
    this.connected = false;
    this.exchange = null;
    
    console.log(`[RealCCXTAdapter] Disconnected from ${this.exchangeName}`);
  }
  
  /**
   * Convert unified symbol format to CCXT format
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   * @returns CCXT symbol format (e.g. "BTC/USDT")
   */
  private convertToCCXTSymbol(symbol: string): string {
    return symbol.replace('-', '/');
  }
  
  /**
   * Convert CCXT symbol format to unified format
   * @param ccxtSymbol CCXT symbol format (e.g. "BTC/USDT")
   * @returns Unified symbol format (e.g. "BTC-USDT")
   */
  private convertFromCCXTSymbol(ccxtSymbol: string): string {
    return ccxtSymbol.replace('/', '-');
  }
  
  /**
   * Transform CCXT ticker to our ExchangePriceData format
   */
  private transformTickerToExchangePriceData(ticker: any, originalSymbol: string): ExchangePriceData {
    return {
      symbol: originalSymbol,
      exchange: this.exchangeName,
      bid: ticker.bid || 0,
      ask: ticker.ask || 0,
      timestamp: ticker.timestamp || Date.now(),
      volume24h: ticker.baseVolume || ticker.quoteVolume || 0
    };
  }
  
  /**
   * Get all supported symbols from the exchange
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      // Return cached symbols if available
      if (this.cachedSupportedSymbols) {
        return this.cachedSupportedSymbols;
      }
      
      if (!this.connected || !this.exchange) {
        await this.connect();
      }
      
      // Load markets if not already loaded
      if (!this.exchange.markets) {
        await this.exchange.loadMarkets();
      }
      
      // Convert to our format and cache
      this.cachedSupportedSymbols = Object.keys(this.exchange.markets)
        .map(symbol => this.convertFromCCXTSymbol(symbol));
      
      return this.cachedSupportedSymbols;
    } catch (error) {
      const ccxtError = new ExchangeError(
        `Failed to get supported symbols from ${this.exchangeName}: ${(error as Error).message}`,
        ExchangeErrorType.API_ERROR,
        this.exchangeName,
        error
      );
      throw ccxtError;
    }
  }
  
  /**
   * Get all popular symbols that are most likely to be available
   */
  public getCommonSymbols(): string[] {
    // Common symbols that should be available on most exchanges
    return [
      'BTC-USDT',
      'ETH-USDT',
      'BNB-USDT', 
      'SOL-USDT',
      'XRP-USDT',
      'ADA-USDT',
      'DOGE-USDT',
      'AVAX-USDT'
    ];
  }
  
  /**
   * Get currently subscribed symbols
   */
  public getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }
  
  /**
   * Fetch current price data for a symbol via REST API
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    try {
      if (!this.connected || !this.exchange) {
        await this.connect();
      }
      
      const ccxtSymbol = this.convertToCCXTSymbol(symbol);
      const ticker = await this.exchange.fetchTicker(ccxtSymbol);
      
      return this.transformTickerToExchangePriceData(ticker, symbol);
    } catch (error) {
      const ccxtError = new ExchangeError(
        `Failed to fetch price for ${symbol} on ${this.exchangeName}: ${(error as Error).message}`,
        ExchangeErrorType.API_ERROR,
        this.exchangeName,
        error
      );
      throw ccxtError;
    }
  }
  
  /**
   * Update the API key to use
   * @param keyId API key ID from Supabase
   */
  public async updateApiKey(keyId: string): Promise<void> {
    // Store the key ID in config
    this.config.keyId = keyId;
    
    // If already connected, reconnect to use the new key
    if (this.connected) {
      try {
        // Disconnect first
        await this.disconnect();
        
        // Reconnect with new key
        await this.connect();
        
        // Resubscribe to all symbols
        const symbols = Array.from(this.subscribedSymbols);
        for (const symbol of symbols) {
          await this.subscribeToSymbol(symbol);
        }
        
        console.log(`[RealCCXTAdapter] Reconnected to ${this.exchangeName} with new API key`);
      } catch (error) {
        console.error(`[RealCCXTAdapter] Failed to reconnect with new API key:`, error);
        throw error;
      }
    }
  }
} 