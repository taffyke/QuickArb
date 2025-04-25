import { BaseExchangeAdapter } from './base-adapter';
import { 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  ExchangeError, 
  ExchangeErrorType 
} from './types';

/**
 * Bitmart API response types
 */
interface BitmartTickerResponse {
  message: string;
  code: number;
  trace: string;
  data: {
    tickers: Array<{
      symbol: string;
      last_price: string;
      quote_volume_24h: string;
      base_volume_24h: string;
      high_24h: string;
      low_24h: string;
      open_24h: string;
      close_24h: string;
      best_ask: string;
      best_bid: string;
      fluctuation: string;
      timestamp: number;
    }>;
  };
}

interface BitmartSymbolsResponse {
  message: string;
  code: number;
  trace: string;
  data: {
    symbols: Array<{
      symbol: string;
      symbol_id: number;
      base_currency: string;
      quote_currency: string;
      quote_increment: string;
      base_increment: string;
      min_buy_amount: string;
      min_sell_amount: string;
      price_max: string;
      price_min: string;
      trade_status: string;
    }>;
  };
}

interface BitmartWebSocketResponse {
  table: string;
  data: Array<{
    symbol: string;
    last_price: string;
    quote_volume_24h: string;
    base_volume_24h: string;
    high_24h: string;
    low_24h: string;
    open_24h: string;
    close_24h: string;
    best_ask: string;
    best_bid: string;
    fluctuation: string;
    timestamp: number;
  }>;
}

/**
 * Default config for Bitmart
 */
const DEFAULT_BITMART_CONFIG: ExchangeAdapterConfig = {
  restBaseUrl: 'https://api-cloud.bitmart.com',
  wsBaseUrl: 'wss://ws-manager-compress.bitmart.com/api?protocol=1.1',
  reconnectDelay: 1000,
  maxRetries: 10
};

/**
 * Bitmart rate limits
 * See: https://developer-pro.bitmart.com/en/spot/#rate-limit
 */
const BITMART_RATE_LIMITS = {
  DEFAULT: {
    maxRequests: 120,
    timeWindowMs: 60000, // 1 minute
  },
  TICKER: {
    maxRequests: 20,
    timeWindowMs: 1000, // 1 second
  },
  ORDER_BOOK: {
    maxRequests: 20,
    timeWindowMs: 1000, // 1 second
  }
};

/**
 * Bitmart adapter implementation
 */
