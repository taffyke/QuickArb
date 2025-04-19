import { BaseExchangeAdapter } from './base-adapter';
import { 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  ExchangeError, 
  ExchangeErrorType 
} from './types';

/**
 * Binance API response types
 */
interface BinanceTickerResponse {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  volume: string;
  quoteVolume: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  lastQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  count: number;
}

interface BinanceBookTickerResponse {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

interface BinanceExchangeInfoResponse {
  symbols: Array<{
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
    isSpotTradingAllowed: boolean;
  }>;
}

interface BinanceWebSocketBookTickerPayload {
  e: string;  // Event type
  E: number;  // Event time
  s: string;  // Symbol
  b: string;  // Best bid price
  B: string;  // Best bid qty
  a: string;  // Best ask price
  A: string;  // Best ask qty
}

/**
 * Default config for Binance
 */
const DEFAULT_BINANCE_CONFIG: ExchangeAdapterConfig = {
  restBaseUrl: 'https://api.binance.com',
  wsBaseUrl: 'wss://stream.binance.com:9443/ws',
  reconnectDelay: 1000,
  maxRetries: 10
};

/**
 * Binance rate limits
 * See: https://binance-docs.github.io/apidocs/spot/en/#limits
 */
const BINANCE_RATE_LIMITS = {
  DEFAULT: {
    maxRequests: 1200,
    timeWindowMs: 60000, // 1 minute
  },
  TICKER: {
    maxRequests: 20,
    timeWindowMs: 1000, // 1 second
  },
  ORDER_BOOK: {
    maxRequests: 50,
    timeWindowMs: 1000, // 1 second
  }
};

/**
 * Binance adapter implementation
 */
export class BinanceAdapter extends BaseExchangeAdapter {
  private symbolCache: Map<string, string> = new Map();
  private wsIdCounter = 1;
  private wsSubscriptionIds: Map<string, number> = new Map();
  private fallbackIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ExchangeAdapterConfig> = {}) {
    super('Binance', {
      ...DEFAULT_BINANCE_CONFIG,
      ...config
    });

    // Setup rate limiters
    this.setupRateLimiter('default', BINANCE_RATE_LIMITS.DEFAULT);
    this.setupRateLimiter('ticker', BINANCE_RATE_LIMITS.TICKER);
    this.setupRateLimiter('orderBook', BINANCE_RATE_LIMITS.ORDER_BOOK);
  }

