import WebSocket from 'ws';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosHeaders } from 'axios';
import { 
  ExchangeAdapter, 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  WebSocketMessageHandlers,
  ExchangeError,
  ExchangeErrorType,
  RateLimitConfig
} from './types';
import { Exchange } from '../contexts/crypto-context';

/**
 * Base adapter class implementing common functionality for all exchanges
 */
export abstract class BaseExchangeAdapter implements ExchangeAdapter {
  protected readonly exchange: Exchange;
  protected readonly config: ExchangeAdapterConfig;
  protected readonly axiosInstance: AxiosInstance;
  protected ws: WebSocket | null = null;
  protected wsConnected = false;
  protected reconnectAttempts = 0;
  protected reconnectTimeout: NodeJS.Timeout | null = null;
  protected subscriptions: Set<string> = new Set();
  protected priceUpdateCallbacks: Array<(priceData: ExchangePriceData) => void> = [];
  protected lastRestFetch: Map<string, number> = new Map();
  protected rateLimiters: Map<string, TokenBucket> = new Map();

  constructor(exchange: Exchange, config: ExchangeAdapterConfig) {
    this.exchange = exchange;
    this.config = {
      ...config,
      reconnectDelay: config.reconnectDelay || 1000,
      maxRetries: config.maxRetries || 10
    };

    // Create Axios instance for REST API calls
    this.axiosInstance = axios.create({
      baseURL: this.config.restBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crypto-Spread-Seeker-Pro'
      }
    });

