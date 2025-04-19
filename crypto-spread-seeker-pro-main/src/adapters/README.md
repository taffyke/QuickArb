# Exchange Adapters for Real-Time Cryptocurrency Data

This directory contains adapters for fetching real-time cryptocurrency price data from various exchanges. The implementation follows a modular architecture with a unified interface for all exchanges.

## Core Components

- `types.ts`: Interfaces and types shared across adapters
- `base-adapter.ts`: Base abstract class implementing common functionality
- `binance-adapter.ts`: Implementation for Binance (example adapter)
- `exchange-manager.ts`: Manager to coordinate all exchange adapters

## Adding a New Exchange Adapter

To add a new exchange adapter, follow these steps:

1. Create a new file named `[exchange-name]-adapter.ts` in this directory
2. Extend the `BaseExchangeAdapter` class
3. Implement the required abstract methods
4. Add the adapter to `exchange-manager.ts`

### Template for a New Exchange Adapter

```typescript
import { BaseExchangeAdapter } from './base-adapter';
import { 
  ExchangeAdapterConfig, 
  ExchangePriceData, 
  ExchangeError, 
  ExchangeErrorType 
} from './types';
import { Exchange } from '../contexts/crypto-context';

/**
 * [Exchange Name] API response types
 */
interface ExchangeTickerResponse {
  // Define the response structure based on the exchange's API
  // ...
}

/**
 * Default config for [Exchange Name]
 */
const DEFAULT_CONFIG: ExchangeAdapterConfig = {
  restBaseUrl: 'https://api.exchange.com',
  wsBaseUrl: 'wss://stream.exchange.com',
  reconnectDelay: 1000,
  maxRetries: 10
};

/**
 * Rate limits for [Exchange Name]
 */
const RATE_LIMITS = {
  DEFAULT: {
    maxRequests: 1000,
    timeWindowMs: 60000, // 1 minute
  },
  // Add more specific rate limits as needed
};

/**
 * [Exchange Name] adapter implementation
 */
export class ExchangeNameAdapter extends BaseExchangeAdapter {
  constructor(config: Partial<ExchangeAdapterConfig> = {}) {
    super('ExchangeName' as Exchange, {
      ...DEFAULT_CONFIG,
      ...config
    });

    // Setup rate limiters
    this.setupRateLimiter('default', RATE_LIMITS.DEFAULT);
  }

  /**
   * Get all supported symbols
   */
  public async getSupportedSymbols(): Promise<string[]> {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Fetch current price data for a symbol via REST API
   */
  public async fetchPrice(symbol: string): Promise<ExchangePriceData> {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Normalize symbol to unified format (BTC-USDT)
   */
  protected normalizeSymbol(symbol: string): string {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Denormalize symbol to exchange-specific format
   */
  protected denormalizeSymbol(symbol: string): string {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Send WebSocket subscription message
   */
  protected async sendSubscription(symbol: string): Promise<void> {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Send WebSocket unsubscription message
   */
  protected async sendUnsubscription(symbol: string): Promise<void> {
    // Implement exchange-specific logic
    // ...
  }

  /**
   * Handle WebSocket message
   */
  protected handleWebSocketMessage(data: any): void {
    // Implement exchange-specific logic
    // ...
  }
}
```

### Adding the Adapter to Exchange Manager

After creating your adapter, add it to the `initDefaultAdapters` method in `exchange-manager.ts`:

```typescript
private initDefaultAdapters(): void {
  this.registerAdapter('Binance', new BinanceAdapter());
  this.registerAdapter('ExchangeName', new ExchangeNameAdapter());
  // Add more adapters here
}
```

## Key Implementation Details

### REST API Integration

- Use the `executeRequest` method for making rate-limited REST API calls
- Fetch initial price data via REST when subscribing to a symbol
- Implement a fallback to REST every 30 seconds as a safeguard against missing WebSocket updates

### WebSocket Integration

- Implement proper connection and reconnection logic
- Handle different WebSocket message formats depending on the exchange
- Ensure proper error handling and logging

### Symbol Normalization

- All exchanges use different symbol formats (e.g., `BTCUSDT` vs `BTC-USD` vs `BTC/USDT`)
- Normalize to a consistent format (`BTC-USDT`) for internal use
- Denormalize when communicating with the exchange API

### Rate Limiting

- Respect each exchange's rate limits to avoid IP bans
- Implement token bucket algorithm for proper rate limiting
- Configure different rate limits for different API endpoints

## Testing

Each adapter should have a corresponding test file in the `tests` directory that:

1. Mocks WebSocket and REST API responses
2. Tests connection, subscription, and data handling
3. Verifies symbol normalization and denormalization
4. Checks error handling and reconnection logic

See `tests/binance-adapter.test.ts` for an example. 