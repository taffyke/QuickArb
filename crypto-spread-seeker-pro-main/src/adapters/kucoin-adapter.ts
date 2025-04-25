import { BaseExchangeAdapter } from './base-adapter';
import { 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  ExchangeError, 
  ExchangeErrorType 
} from './types';

/**
 * KuCoin API response types
 */
interface KuCoinTickerResponse {
  code: string;
  data: {
    symbol: string;
    buy: string;
    sell: string;
    changeRate: string;
    changePrice: string;
    high: string;
    low: string;
    vol: string;
    volValue: string;
    last: string;
    averagePrice: string;
    time: number;
  };
}

interface KuCoinSymbolsResponse {
  code: string;
  data: Array<{
    symbol: string;
    name: string;
    baseCurrency: string;
    quoteCurrency: string;
    enableTrading: boolean;
    status: string;
  }>;
}

interface KuCoinWebSocketTokenResponse {
  code: string;
  data: {
    instanceServers: Array<{
      endpoint: string;
      protocol: string;
      encrypt: boolean;
    }>;
    token: string;
  };
}

interface KuCoinWebSocketMessage {
  type: string;
  topic: string;
  subject: string;
  data: {
    symbol: string;
    bestAsk: string;
    bestAskSize: string;
    bestBid: string;
    bestBidSize: string;
    timestamp: number;
  };
}

/**
 * Default config for KuCoin
 */
const DEFAULT_KUCOIN_CONFIG: ExchangeAdapterConfig = {
  restBaseUrl: 'https://api.kucoin.com',
  wsBaseUrl: '', // Will be obtained dynamically
  reconnectDelay: 1000,
  maxRetries: 10
};

/**
 * KuCoin rate limits
 * See: https://docs.kucoin.com/#request-rate-limit
 */
const KUCOIN_RATE_LIMITS = {
  DEFAULT: {
    maxRequests: 100,
    timeWindowMs: 10000, // 10 seconds
  },
  TICKER: {
    maxRequests: 30,
    timeWindowMs: 1000, // 1 second
  }
};

/**
 * KuCoin adapter implementation
 */