    // Add request interceptor for API keys if provided
    if (this.config.apiKey && this.config.apiSecret) {
      this.setupApiKeyAuth();
    }
  }

  /**
   * Connect to the exchange via WebSocket
   */
  public async connect(): Promise<void> {
    if (this.ws && this.wsConnected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsBaseUrl);
        
        this.ws.on('open', () => {
          console.log(`[${this.exchange}] WebSocket connected`);
          this.wsConnected = true;
          this.reconnectAttempts = 0;
          this.resubscribeAll();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const parsedData = JSON.parse(data.toString());
            this.handleWebSocketMessage(parsedData);
          } catch (error) {
            this.handleError(new ExchangeError(
              `Failed to parse WebSocket message: ${error}`,
              ExchangeErrorType.PARSING_ERROR,
              this.exchange,
              { data }
            ));
          }
        });

        this.ws.on('error', (error) => {
          console.error(`[${this.exchange}] WebSocket error:`, error);
          this.handleError(new ExchangeError(
            `WebSocket error: ${error.message}`,
            ExchangeErrorType.CONNECTION_ERROR,
            this.exchange,
            { originalError: error }
          ));
        });

        this.ws.on('close', () => {
          console.warn(`[${this.exchange}] WebSocket connection closed`);
          this.wsConnected = false;
          this.attemptReconnect();
        });
      } catch (error: any) {
        const exchangeError = new ExchangeError(
          `Failed to connect to ${this.exchange}: ${error.message}`,
          ExchangeErrorType.CONNECTION_ERROR,
          this.exchange,
          { originalError: error }
        );
        this.handleError(exchangeError);
        reject(exchangeError);
      }
    });
  }

  /**
   * Disconnect from the exchange
   */
  public async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.subscriptions.clear();
      this.wsConnected = false;
      return new Promise<void>((resolve) => {
        if (this.ws) {
          this.ws.on('close', () => {
            this.ws = null;
            resolve();
          });
          this.ws.close();
        } else {
          resolve();
        }
      });
    }

    return Promise.resolve();
  }

  /**
   * Subscribe to price updates for a symbol
   */
  public async subscribeToSymbol(symbol: string): Promise<void> {
    // Normalize symbol format for internal consistency
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    // Add to subscriptions set
    this.subscriptions.add(normalizedSymbol);
    
    // If not connected, will subscribe on connection
    if (!this.wsConnected || !this.ws) {
      await this.connect();
      return;
    }

    // Send subscription message
    await this.sendSubscription(normalizedSymbol);
    
    // Immediately fetch initial data via REST
    try {
      const priceData = await this.fetchPrice(normalizedSymbol);
      this.notifyPriceUpdate(priceData);
    } catch (error) {
      console.error(`[${this.exchange}] Failed to fetch initial price for ${normalizedSymbol}`, error);
    }
  }

  /**
   * Unsubscribe from price updates for a symbol
   */
  public async unsubscribeFromSymbol(symbol: string): Promise<void> {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    this.subscriptions.delete(normalizedSymbol);
    
    if (this.wsConnected && this.ws) {
      await this.sendUnsubscription(normalizedSymbol);
    }
  }

  /**
   * Register callback for price updates
   */
  public onPriceUpdate(callback: (priceData: ExchangePriceData) => void): void {
    this.priceUpdateCallbacks.push(callback);
  }

  /**
   * Get all supported symbols
   */
  public abstract getSupportedSymbols(): Promise<string[]>;

  /**
   * Fetch price data for a symbol via REST API
   */
  public abstract fetchPrice(symbol: string): Promise<ExchangePriceData>;

  /**
   * Normalize symbol to unified format (BTC-USDT)
   */
  protected abstract normalizeSymbol(symbol: string): string;

  /**
   * Denormalize symbol to exchange-specific format
   */
  protected abstract denormalizeSymbol(symbol: string): string;

  /**
   * Send WebSocket subscription message
   */
  protected abstract sendSubscription(symbol: string): Promise<void>;

  /**
   * Send WebSocket unsubscription message
   */
  protected abstract sendUnsubscription(symbol: string): Promise<void>;

  /**
   * Handle WebSocket message
   */
  protected abstract handleWebSocketMessage(data: any): void;

  /**
   * Resubscribe to all symbols after reconnect
   */
  protected async resubscribeAll(): Promise<void> {
    const promises = Array.from(this.subscriptions).map(symbol => 
      this.sendSubscription(symbol).catch(error => {
        console.error(`[${this.exchange}] Failed to resubscribe to ${symbol}:`, error);
      })
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  protected attemptReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= (this.config.maxRetries || 10)) {
      console.error(`[${this.exchange}] Max reconnection attempts reached, giving up`);
      return;
    }

    const delay = this.calculateBackoffDelay();
    console.log(`[${this.exchange}] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error(`[${this.exchange}] Reconnection failed:`, error);
        this.attemptReconnect();
      });
    }, delay);
  }

  /**
   * Calculate exponential backoff delay
   */
  protected calculateBackoffDelay(): number {
    // Exponential backoff with jitter: min(baseDelay * 2^attempt, maxDelay) * (0.5 + random * 0.5)
    const baseDelay = this.config.reconnectDelay || 1000;
    const maxDelay = 60000; // Max 1 minute
    
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, this.reconnectAttempts),
      maxDelay
    );
    
    // Add jitter (50-100% of the delay) to prevent thundering herd problem
    return exponentialDelay * (0.5 + Math.random() * 0.5);
  }

  /**
   * Notify all callbacks of price update
   */
  protected notifyPriceUpdate(priceData: ExchangePriceData): void {
    this.priceUpdateCallbacks.forEach(callback => {
      try {
        callback(priceData);
      } catch (error) {
        console.error(`[${this.exchange}] Error in price update callback:`, error);
      }
    });
  }

  /**
   * Send message via WebSocket
   */
  protected sendWebSocketMessage(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.wsConnected) {
        reject(new ExchangeError(
          'WebSocket not connected',
          ExchangeErrorType.CONNECTION_ERROR,
          this.exchange
        ));
        return;
      }

      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(messageStr, (error) => {
          if (error) {
            reject(new ExchangeError(
              `Failed to send WebSocket message: ${error.message}`,
              ExchangeErrorType.CONNECTION_ERROR,
              this.exchange,
              { originalError: error }
            ));
          } else {
            resolve();
          }
        });
      } catch (error: any) {
        reject(new ExchangeError(
          `Failed to send WebSocket message: ${error.message}`,
          ExchangeErrorType.CONNECTION_ERROR,
          this.exchange,
          { originalError: error }
        ));
      }
    });
  }

  /**
   * Setup authentication for API requests
   */
  protected setupApiKeyAuth(): void {
    // This is just a basic implementation - child classes may override with exchange-specific auth
    this.axiosInstance.interceptors.request.use((config) => {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      
      if (this.config.apiKey) {
        config.headers.set('X-API-KEY', this.config.apiKey);
      }
      return config;
    });
  }

  /**
   * Execute REST API request with rate limiting
   */
  protected async executeRequest<T>(
    endpoint: string, 
    options: AxiosRequestConfig = {}, 
    rateLimitKey = 'default'
  ): Promise<T> {
    // Check and wait for rate limit if needed
    await this.checkRateLimit(rateLimitKey);
    
    try {
      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        ...options
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Handle rate limit error
        const retryAfter = error.response.headers['retry-after'] || 60;
        throw new ExchangeError(
          `Rate limit exceeded, retry after ${retryAfter}s`,
          ExchangeErrorType.RATE_LIMIT_ERROR,
          this.exchange,
          { retryAfter, originalError: error }
        );
      }
      
      throw new ExchangeError(
        `API request failed: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        this.exchange,
        { endpoint, options, originalError: error }
      );
    }
  }

  /**
   * Handle errors in a centralized way
   */
  protected handleError(error: ExchangeError): void {
    // Log error
    console.error(`[${this.exchange}] ${error.type}: ${error.message}`, error.details);
    
    // TODO: Add error event emission here when we implement event emitter
  }

  /**
   * Setup rate limiter for an endpoint
   */
  protected setupRateLimiter(key: string, config: RateLimitConfig): void {
    this.rateLimiters.set(key, new TokenBucket(
      config.maxRequests,
      config.maxRequests,
      config.timeWindowMs
    ));
  }

  /**
   * Check if we can make a request under rate limits
   */
  protected async checkRateLimit(key: string): Promise<void> {
    const rateLimiter = this.rateLimiters.get(key);
    if (!rateLimiter) {
      return; // No rate limiter configured for this key
    }

    if (!rateLimiter.tryConsume(1)) {
      const waitTime = rateLimiter.getWaitTimeMs();
      if (waitTime > 0) {
        console.warn(`[${this.exchange}] Rate limit reached for ${key}, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkRateLimit(key); // Try again after waiting
      }
    }
  }
}

/**
 * Simple token bucket algorithm for rate limiting
 */
export class TokenBucket {
  private tokens: number;
  private lastRefillTimestamp: number;
  private readonly capacity: number;
  private readonly refillIntervalMs: number;

  constructor(initialTokens: number, capacity: number, refillIntervalMs: number) {
    this.tokens = initialTokens;
    this.capacity = capacity;
    this.refillIntervalMs = refillIntervalMs;
    this.lastRefillTimestamp = Date.now();
  }

  /**
   * Try to consume tokens from the bucket
   * @param count Number of tokens to consume
   * @returns true if tokens were consumed, false if not enough tokens
   */
  public tryConsume(count: number): boolean {
    this.refill();
    
    if (this.tokens < count) {
      return false;
    }
    
    this.tokens -= count;
    return true;
  }

  /**
   * Get estimated wait time until the requested tokens are available
   * @param count Number of tokens needed
   * @returns Wait time in milliseconds
   */
  public getWaitTimeMs(count: number = 1): number {
    this.refill();
    
    if (this.tokens >= count) {
      return 0;
    }
    
    const tokensNeeded = count - this.tokens;
    return Math.ceil((tokensNeeded / this.capacity) * this.refillIntervalMs);
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTimestamp;
    
    if (elapsedMs < 1) {
      return;
    }
    
    const refillRatio = elapsedMs / this.refillIntervalMs;
    const tokensToAdd = Math.floor(this.capacity * refillRatio);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }
} 