export class BitmartAdapter extends BaseExchangeAdapter {
  private symbolCache: Map<string, string> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private fallbackIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ExchangeAdapterConfig> = {}) {
    super('Bitmart', {
      ...DEFAULT_BITMART_CONFIG,
      ...config
    });

    // Setup rate limiters
    this.setupRateLimiter('default', BITMART_RATE_LIMITS.DEFAULT);
    this.setupRateLimiter('ticker', BITMART_RATE_LIMITS.TICKER);
    this.setupRateLimiter('orderBook', BITMART_RATE_LIMITS.ORDER_BOOK);
  }

  /**
   * Get all supported symbols from Bitmart
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<BitmartSymbolsResponse>(
        '/spot/v1/symbols/details',
        { method: 'GET' },
        'default'
      );

      if (response.code !== 1000) {
        throw new Error(`API error: ${response.message}`);
      }

      const symbols = response.data.symbols
        .filter(s => s.trade_status === 'trading')
        .map(s => {
          const normalizedSymbol = `${s.base_currency}-${s.quote_currency}`;
          // Cache the mapping between normalized and exchange symbols
          this.symbolCache.set(normalizedSymbol, s.symbol);
          return normalizedSymbol;
        });

      return symbols;
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch Bitmart symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bitmart',
        { originalError: error }
      );
    }
  }

  /**
   * Fetch current price data for a symbol via REST API
   */
  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    try {
      const response = await this.executeRequest<BitmartTickerResponse>(
        `/spot/v1/ticker?symbol=${exchangeSymbol}`,
        { method: 'GET' },
        'ticker'
      );

      if (response.code !== 1000 || !response.data.tickers || response.data.tickers.length === 0) {
        throw new Error(`API error: ${response.message}`);
      }

      const ticker = response.data.tickers[0];
      
      // Update the last REST fetch timestamp
      this.lastRestFetch.set(symbol, Date.now());
      
      return {
        symbol,
        exchange: 'Bitmart',
        bid: parseFloat(ticker.best_bid),
        ask: parseFloat(ticker.best_ask),
        timestamp: ticker.timestamp,
        volume24h: parseFloat(ticker.quote_volume_24h)
      };
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch price for ${symbol} from Bitmart: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bitmart',
        { symbol, originalError: error }
      );
    }
  }
  
  /**
   * Normalize symbol to unified format (BTC-USDT)
   */
  protected normalizeSymbol(symbol: string): string {
    // If already in normalized format, return as is
    if (symbol.includes('-')) {
      return symbol.toUpperCase();
    }
    
    // Basic normalization for common Bitmart format
    // BTC_USDT -> BTC-USDT
    if (symbol.includes('_')) {
      return symbol.replace('_', '-').toUpperCase();
    }
    
    // If we can't determine the format, return as is
    return symbol;
  }
  
  /**
   * Denormalize symbol to Bitmart format (BTC_USDT)
   */
  protected denormalizeSymbol(symbol: string): string {
    // Check cache first
    if (this.symbolCache.has(symbol)) {
      return this.symbolCache.get(symbol)!;
    }
    
    // Basic denormalization
    if (symbol.includes('-')) {
      return symbol.replace('-', '_').toUpperCase();
    }
    
    // If already in Bitmart format, return as is
    return symbol.toUpperCase();
  }
  
  /**
   * Send WebSocket subscription message for a symbol
   */
  protected async sendSubscription(symbol: string): Promise<void> {
    if (!this.ws || !this.wsConnected) {
      throw new ExchangeError(
        'WebSocket not connected',
        ExchangeErrorType.CONNECTION_ERROR,
        'Bitmart'
      );
    }
    
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    const subscriptionMessage = {
      op: "subscribe",
      args: [`spot/ticker:${exchangeSymbol}`]
    };
    
    await this.sendWebSocketMessage(subscriptionMessage);
    
    // Setup fallback to REST every 30 seconds
    this.setupRestFallback(symbol);
  }
  
  /**
   * Send WebSocket unsubscription message
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    if (!this.ws || !this.wsConnected) {
      return;
    }
    
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    const unsubscriptionMessage = {
      op: "unsubscribe",
      args: [`spot/ticker:${exchangeSymbol}`]
    };
    
    await this.sendWebSocketMessage(unsubscriptionMessage);
    
    // Clear fallback interval
    if (this.fallbackIntervals.has(symbol)) {
      clearInterval(this.fallbackIntervals.get(symbol)!);
      this.fallbackIntervals.delete(symbol);
    }
  }
  
  /**
   * Handle WebSocket message
   */
  protected handleWebSocketMessage(data: any): void {
    if (data.event === 'ping') {
      // Respond to ping with pong
      this.sendWebSocketMessage({ op: "pong" }).catch(console.error);
      return;
    }
    
    if (data.event === 'error') {
      console.error(`[Bitmart] WebSocket error: ${data.message || JSON.stringify(data)}`);
      return;
    }
    
    if (data.table === 'spot/ticker' && Array.isArray(data.data)) {
      data.data.forEach((tickerData: any) => {
        const exchangeSymbol = tickerData.symbol;
        const normalizedSymbol = this.normalizeSymbol(exchangeSymbol);
        
        const priceData: ExchangePriceData = {
          symbol: normalizedSymbol,
          exchange: 'Bitmart',
          bid: parseFloat(tickerData.best_bid),
          ask: parseFloat(tickerData.best_ask),
          timestamp: tickerData.timestamp,
          volume24h: parseFloat(tickerData.quote_volume_24h)
        };
        
        this.notifyPriceUpdate(priceData);
      });
    }
  }
  
  /**
   * Setup REST API fallback for when WebSocket updates are slow/unreliable
   */
  private setupRestFallback(symbol: string): void {
    // Clear existing interval if any
    if (this.fallbackIntervals.has(symbol)) {
      clearInterval(this.fallbackIntervals.get(symbol)!);
    }
    
    // Set up new interval - fetch every 30 seconds via REST as backup
    const interval = setInterval(async () => {
      const lastUpdate = this.lastRestFetch.get(symbol) || 0;
      const now = Date.now();
      
      // If it's been more than 30 seconds since last update
      if (now - lastUpdate > 30000) {
        try {
          const priceData = await this.fetchPrice(symbol);
          this.notifyPriceUpdate(priceData);
        } catch (error) {
          console.error(`[Bitmart] Failed to fetch fallback price for ${symbol}:`, error);
        }
      }
    }, 30000);
    
    this.fallbackIntervals.set(symbol, interval);
  }
  
  /**
   * Override connect method to setup ping interval
   */
  public async connect(): Promise<void> {
    await super.connect();
    
    // Setup ping interval to keep connection alive
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.wsConnected && this.ws) {
        this.sendWebSocketMessage({ op: "ping" }).catch(console.error);
      }
    }, 20000); // Send ping every 20 seconds
  }
  
  /**
   * Override disconnect method to clear ping interval
   */
  public async disconnect(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Clear all fallback intervals
    for (const [symbol, interval] of this.fallbackIntervals.entries()) {
      clearInterval(interval);
    }
    this.fallbackIntervals.clear();
    
    return super.disconnect();
  }
} 