export class KuCoinAdapter extends BaseExchangeAdapter {
  private symbolCache: Map<string, string> = new Map();
  private wsToken: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private fallbackIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ExchangeAdapterConfig> = {}) {
    super('KuCoin', {
      ...DEFAULT_KUCOIN_CONFIG,
      ...config
    });

    // Setup rate limiters
    this.setupRateLimiter('default', KUCOIN_RATE_LIMITS.DEFAULT);
    this.setupRateLimiter('ticker', KUCOIN_RATE_LIMITS.TICKER);
  }

  /**
   * Get all supported symbols from KuCoin
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<KuCoinSymbolsResponse>(
        '/api/v1/symbols',
        { method: 'GET' },
        'default'
      );

      if (response.code !== '200000') {
        throw new Error(`API returned error code: ${response.code}`);
      }

      const symbols = response.data
        .filter(s => s.enableTrading && s.status === 'TRADING')
        .map(s => {
          const normalizedSymbol = `${s.baseCurrency}-${s.quoteCurrency}`;
          // Cache the mapping between normalized and exchange symbols
          this.symbolCache.set(normalizedSymbol, s.symbol);
          return normalizedSymbol;
        });

      return symbols;
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch KuCoin symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'KuCoin',
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
      const response = await this.executeRequest<KuCoinTickerResponse>(
        `/api/v1/market/orderbook/level1?symbol=${exchangeSymbol}`,
        { method: 'GET' },
        'ticker'
      );

      if (response.code !== '200000') {
        throw new Error(`API returned error code: ${response.code}`);
      }

      // Update the last REST fetch timestamp
      this.lastRestFetch.set(symbol, Date.now());
      
      return {
        symbol,
        exchange: 'KuCoin',
        bid: parseFloat(response.data.buy),
        ask: parseFloat(response.data.sell),
        timestamp: response.data.time,
        volume24h: parseFloat(response.data.vol)
      };
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch price for ${symbol} from KuCoin: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'KuCoin',
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
    
    // KuCoin format is already similar to our normalized format: BTC-USDT
    return symbol.toUpperCase();
  }
  
  /**
   * Denormalize symbol to exchange format
   */
  protected denormalizeSymbol(symbol: string): string {
    // Check if we have a cached version first
    if (this.symbolCache.has(symbol)) {
      return this.symbolCache.get(symbol)!;
    }
    
    // KuCoin uses the same format as our normalized symbols: BTC-USDT
    return symbol;
  }
  
  /**
   * Connect to WebSocket and get token
   */
  public async connect(): Promise<void> {
    try {
      // Get WebSocket connection details and token
      const response = await this.executeRequest<KuCoinWebSocketTokenResponse>(
        '/api/v1/bullet-public',
        { method: 'POST' },
        'default'
      );
      
      if (response.code !== '200000') {
        throw new Error(`Failed to get WebSocket token: ${response.code}`);
      }
      
      this.wsToken = response.data.token;
      const server = response.data.instanceServers[0];
      
      // Update WebSocket base URL with token
      this.config.wsBaseUrl = `${server.endpoint}?token=${this.wsToken}`;
      
      // Connect to WebSocket
      await super.connect();
      
      // Setup ping interval (required by KuCoin)
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      
      this.pingInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Send ping every 30 seconds
      
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to connect to KuCoin WebSocket: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'KuCoin',
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
        'KuCoin'
      );
    }
    
    const subscriptionMessage = {
      type: 'subscribe',
      topic: `/market/ticker:${exchangeSymbol}`,
      privateChannel: false,
      response: true
    };
    
    try {
      this.ws.send(JSON.stringify(subscriptionMessage));
      
      // Setup REST fallback for this symbol
      this.setupRestFallback(symbol);
      
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to subscribe to ${symbol} on KuCoin: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'KuCoin',
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
      type: 'unsubscribe',
      topic: `/market/ticker:${exchangeSymbol}`,
      privateChannel: false,
      response: true
    };
    
    try {
      this.ws.send(JSON.stringify(unsubscriptionMessage));
      
      // Clear REST fallback for this symbol
      if (this.fallbackIntervals.has(symbol)) {
        clearInterval(this.fallbackIntervals.get(symbol)!);
        this.fallbackIntervals.delete(symbol);
      }
      
    } catch (error: any) {
      console.error(`Failed to unsubscribe from ${symbol} on KuCoin:`, error);
    }
  }
  
  /**
   * Handle WebSocket messages
   */
  protected handleWebSocketMessage(data: any): void {
    try {
      const message = JSON.parse(data) as KuCoinWebSocketMessage;
      
      // Handle ping/pong
      if (message.type === 'pong') {
        return;
      }
      
      // Handle subscription success/error
      if (message.type === 'ack' || message.type === 'error') {
        return;
      }
      
      // Handle ticker message
      if (message.type === 'message' && message.subject === 'trade.ticker') {
        const exchangeSymbol = message.data.symbol;
        const symbol = this.normalizeSymbol(exchangeSymbol);
        
        const priceData: ExchangePriceData = {
          symbol,
          exchange: 'KuCoin',
          bid: parseFloat(message.data.bestBid),
          ask: parseFloat(message.data.bestAsk),
          timestamp: message.data.timestamp,
        };
        
        // Emit price update
        this.notifyPriceUpdate(priceData);
      }
      
    } catch (error: any) {
      console.error('Error handling KuCoin WebSocket message:', error);
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
        console.error(`Error in KuCoin REST fallback for ${symbol}:`, error);
      }
    }, 15000); // Check every 15 seconds
    
    this.fallbackIntervals.set(symbol, interval);
  }
  
  /**
   * Disconnect from WebSocket
   */
  public async disconnect(): Promise<void> {
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Clear all fallback intervals
    for (const [symbol, interval] of this.fallbackIntervals.entries()) {
      clearInterval(interval);
    }
    this.fallbackIntervals.clear();
    
    // Disconnect WebSocket
    await super.disconnect();
  }
} 