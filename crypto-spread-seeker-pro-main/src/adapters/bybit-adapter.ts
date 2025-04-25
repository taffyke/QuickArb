import { BaseExchangeAdapter } from './base-adapter';
import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapterConfig, ExchangePriceData, ExchangeErrorType, ExchangeError } from './types';

/**
 * Bybit API adapter
 * Documentation: https://bybit-exchange.github.io/docs/spot/v3/
 */
export class BybitAdapter extends BaseExchangeAdapter {
  constructor(config?: Partial<ExchangeAdapterConfig>) {
    super('Bybit', {
      restBaseUrl: 'https://api.bybit.com',
      wsBaseUrl: 'wss://stream.bybit.com/spot/public/v3',
      ...config
    });

    // Set up rate limiter - Bybit has a rate limit of 10 requests per second
    this.setupRateLimiter('default', { maxRequests: 10, timeWindowMs: 1000 });
  }

  /**
   * Get all supported symbols from Bybit
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<{
        result: {
          list: Array<{
            name: string;
            baseCoin: string;
            quoteCoin: string;
          }>
        },
        retCode: number,
        retMsg: string
      }>('/spot/v3/public/symbols');

      if (response.retCode !== 0) {
        throw new Error(`Bybit API error: ${response.retMsg}`);
      }

      return response.result.list.map(item => 
        this.normalizeSymbol(item.name)
      );
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to get Bybit symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bybit',
        { originalError: error }
      ));
      return [];
    }
  }

  /**
   * Fetch current price for a symbol via REST API
   */
  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    try {
      const tickerResponse = await this.executeRequest<{
        result: {
          symbol: string;
          bid1Price: string;
          ask1Price: string;
          lastPrice: string;
          volume24h: string;
          high24h: string;
          low24h: string;
          timestamp: string;
        },
        retCode: number,
        retMsg: string
      }>(`/spot/v3/public/quote/ticker/price?symbol=${exchangeSymbol}`);
      
      if (tickerResponse.retCode !== 0) {
        throw new Error(`Bybit API error: ${tickerResponse.retMsg}`);
      }
      
      const data = tickerResponse.result;
      
      return {
        symbol,
        exchange: 'Bybit',
        bid: parseFloat(data.bid1Price),
        ask: parseFloat(data.ask1Price),
        timestamp: parseInt(data.timestamp),
        volume24h: parseFloat(data.volume24h)
      };
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to fetch Bybit price for ${symbol}: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bybit',
        { originalError: error, symbol }
      ));
      
      // Rethrow to let the caller handle the error
      throw error;
    }
  }

  /**
   * Normalize a symbol to our unified format (BTC-USDT)
   */
  protected normalizeSymbol(symbol: string): string {
    // Bybit uses BTCUSDT format
    // We need to identify the quote currency (usually USDT, USD, BTC, ETH)
    const quoteCurrencies = ['USDT', 'USD', 'BTC', 'ETH', 'BUSD'];
    
    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        return `${base}-${quote}`;
      }
    }
    
    // If we can't identify it, make a best guess
    if (symbol.length > 3) {
      const quote = symbol.slice(-4);
      const base = symbol.slice(0, -4);
      return `${base}-${quote}`;
    }
    
    return symbol;
  }

  /**
   * Convert our unified symbol format to Bybit's format
   */
  protected denormalizeSymbol(symbol: string): string {
    // Convert from our format (BTC-USDT) to Bybit's format (BTCUSDT)
    const [base, quote] = symbol.split('-');
    return `${base}${quote}`;
  }

  /**
   * Send a subscription message to the WebSocket
   */
  protected async sendSubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    const subscriptionMessage = {
      op: "subscribe",
      args: [`ticker.${exchangeSymbol}`]
    };
    
    await this.sendWebSocketMessage(subscriptionMessage);
  }

  /**
   * Send an unsubscribe message to the WebSocket
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    const unsubscriptionMessage = {
      op: "unsubscribe",
      args: [`ticker.${exchangeSymbol}`]
    };
    
    await this.sendWebSocketMessage(unsubscriptionMessage);
  }

  /**
   * Handle incoming WebSocket messages
   */
  protected handleWebSocketMessage(data: any): void {
    try {
      // Handle ping messages
      if (data.op === 'ping') {
        this.sendWebSocketMessage({ op: 'pong' }).catch(error => {
          console.error('[Bybit] Failed to send pong:', error);
        });
        return;
      }
      
      // Handle ticker data
      if (data.topic && data.topic.startsWith('ticker.') && data.data) {
        const tickerData = data.data;
        const symbolRaw = data.topic.replace('ticker.', '');
        
        // Construct normalized symbol
        const symbol = this.normalizeSymbol(symbolRaw);
        
        const priceData: ExchangePriceData = {
          symbol,
          exchange: 'Bybit',
          bid: parseFloat(tickerData.bid1Price),
          ask: parseFloat(tickerData.ask1Price),
          timestamp: parseFloat(tickerData.timestamp),
          volume24h: parseFloat(tickerData.volume24h)
        };
        
        this.notifyPriceUpdate(priceData);
      }
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to handle Bybit WebSocket message: ${error.message}`,
        ExchangeErrorType.PARSING_ERROR,
        'Bybit',
        { originalError: error, data }
      ));
    }
  }
} 