import { Exchange } from '../contexts/crypto-context';

/**
 * Normalized price data format for all exchanges
 */
export interface ExchangePriceData {
  symbol: string;          // Unified format (e.g. "BTC-USDT")
  exchange: Exchange;      // Exchange name
  bid: number;             // Best bid price
  ask: number;             // Best ask price
  timestamp: number;       // UTC timestamp in milliseconds
  volume24h?: number;      // 24h volume (optional, depends on exchange API)
}

/**
 * Common interface for all exchange adapters
 */
export interface ExchangeAdapter {
  /**
   * Connect to the exchange (establish WebSocket connections)
   */
  connect(): Promise<void>;
  
  /**
   * Subscribe to price updates for a given symbol
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  subscribeToSymbol(symbol: string): Promise<void>;
  
  /**
   * Unsubscribe from price updates for a given symbol
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  unsubscribeFromSymbol(symbol: string): Promise<void>;
  
  /**
   * Register a callback to receive price updates
   * @param callback Function to call when prices are updated
   */
  onPriceUpdate(callback: (priceData: ExchangePriceData) => void): void;
  
  /**
   * Disconnect from the exchange
   */
  disconnect(): Promise<void>;
  
  /**
   * Get all supported symbols from the exchange
   */
  getSupportedSymbols(): Promise<string[]>;
  
  /**
   * Get currently subscribed symbols
   * @returns Array of symbols the adapter is currently subscribed to
   */
  getSubscribedSymbols(): string[];
  
  /**
   * Fetch current price data for a symbol via REST API
   * @param symbol Unified symbol format (e.g. "BTC-USDT")
   */
  fetchPrice(symbol: string): Promise<ExchangePriceData>;
}

/**
 * Configuration options for exchange adapters
 */
export interface ExchangeAdapterConfig {
  restBaseUrl: string;
  wsBaseUrl: string;
  apiKey?: string;
  apiSecret?: string;
  reconnectDelay?: number;
  maxRetries?: number;
}

/**
 * WebSocket message handlers
 */
export interface WebSocketMessageHandlers {
  onOpen?: () => void;
  onMessage: (data: any) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * REST API rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;     // Maximum number of requests
  timeWindowMs: number;    // Time window in milliseconds
  requestCost?: number;    // Cost of the request (for weighted rate limits)
}

/**
 * Error types for exchange adapters
 */
export enum ExchangeErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Exchange error with specific details
 */
export class ExchangeError extends Error {
  type: ExchangeErrorType;
  exchange: Exchange;
  details?: any;

  constructor(message: string, type: ExchangeErrorType, exchange: Exchange, details?: any) {
    super(message);
    this.type = type;
    this.exchange = exchange;
    this.details = details;
    this.name = 'ExchangeError';
  }
} 