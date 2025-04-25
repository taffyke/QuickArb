import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter, ExchangePriceData, ExchangeErrorType, ExchangeError } from './types';
import { getMockPrice, getSupportedSymbols } from '../services/mock-crypto-service';

/**
 * Adapter that provides mock cryptocurrency data
 */
export class MockAdapter implements ExchangeAdapter {
  private priceUpdateCallbacks: Array<(data: ExchangePriceData) => void> = [];
  private subscribedSymbols: Set<string> = new Set();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private connected: boolean = false;
  private exchange: Exchange;
  
  constructor(exchange: Exchange) {
    this.exchange = exchange;
  }
  
  /**
   * Connect to the exchange
   */
  public async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    console.log(`[MockAdapter] Connected to ${this.exchange}`);
  }
  
  /**
   * Subscribe to price updates for a symbol
   */
  public async subscribeToSymbol(symbol: string): Promise<void> {
    try {
      // If already subscribed, do nothing
      if (this.subscribedSymbols.has(symbol)) {
        return;
      }
      
      // Add to subscribed symbols
      this.subscribedSymbols.add(symbol);
      
      // Create interval for price updates
      const interval = setInterval(() => {
        try {
          // Get mock price
          const priceData = getMockPrice(symbol, this.exchange);
          
          // Emit price update
          this.emitPriceUpdate(priceData);
        } catch (error) {
          console.error(`[MockAdapter] Error fetching price for ${symbol} on ${this.exchange}:`, error);
        }
      }, 3000); // Update every 3 seconds
      
      this.updateIntervals.set(symbol, interval);
      
      // Emit initial price update
      const initialPrice = getMockPrice(symbol, this.exchange);
      this.emitPriceUpdate(initialPrice);
      
      console.log(`[MockAdapter] Subscribed to ${symbol} on ${this.exchange}`);
    } catch (error) {
      const mockError = new ExchangeError(
        `Failed to subscribe to ${symbol} on ${this.exchange}: ${(error as Error).message}`,
        ExchangeErrorType.SUBSCRIPTION_ERROR,
        this.exchange,
        error
      );
      throw mockError;
    }
  }
  
  /**
   * Unsubscribe from price updates for a symbol
   */
  public async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.subscribedSymbols.has(symbol)) {
      return;
    }
    
    this.subscribedSymbols.delete(symbol);
    
    // Clear interval
    if (this.updateIntervals.has(symbol)) {
      clearInterval(this.updateIntervals.get(symbol)!);
      this.updateIntervals.delete(symbol);
    }
    
    console.log(`[MockAdapter] Unsubscribed from ${symbol} on ${this.exchange}`);
  }
  
  /**
   * Register a callback to receive price updates
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
    
    console.log(`[MockAdapter] Disconnected from ${this.exchange}`);
  }
  
  /**
   * Get all supported symbols from the exchange
   */
  public async getSupportedSymbols(): Promise<string[]> {
    // Return mock supported symbols
    return getSupportedSymbols();
  }
  
  /**
   * Get currently subscribed symbols
   */
  public getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }
  
  /**
   * Fetch current price data for a symbol
   */
  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    try {
      return getMockPrice(symbol, this.exchange);
    } catch (error) {
      const mockError = new ExchangeError(
        `Failed to fetch price for ${symbol} on ${this.exchange}: ${(error as Error).message}`,
        ExchangeErrorType.API_ERROR,
        this.exchange,
        error
      );
      throw mockError;
    }
  }
} 