import { BaseExchangeAdapter } from './base-adapter';
import { 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  ExchangeError, 
  ExchangeErrorType 
} from './types';

/**
 * Gate.io API response types
 */
interface GateIoTickerResponse {
  currency_pair: string;
  last: string;
  lowest_ask: string;
  highest_bid: string;
  change_percentage: string;
  base_volume: string;
  quote_volume: string;
  high_24h: string;
  low_24h: string;
}

interface GateIoPair {
  id: string;
  base: string;
  quote: string;
  fee: string;
  min_base_amount: string;
  min_quote_amount: string;
  trade_status: string;
}

interface GateIoWebSocketMessage {
  time: number;
  channel: string;
  event: string;
  payload?: any;
  error?: any;
}

/**
 * Default config for Gate.io
 */
const DEFAULT_GATEIO_CONFIG: ExchangeAdapterConfig = {
  restBaseUrl: 'https://api.gateio.ws/api/v4',
  wsBaseUrl: 'wss://api.gateio.ws/ws/v4/',
  reconnectDelay: 1000,
  maxRetries: 10
};

/**
 * Gate.io rate limits
 * See: https://www.gate.io/docs/apiv4/en/index.html#gate-request-frequency-limit-rule
 */
const GATEIO_RATE_LIMITS = {
  DEFAULT: {
    maxRequests: 200,
    timeWindowMs: 60000, // 1 minute
  },
  TICKER: {
    maxRequests: 30,
    timeWindowMs: 1000, // 1 second
  }
};

/**
 * Gate.io adapter implementation
 */