  /**
   * Get all supported symbols from Binance
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<BinanceExchangeInfoResponse>(
        '/api/v3/exchangeInfo',
        { method: 'GET' },
        'default'
      );

      const symbols = response.symbols
        .filter(s => s.status === 'TRADING' && s.isSpotTradingAllowed)
        .map(s => {
          const normalizedSymbol = `${s.baseAsset}-${s.quoteAsset}`;
          // Cache the mapping between normalized and exchange symbols
          this.symbolCache.set(normalizedSymbol, s.symbol);
          return normalizedSymbol;
        });

      return symbols;
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch Binance symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Binance',
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
      // Use the book ticker endpoint for best bid/ask
      const bookTicker = await this.executeRequest<BinanceBookTickerResponse>(
        `/api/v3/ticker/bookTicker?symbol=${exchangeSymbol}`,
        { method: 'GET' },
        'orderBook'
      );

      // Get 24h stats for volume
      const ticker24h = await this.executeRequest<BinanceTickerResponse>(
        `/api/v3/ticker/24hr?symbol=${exchangeSymbol}`,
        { method: 'GET' },
        'ticker'
      );

      // Update the last REST fetch timestamp
      this.lastRestFetch.set(symbol, Date.now());
      
      return {
        symbol,
        exchange: 'Binance',
        bid: parseFloat(bookTicker.bidPrice),
        ask: parseFloat(bookTicker.askPrice),
        timestamp: Date.now(),
        volume24h: parseFloat(ticker24h.volume)
      };
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch price for ${symbol} from Binance: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Binance',
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
    
    // Basic normalization for common Binance format
    // BTCUSDT -> BTC-USDT
    const commonQuotes = ['USDT', 'BTC', 'ETH', 'BNB', 'BUSD', 'USDC'];
    
    for (const quote of commonQuotes) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        return `${base}-${quote}`;
      }
    }
    
    // If we can't determine the format, return as is
    return symbol;
  }
  
  /**
   * Denormalize symbol to Binance format (BTCUSDT)
   */
  protected denormalizeSymbol(symbol: string): string {
    // Check cache first
    if (this.symbolCache.has(symbol)) {
      return this.symbolCache.get(symbol)!;
    }
    
    // Basic denormalization
    if (symbol.includes('-')) {
      const [base, quote] = symbol.split('-');
      return (base + quote).toUpperCase();
    }
    
    // If already in Binance format, return as is
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
        'Binance'
      );
    }
    
    const exchangeSymbol = this.denormalizeSymbol(symbol).toLowerCase();
    const id = this.wsIdCounter++;
    this.wsSubscriptionIds.set(symbol, id);
    
    const subscriptionMessage = {
      method: 'SUBSCRIBE',
      params: [`${exchangeSymbol}@bookTicker`],
      id
    };
    
    await this.sendWebSocketMessage(subscriptionMessage);
    
    // Setup fallback to REST every 30 seconds
    this.setupRestFallback(symbol);
  }
  
  /**
   * Send WebSocket unsubscription message for a symbol
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    if (!this.ws || !this.wsConnected) {
      return;
    }
    
    const id = this.wsSubscriptionIds.get(symbol);
    if (!id) {
      return;
    }
    
    const exchangeSymbol = this.denormalizeSymbol(symbol).toLowerCase();
    
    const unsubscriptionMessage = {
      method: 'UNSUBSCRIBE',
      params: [`${exchangeSymbol}@bookTicker`],
      id
    };
    
    await this.sendWebSocketMessage(unsubscriptionMessage);
    this.wsSubscriptionIds.delete(symbol);
    
    // Clear the fallback interval
    if (this.fallbackIntervals.has(symbol)) {
      clearInterval(this.fallbackIntervals.get(symbol)!);
      this.fallbackIntervals.delete(symbol);
    }
  }
  
  /**
   * Handle WebSocket messages
   */
  protected handleWebSocketMessage(data: any): void {
    // If this is a subscription confirmation
    if (data.id && data.result === null) {
      console.log(`[Binance] Subscription confirmed for ID: ${data.id}`);
      return;
    }
    
    // If this is a book ticker update
    if (data.e === 'bookTicker') {
      const payload = data as BinanceWebSocketBookTickerPayload;
      const exchangeSymbol = payload.s;
      const normalizedSymbol = this.normalizeSymbol(exchangeSymbol);
      
      const priceData: ExchangePriceData = {
        symbol: normalizedSymbol,
        exchange: 'Binance',
        bid: parseFloat(payload.b),
        ask: parseFloat(payload.a),
        timestamp: payload.E,
        // No volume in the bookTicker - would need another subscription for that
      };
      
      this.notifyPriceUpdate(priceData);
    }
  }
  
  /**
   * Setup fallback to REST API every 30 seconds
   */
  private setupRestFallback(symbol: string): void {
    // Clear any existing interval
    if (this.fallbackIntervals.has(symbol)) {
      clearInterval(this.fallbackIntervals.get(symbol)!);
    }
    
    // Create new interval
    const interval = setInterval(async () => {
      try {
        const priceData = await this.fetchPrice(symbol);
        this.notifyPriceUpdate(priceData);
      } catch (error) {
        console.error(`[Binance] REST fallback failed for ${symbol}:`, error);
      }
    }, 30000); // 30 seconds
    
    this.fallbackIntervals.set(symbol, interval);
  }
  
  /**
   * Override disconnect to clear fallback intervals
   */
  public async disconnect(): Promise<void> {
    // Clear all fallback intervals
    for (const interval of this.fallbackIntervals.values()) {
      clearInterval(interval);
    }
    this.fallbackIntervals.clear();
    
    // Call base disconnect
    return super.disconnect();
  }
} 