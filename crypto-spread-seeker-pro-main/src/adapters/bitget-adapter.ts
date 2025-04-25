import { BaseExchangeAdapter } from './base-adapter';
import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapterConfig, ExchangePriceData, ExchangeErrorType, ExchangeError } from './types';

/**
 * Bitget API adapter
 * Documentation: https://bitgetlimited.github.io/apidoc/en/spot
 */
export class BitgetAdapter extends BaseExchangeAdapter {
  constructor(config?: Partial<ExchangeAdapterConfig>) {
    super('Bitget', {
      restBaseUrl: 'https://api.bitget.com',
      wsBaseUrl: 'wss://ws.bitget.com/spot/v1/stream',
      ...config
    });

    // Set up rate limiter - Bitget has a rate limit of 20 requests per second
    this.setupRateLimiter('default', { maxRequests: 20, timeWindowMs: 1000 });
  }

  /**
   * Get all supported symbols from Bitget
   */
  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.executeRequest<{
        data: Array<{
          symbol: string;
          baseCoin: string;
          quoteCoin: string;
        }>
      }>('/api/spot/v1/public/products');

      return response.data.map(item => 
        this.normalizeSymbol(`${item.baseCoin}${item.quoteCoin}`)
      );
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to get Bitget symbols: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bitget',
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
        data: {
          symbol: string;
          askPr: string;
          bidPr: string;
          high24h: string;
          low24h: string;
          lastPr: string;
          volume24h: string;
          ts: string;
        }
      }>(`/api/spot/v1/market/ticker?symbol=${exchangeSymbol}`);
      
      const data = tickerResponse.data;
      
      return {
        symbol,
        exchange: 'Bitget',
        bid: parseFloat(data.bidPr),
        ask: parseFloat(data.askPr),
        timestamp: parseInt(data.ts),
        volume24h: parseFloat(data.volume24h)
      };
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to fetch Bitget price for ${symbol}: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Bitget',
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
    // Bitget uses BTCUSDT format
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
   * Convert our unified symbol format to Bitget's format
   */
  protected denormalizeSymbol(symbol: string): string {
    // Convert from our format (BTC-USDT) to Bitget's format (BTCUSDT_SPBL)
    const [base, quote] = symbol.split('-');
    return `${base}${quote}_SPBL`;
  }

  /**
   * Send a subscription message to the WebSocket
   */
  protected async sendSubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol).replace('_SPBL', '');
    
    const subscriptionMessage = {
      op: "subscribe",
      args: [{
        instType: "sp",
        channel: "ticker",
        instId: exchangeSymbol
      }]
    };
    
    await this.sendWebSocketMessage(subscriptionMessage);
  }

  /**
   * Send an unsubscribe message to the WebSocket
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol).replace('_SPBL', '');
    
    const unsubscriptionMessage = {
      op: "unsubscribe",
      args: [{
        instType: "sp",
        channel: "ticker",
        instId: exchangeSymbol
      }]
    };
    
    await this.sendWebSocketMessage(unsubscriptionMessage);
  }

  /**
   * Handle incoming WebSocket messages
   */
  protected handleWebSocketMessage(data: any): void {
    try {
      // Handle ping messages
      if (data.action === 'ping') {
        this.sendWebSocketMessage({ action: 'pong', data: data.data }).catch(error => {
          console.error('[Bitget] Failed to send pong:', error);
        });
        return;
      }
      
      // Handle ticker data
      if (data.arg && data.arg.channel === 'ticker' && data.data) {
        const tickerData = data.data[0];
        const instId = data.arg.instId;
        
        // Construct normalized symbol
        const symbol = this.normalizeSymbol(instId);
        
        const priceData: ExchangePriceData = {
          symbol,
          exchange: 'Bitget',
          bid: parseFloat(tickerData.bidPr),
          ask: parseFloat(tickerData.askPr),
          timestamp: parseInt(tickerData.ts),
          volume24h: parseFloat(tickerData.volume24h)
        };
        
        this.notifyPriceUpdate(priceData);
      }
    } catch (error: any) {
      this.handleError(new ExchangeError(
        `Failed to handle Bitget WebSocket message: ${error.message}`,
        ExchangeErrorType.PARSING_ERROR,
        'Bitget',
        { originalError: error, data }
      ));
    }
  }
} 