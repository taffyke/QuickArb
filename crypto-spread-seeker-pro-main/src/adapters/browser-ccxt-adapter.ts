import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter, ExchangePriceData, ExchangeAdapterConfig, ExchangeErrorType, ExchangeError } from './types';

// Import CCXT directly
import * as ccxt from 'ccxt';

/**
 * Configuration for CCXT Adapter
 */
export interface BrowserCCXTAdapterConfig extends ExchangeAdapterConfig {
  exchangeId: string;
  throttleMs?: number;
}

/**
 * Adapter that uses CCXT library to connect to various exchanges in browser environment
 */
export class BrowserCCXTAdapter implements ExchangeAdapter {
  private exchange: any;
  private config: BrowserCCXTAdapterConfig;
  private priceUpdateCallbacks: Array<(data: ExchangePriceData) => void> = [];
  private subscribedSymbols: Set<string> = new Set();
  private connected: boolean = false;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private exchangeName: Exchange;
  
  constructor(exchangeName: Exchange, config: Partial<BrowserCCXTAdapterConfig> = {}) {
    this.exchangeName = exchangeName;
    
    // Default configuration
    this.config = {
      exchangeId: this.convertExchangeNameToCCXT(exchangeName),
      restBaseUrl: '',
      wsBaseUrl: '',
      throttleMs: 5000, // Use longer polling interval in browser
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
      'Coinbase': 'coinbase',
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
   * Create CCXT exchange instance
   */
  private async createExchange(): Promise<any> {
    const exchangeId = this.config.exchangeId;
    
    // Check if exchange is supported
    if (Object.prototype.hasOwnProperty.call(ccxt, exchangeId)) {
      const ExchangeClass = ccxt[exchangeId];
      
      // Create exchange instance with proper configuration
      const options: any = {
        enableRateLimit: true,
      };
      
      // Add API keys if provided
      if (this.config.apiKey && this.config.apiSecret) {
        options.apiKey = this.config.apiKey;
        options.secret = this.config.apiSecret;
      }
      
      // Create exchange instance
      return new ExchangeClass(options);
    } else {
      throw new Error(`Exchange ${exchangeId} is not supported by CCXT`);
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
      
      console.log(`[BrowserCCXTAdapter] Connected to ${this.exchangeName}`);
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
      
      // Use REST polling for browser environment
      this.subscribeViaRESTPolling(symbol, ccxtSymbol);
      
      console.log(`[BrowserCCXTAdapter] Subscribed to ${symbol} on ${this.exchangeName}`);
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
   * Subscribe via REST polling
   */
  private subscribeViaRESTPolling(symbol: string, ccxtSymbol: string): void {
    // Clear any existing interval
    if (this.updateIntervals.has(symbol)) {
      clearInterval(this.updateIntervals.get(symbol)!);
    }
    
    // Create interval for polling
    const interval = setInterval(async () => {
      try {
        if (!this.subscribedSymbols.has(symbol)) {
          clearInterval(interval);
          return;
        }
        
        const ticker = await this.exchange.fetchTicker(ccxtSymbol);
        if (ticker) {
          const priceData = this.transformTickerToExchangePriceData(ticker, symbol);
          this.emitPriceUpdate(priceData);
        }
      } catch (error) {
        console.error(`[BrowserCCXTAdapter] Error fetching price for ${symbol} on ${this.exchangeName}:`, error);
      }
    }, this.config.throttleMs);
    
    this.updateIntervals.set(symbol, interval);
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
    
    // Clear polling interval if exists
    if (this.updateIntervals.has(symbol)) {
      clearInterval(this.updateIntervals.get(symbol)!);
      this.updateIntervals.delete(symbol);
    }
    
    console.log(`[BrowserCCXTAdapter] Unsubscribed from ${symbol} on ${this.exchangeName}`);
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
      clearInterval(interval);
      this.updateIntervals.delete(symbol);
    }
    
    // Clear subscribed symbols
    this.subscribedSymbols.clear();
    
    this.connected = false;
    
    console.log(`[BrowserCCXTAdapter] Disconnected from ${this.exchangeName}`);
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
      // Load markets if not already loaded
      if (!this.exchange.markets) {
        await this.exchange.loadMarkets();
      }
      
      // Convert to our format
      return Object.keys(this.exchange.markets).map(symbol => this.convertFromCCXTSymbol(symbol));
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
} 