export class GateIoAdapter extends BaseExchangeAdapter {
  private symbolCache: Map<string, string> = new Map();
  private fallbackIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ExchangeAdapterConfig> = {}) {
    super('Gate.io', {
      ...DEFAULT_GATEIO_CONFIG,
      ...config
    });

    // Setup rate limiters
    this.setupRateLimiter('default', GATEIO_RATE_LIMITS.DEFAULT);
    this.setupRateLimiter('ticker', GATEIO_RATE_LIMITS.TICKER);
  }

  /**
   * Get all supported symbols from Gate.io
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<GateIoPair[]>(
        '/spot/currency_pairs',
        { method: 'GET' },
        'default'
      );

      const symbols = response
        .filter(p => p.trade_status === 'tradable')
        .map(p => {
          const normalizedSymbol = `${p.base}-${p.quote}`;
          // Cache the mapping between normalized and exchange symbols
          this.symbolCache.set(normalizedSymbol, p.id);
          return normalizedSymbol;
        });

      return symbols;
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch Gate.io symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Gate.io',
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
      const response = await this.executeRequest<GateIoTickerResponse>(
        `/spot/tickers?currency_pair=${exchangeSymbol}`,
        { method: 'GET' },
        'ticker'
      );

      const ticker = Array.isArray(response) ? response[0] : response;

      // Update the last REST fetch timestamp
      this.lastRestFetch.set(symbol, Date.now());
      
      return {
        symbol,
        exchange: 'Gate.io',
        bid: parseFloat(ticker.highest_bid),
        ask: parseFloat(ticker.lowest_ask),
        timestamp: Date.now(),
        volume24h: parseFloat(ticker.base_volume)
      };
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch price for ${symbol} from Gate.io: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Gate.io',
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
    
    // Gate.io format is like BTC_USDT, convert to BTC-USDT
    return symbol.replace('_', '-').toUpperCase();
  }
  
  /**
   * Denormalize symbol to exchange format
   */
  protected denormalizeSymbol(symbol: string): string {
    // Check if we have a cached version first
    if (this.symbolCache.has(symbol)) {
      return this.symbolCache.get(symbol)!;
    }
    
    // Gate.io uses BTC_USDT format
    return symbol.replace('-', '_').toUpperCase();
  }
  
  /**
   * Connect to WebSocket
   */
  public async connect(): Promise<void> {
    try {
      await super.connect();
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to connect to Gate.io WebSocket: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Gate.io',
        { originalError: error }
      );
    }
  }
  
  /**
   * Send subscription message for a symbol
   */
  protected async sendSubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new ExchangeError(
        'WebSocket not connected',
        ExchangeErrorType.API_ERROR,
        'Gate.io'
      );
    }
    
    const subscriptionMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: "spot.tickers",
      event: "subscribe",
      payload: [exchangeSymbol]
    };
    
    try {
      this.ws.send(JSON.stringify(subscriptionMessage));
      
      // Setup REST fallback for this symbol
      this.setupRestFallback(symbol);
      
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to subscribe to ${symbol} on Gate.io: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Gate.io',
        { symbol, originalError: error }
      );
    }
  }
  
  /**
   * Send unsubscription message for a symbol
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return; // Already disconnected, no need to unsubscribe
    }
    
    const unsubscriptionMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: "spot.tickers",
      event: "unsubscribe",
      payload: [exchangeSymbol]
    };
    
    try {
      this.ws.send(JSON.stringify(unsubscriptionMessage));
      
      // Clear REST fallback for this symbol
      if (this.fallbackIntervals.has(symbol)) {
        clearInterval(this.fallbackIntervals.get(symbol)!);
        this.fallbackIntervals.delete(symbol);
      }
      
    } catch (error: any) {
      console.error(`Failed to unsubscribe from ${symbol} on Gate.io:`, error);
    }
  }
  
  /**
   * Handle WebSocket messages
   */
  protected handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data) as GateIoWebSocketMessage;
      
      // Handle error
      if (message.error) {
        console.error('Gate.io WebSocket error:', message.error);
        return;
      }
      
      // Handle tickers channel update
      if (message.channel === 'spot.tickers' && message.event === 'update' && message.payload) {
        const [ticker] = message.payload;
        
        // Format should be: [currency_pair, last, lowest_ask, highest_bid, change_percentage, base_volume, quote_volume, high_24h, low_24h]
        const currencyPair = ticker[0] as string;
        const lastPrice = ticker[1] as string;
        const lowestAsk = ticker[2] as string;
        const highestBid = ticker[3] as string;
        const baseVolume = ticker[5] as string;
        
        const symbol = this.normalizeSymbol(currencyPair);
        
        const priceData: ExchangePriceData = {
          symbol,
          exchange: 'Gate.io',
          bid: parseFloat(highestBid),
          ask: parseFloat(lowestAsk),
          timestamp: message.time * 1000,
          volume24h: parseFloat(baseVolume)
        };
        
        this.notifyPriceUpdate(priceData);
      }
      
    } catch (error: any) {
      console.error('Error handling Gate.io WebSocket message:', error);
    }
  }
  
  /**
   * Setup REST fallback for a symbol
   */
  private setupRestFallback(symbol: string): void {
    // Clear existing interval if any
    if (this.fallbackIntervals.has(symbol)) {
      clearInterval(this.fallbackIntervals.get(symbol)!);
    }
    
    // Create new interval
    const interval = setInterval(async () => {
      try {
        // Check if we need to fetch (no WebSocket data for 10 seconds)
        const lastFetch = this.lastRestFetch.get(symbol) || 0;
        const now = Date.now();
        
        if (now - lastFetch > 10000) {
          const priceData = await this.fetchPrice(symbol);
          this.notifyPriceUpdate(priceData);
        }
      } catch (error: any) {
        console.error(`Error in Gate.io REST fallback for ${symbol}:`, error);
      }
    }, 15000); // Check every 15 seconds
    
    this.fallbackIntervals.set(symbol, interval);
  }
  
  /**
   * Disconnect from WebSocket
   */
  public async disconnect(): Promise<void> {
    // Clear all fallback intervals
    for (const [symbol, interval] of this.fallbackIntervals.entries()) {
      clearInterval(interval);
    }
    this.fallbackIntervals.clear();
    
    // Disconnect WebSocket
    await super.disconnect();
  }
} 