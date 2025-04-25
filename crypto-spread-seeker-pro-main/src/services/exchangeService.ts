import { useSupabase } from '@/contexts/supabase-context';

// Exchange API key type
export interface ExchangeApiKey {
  id: string;
  exchange: string;
  label: string;
  api_key: string;
  secret: string;
  passphrase?: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
}

// Market data types
export interface MarketTicker {
  symbol: string;
  lastPrice: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  timestamp: Date;
  exchange: string;
}

export interface ExchangeBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

// This would normally use a library like ccxt for real exchange connections
export class ExchangeService {
  private apiKeys: Map<string, ExchangeApiKey> = new Map();
  private exchangeInstances: Map<string, any> = new Map();
  private supabase: any;
  private userId: string;
  private initialized: boolean = false;
  
  constructor(userId: string, supabaseClient: any) {
    this.userId = userId;
    this.supabase = supabaseClient;
  }
  
  // Initialize by loading API keys from secure storage
  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) return true;
      
      // For demo mode or development
      if (this.userId === 'demo-user') {
        this.initialized = true;
        return true;
      }
      
      // Load encrypted API keys
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active');
      
      if (error) {
        console.error('Error loading API keys:', error);
        return false;
      }
      
      // Process each key
      for (const key of data || []) {
        this.apiKeys.set(key.id, {
          id: key.id,
          exchange: key.exchange,
          label: key.label,
          api_key: key.api_key,
          secret: key.secret,
          passphrase: key.passphrase,
          permissions: key.permissions
        });
        
        // Initialize exchange connection
        await this.initializeExchange(key.id);
      }
      
      this.initialized = true;
      return true;
    } catch (err) {
      console.error('Error initializing ExchangeService:', err);
      return false;
    }
  }
  
  // Initialize specific exchange connection
  private async initializeExchange(keyId: string): Promise<boolean> {
    const key = this.apiKeys.get(keyId);
    if (!key) return false;
    
    try {
      // In a real implementation, this would use ccxt or a similar library
      // to create actual exchange instances
      
      // For now, we'll simulate exchange connections
      this.exchangeInstances.set(keyId, {
        exchange: key.exchange,
        apiKey: key.api_key,
        // The secret would be securely decrypted on the server side in production
        fetchTickers: async () => this.simulateFetchTickers(key.exchange),
        fetchBalances: async () => this.simulateFetchBalances(key.exchange),
        testConnection: async () => ({ success: true })
      });
      
      return true;
    } catch (err) {
      console.error(`Error initializing ${key.exchange} connection:`, err);
      return false;
    }
  }
  
  // Test if an API key works with the exchange
  async testApiKey(keyId: string): Promise<{ success: boolean; message: string }> {
    await this.initialize();
    
    // Get the key from our storage
    const key = this.apiKeys.get(keyId);
    if (!key) {
      return { success: false, message: 'API key not found' };
    }
    
    try {
      // Check if we already have an instance
      let instance = this.exchangeInstances.get(keyId);
      if (!instance) {
        // Try to initialize the exchange
        const initialized = await this.initializeExchange(keyId);
        if (!initialized) {
          throw new Error('Failed to initialize exchange connection');
        }
        instance = this.exchangeInstances.get(keyId);
      }
      
      // Test the connection (in a real implementation, this would make an actual API call)
      const result = await instance.testConnection();
      
      if (result.success) {
        // Update last used timestamp in database
        await this.supabase
          .from('api_keys')
          .update({ 
            last_used: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', keyId);
      }
      
      return result;
    } catch (err) {
      console.error(`Error testing ${key.exchange} API key:`, err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  // Get market data for a specific exchange
  async getExchangeTickers(keyId: string, symbols?: string[]): Promise<MarketTicker[]> {
    await this.initialize();
    
    const instance = this.exchangeInstances.get(keyId);
    if (!instance) {
      throw new Error('Exchange not initialized');
    }
    
    try {
      const tickers = await instance.fetchTickers();
      
      // Filter by symbols if provided
      if (symbols && symbols.length > 0) {
        return tickers.filter((ticker: MarketTicker) => 
          symbols.includes(ticker.symbol)
        );
      }
      
      return tickers;
    } catch (err) {
      console.error(`Error fetching tickers from ${instance.exchange}:`, err);
      return [];
    }
  }
  
  // Get user balances from an exchange
  async getExchangeBalances(keyId: string): Promise<ExchangeBalance[]> {
    await this.initialize();
    
    const instance = this.exchangeInstances.get(keyId);
    if (!instance) {
      throw new Error('Exchange not initialized');
    }
    
    // Check if the key has trading permission
    const key = this.apiKeys.get(keyId);
    if (!key || !key.permissions.read) {
      throw new Error('API key does not have read permission');
    }
    
    try {
      return await instance.fetchBalances();
    } catch (err) {
      console.error(`Error fetching balances from ${instance.exchange}:`, err);
      return [];
    }
  }
  
  // Get all connected exchanges
  getConnectedExchanges(): string[] {
    const exchanges = new Set<string>();
    
    for (const key of this.apiKeys.values()) {
      exchanges.add(key.exchange);
    }
    
    return Array.from(exchanges);
  }
  
  // Simulate fetching tickers from an exchange (for development/demo)
  private simulateFetchTickers(exchange: string): MarketTicker[] {
    const now = new Date();
    const tickers: MarketTicker[] = [];
    
    // Generate some realistic ticker data based on the exchange
    switch (exchange) {
      case 'Binance':
        tickers.push(
          {
            symbol: 'BTC/USDT',
            lastPrice: 63500 + (Math.random() * 1000 - 500),
            bidPrice: 63450 + (Math.random() * 100 - 50),
            askPrice: 63550 + (Math.random() * 100 - 50),
            volume: 1200 + (Math.random() * 300),
            timestamp: now,
            exchange
          },
          {
            symbol: 'ETH/USDT',
            lastPrice: 3050 + (Math.random() * 50 - 25),
            bidPrice: 3045 + (Math.random() * 10 - 5),
            askPrice: 3055 + (Math.random() * 10 - 5),
            volume: 5000 + (Math.random() * 1000),
            timestamp: now,
            exchange
          },
          {
            symbol: 'SOL/USDT',
            lastPrice: 140 + (Math.random() * 5 - 2.5),
            bidPrice: 139.8 + (Math.random() * 0.5 - 0.25),
            askPrice: 140.2 + (Math.random() * 0.5 - 0.25),
            volume: 15000 + (Math.random() * 3000),
            timestamp: now,
            exchange
          }
        );
        break;
        
      case 'Coinbase':
        tickers.push(
          {
            symbol: 'BTC/USD',
            lastPrice: 63550 + (Math.random() * 1000 - 500),
            bidPrice: 63500 + (Math.random() * 100 - 50),
            askPrice: 63600 + (Math.random() * 100 - 50),
            volume: 800 + (Math.random() * 200),
            timestamp: now,
            exchange
          },
          {
            symbol: 'ETH/USD',
            lastPrice: 3055 + (Math.random() * 50 - 25),
            bidPrice: 3050 + (Math.random() * 10 - 5),
            askPrice: 3060 + (Math.random() * 10 - 5),
            volume: 4000 + (Math.random() * 800),
            timestamp: now,
            exchange
          }
        );
        break;
        
      default:
        // Generic data for other exchanges
        tickers.push(
          {
            symbol: 'BTC/USDT',
            lastPrice: 63500 + (Math.random() * 1000 - 500),
            bidPrice: 63450 + (Math.random() * 100 - 50),
            askPrice: 63550 + (Math.random() * 100 - 50),
            volume: 1000 + (Math.random() * 200),
            timestamp: now,
            exchange
          }
        );
    }
    
    return tickers;
  }
  
  // Simulate fetching balances from an exchange (for development/demo)
  private simulateFetchBalances(exchange: string): ExchangeBalance[] {
    const balances: ExchangeBalance[] = [];
    
    // Generate some realistic balance data
    balances.push(
      {
        asset: 'BTC',
        free: 0.05 + (Math.random() * 0.01),
        locked: 0,
        total: 0.05 + (Math.random() * 0.01)
      },
      {
        asset: 'ETH',
        free: 2 + (Math.random() * 0.5),
        locked: 0.1,
        total: 2.1 + (Math.random() * 0.5)
      },
      {
        asset: 'USDT',
        free: 5000 + (Math.random() * 1000),
        locked: 0,
        total: 5000 + (Math.random() * 1000)
      }
    );
    
    return balances;
  }
}

// Hook to use the exchange service
export const useExchangeService = () => {
  const { user, supabase } = useSupabase();
  
  const createService = () => {
    if (!user) return null;
    return new ExchangeService(user.id, supabase);
  };
  
  return { createService };
}; 