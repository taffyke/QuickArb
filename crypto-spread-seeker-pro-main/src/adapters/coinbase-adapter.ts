import { BaseExchangeAdapter } from './base-adapter';
import { ExchangeAdapterConfig, ExchangePriceData, ExchangeError, ExchangeErrorType } from './types';
import { exchangeEndpoints } from '../config/exchange-endpoints';
import { ApiKeyManager } from '../services/api-key-manager';
import { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

export class CoinbaseAdapter extends BaseExchangeAdapter {
  private symbolCache: Map<string, string> = new Map();

  constructor() {
    // Get API credentials if available
    const keyManager = ApiKeyManager.getInstance();
    const credentials = keyManager.getCredentials('Coinbase');
    
    super('Coinbase', {
      restBaseUrl: exchangeEndpoints.Coinbase.rest,
      wsBaseUrl: exchangeEndpoints.Coinbase.ws,
      apiKey: credentials?.apiKey,
      apiSecret: credentials?.apiSecret
    });

    // Set up rate limiters for Coinbase
    this.setupRateLimiter('default', {
      maxRequests: 10,
      timeWindowMs: 1000,
      requestCost: 1
    });
  }

  protected normalizeSymbol(symbol: string): string {
    // Coinbase uses BTC-USD format, which matches our internal format
    return symbol;
  }

  protected denormalizeSymbol(symbol: string): string {
    // For Coinbase, we need to ensure USDT is converted to USD for some pairs
    // Get from cache if available
    if (this.symbolCache.has(symbol)) {
      return this.symbolCache.get(symbol) as string;
    }
    
    // Handle common USDT pairs conversion to USD
    if (symbol.endsWith('-USDT')) {
      const base = symbol.split('-')[0];
      const converted = `${base}-USD`;
      this.symbolCache.set(symbol, converted);
      return converted;
    }
    
    return symbol;
  }

  protected async sendSubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    await this.sendWebSocketMessage({
      type: 'subscribe',
      product_ids: [exchangeSymbol],
      channels: ['ticker']
    });
    
    console.log(`[Coinbase] Subscribed to ${exchangeSymbol}`);
  }

  protected async sendUnsubscription(symbol: string): Promise<void> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    await this.sendWebSocketMessage({
      type: 'unsubscribe',
      product_ids: [exchangeSymbol],
      channels: ['ticker']
    });
    
    console.log(`[Coinbase] Unsubscribed from ${exchangeSymbol}`);
  }

  protected handleWebSocketMessage(data: any): void {
    // Process Coinbase WebSocket messages
    if (data.type === 'ticker') {
      const symbol = this.normalizeSymbol(data.product_id);
      
      const priceData: ExchangePriceData = {
        symbol,
        exchange: 'Coinbase',
        bid: parseFloat(data.best_bid),
        ask: parseFloat(data.best_ask),
        timestamp: new Date(data.time).getTime(),
        volume24h: parseFloat(data.volume_24h)
      };
      
      this.notifyPriceUpdate(priceData);
    }
  }

  public async getSupportedSymbols(): Promise<string[]> {
    try {
      const products = await this.executeRequest<any[]>(
        '/products',
        { method: 'GET' },
        'products'
      );
      
      return products.map(product => {
        const normalizedSymbol = `${product.base_currency}-${product.quote_currency}`;
        // Cache the mapping between our format and exchange format
        this.symbolCache.set(normalizedSymbol, product.id);
        return normalizedSymbol;
      });
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch supported symbols from Coinbase: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Coinbase',
        { originalError: error }
      );
    }
  }

  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    const exchangeSymbol = this.denormalizeSymbol(symbol);
    
    try {
      const ticker = await this.executeRequest<any>(
        `/products/${exchangeSymbol}/ticker`,
        { method: 'GET' },
        'ticker'
      );
      
      // Update last REST fetch timestamp
      this.lastRestFetch.set(symbol, Date.now());
      
      return {
        symbol,
        exchange: 'Coinbase',
        bid: parseFloat(ticker.bid),
        ask: parseFloat(ticker.ask),
        timestamp: new Date(ticker.time).getTime(),
        volume24h: parseFloat(ticker.volume)
      };
    } catch (error: any) {
      throw new ExchangeError(
        `Failed to fetch price for ${symbol} from Coinbase: ${error.message}`,
        ExchangeErrorType.API_ERROR,
        'Coinbase',
        { symbol, originalError: error }
      );
    }
  }

  /**
   * Set up authentication for Coinbase API requests
   */
  protected setupApiKeyAuth(): void {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return;
    }
    
    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      
      const timestamp = Date.now() / 1000;
      const method = config.method?.toUpperCase() || 'GET';
      const path = config.url || '';
      const body = config.data ? JSON.stringify(config.data) : '';
      
      // Coinbase requires a specific signature format
      const message = timestamp + method + path + body;
      const signature = this.createHmacSignature(message, this.config.apiSecret);
      
      config.headers['CB-ACCESS-KEY'] = this.config.apiKey;
      config.headers['CB-ACCESS-SIGN'] = signature;
      config.headers['CB-ACCESS-TIMESTAMP'] = timestamp.toString();
      
      return config;
    });
  }
  
  // Helper method to create HMAC signature
  private createHmacSignature(message: string, secret: string): string {
    // In a real implementation, you would use crypto library to create HMAC
    // For browser compatibility, you might need to use a library like crypto-js
    // This is a placeholder - in production use proper HMAC implementation
    console.log('Creating signature for', message.substring(0, 20) + '...');
    return 'signature-placeholder';
  }
} 