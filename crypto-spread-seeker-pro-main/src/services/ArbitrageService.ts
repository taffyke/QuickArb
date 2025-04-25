import { useSupabase } from '@/contexts/supabase-context';

// Types
export interface ArbitrageOpportunity {
  id: string;
  type: ArbitrageType;
  profit: number;
  profitPercentage: number;
  exchanges: string[];
  route: string[];
  volume: number;
  timestamp: Date;
  executionSpeed: number; // milliseconds
  fees: number;
}

export type ArbitrageType = 
  | 'triangular'   // Within a single exchange
  | 'direct'       // Between 2+ exchanges for the same pair
  | 'futures'      // Between spot and futures markets
  | 'stablecoin'   // Between stablecoins
  | 'p2p';         // Between exchange and P2P platforms

export type ArbitrageStatus = 
  | 'detected'
  | 'analyzing'
  | 'executing'
  | 'completed'
  | 'failed';

// Class to detect and execute arbitrage opportunities based on available API keys
export class ArbitrageService {
  private userId: string;
  private supabase: any;
  private availableExchanges: Set<string> = new Set();
  private apiKeys: any[] = [];

  constructor(userId: string, supabaseClient: any) {
    this.userId = userId;
    this.supabase = supabaseClient;
  }

  // Initialize by loading API keys
  async initialize(): Promise<boolean> {
    try {
      // For demo mode
      if (this.userId === 'demo-user') {
        this.availableExchanges = new Set(['Binance', 'Coinbase', 'Kraken']);
        return true;
      }

      // Load API keys from Supabase
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error loading API keys:', error);
        return false;
      }

      this.apiKeys = data || [];
      this.availableExchanges = new Set(this.apiKeys.map(key => key.exchange));
      
      return this.apiKeys.length > 0;
    } catch (err) {
      console.error('Error initializing ArbitrageService:', err);
      return false;
    }
  }

  // Get available arbitrage types based on connected exchanges
  getAvailableArbitrageTypes(): ArbitrageType[] {
    const types: ArbitrageType[] = [];
    
    // Triangular arbitrage requires only one exchange
    if (this.availableExchanges.size >= 1) {
      types.push('triangular');
    }
    
    // Direct, futures arbitrage requires at least 2 exchanges
    if (this.availableExchanges.size >= 2) {
      types.push('direct');
      types.push('futures');
    }
    
    // Stablecoin arbitrage can work with 1+ exchanges
    if (this.availableExchanges.size >= 1) {
      types.push('stablecoin');
    }
    
    // P2P requires specific exchanges with P2P support
    const hasP2PSupport = [...this.availableExchanges].some(
      exchange => ['Binance', 'Huobi', 'OKX'].includes(exchange)
    );
    
    if (hasP2PSupport) {
      types.push('p2p');
    }
    
    return types;
  }

  // Find triangular arbitrage opportunities (within a single exchange)
  async findTriangularArbitrageOpportunities(
    exchange: string,
    minProfitPercentage = 0.5
  ): Promise<ArbitrageOpportunity[]> {
    try {
      // In a real implementation, this would:
      // 1. Fetch all trading pairs from the exchange
      // 2. Build a graph of connected currency pairs
      // 3. Find triangular paths with positive arbitrage
      
      // For demo purposes, we'll return sample data
      if (exchange === 'Binance') {
        return [
          {
            id: '1',
            type: 'triangular',
            profit: 24.5,
            profitPercentage: 0.82,
            exchanges: ['Binance'],
            route: ['BTC', 'ETH', 'BNB', 'BTC'],
            volume: 0.1,
            timestamp: new Date(),
            executionSpeed: 1200,
            fees: 0.15
          },
          {
            id: '2',
            type: 'triangular',
            profit: 18.3,
            profitPercentage: 0.61,
            exchanges: ['Binance'],
            route: ['USDT', 'LINK', 'ETH', 'USDT'],
            volume: 1000,
            timestamp: new Date(),
            executionSpeed: 900,
            fees: 0.2
          }
        ];
      }
      
      return [];
    } catch (err) {
      console.error('Error finding triangular arbitrage:', err);
      return [];
    }
  }

  // Find direct arbitrage opportunities (between exchanges)
  async findDirectArbitrageOpportunities(
    minProfitPercentage = 0.8
  ): Promise<ArbitrageOpportunity[]> {
    // This requires at least 2 exchanges
    if (this.availableExchanges.size < 2) {
      return [];
    }
    
    try {
      // For demo purposes, return sample data
      return [
        {
          id: '3',
          type: 'direct',
          profit: 35.2,
          profitPercentage: 1.17,
          exchanges: ['Binance', 'Coinbase'],
          route: ['BUY BTC on Binance', 'SELL BTC on Coinbase'],
          volume: 0.5,
          timestamp: new Date(),
          executionSpeed: 3500,
          fees: 0.35
        }
      ];
    } catch (err) {
      console.error('Error finding direct arbitrage:', err);
      return [];
    }
  }

  // Get all arbitrage opportunities based on available exchanges
  async getAllArbitrageOpportunities(
    minProfitPercentage = 0.5
  ): Promise<ArbitrageOpportunity[]> {
    try {
      await this.initialize();
      
      const opportunities: ArbitrageOpportunity[] = [];
      
      // Find triangular opportunities for each exchange
      for (const exchange of this.availableExchanges) {
        const triangularOpps = await this.findTriangularArbitrageOpportunities(
          exchange,
          minProfitPercentage
        );
        opportunities.push(...triangularOpps);
      }
      
      // If we have multiple exchanges, find direct opportunities
      if (this.availableExchanges.size >= 2) {
        const directOpps = await this.findDirectArbitrageOpportunities(
          minProfitPercentage
        );
        opportunities.push(...directOpps);
      }
      
      // Sort by profit percentage (highest first)
      return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
    } catch (err) {
      console.error('Error getting all arbitrage opportunities:', err);
      return [];
    }
  }

  // Execute an arbitrage opportunity (simulated)
  async executeArbitrage(
    opportunityId: string
  ): Promise<{ success: boolean; status: ArbitrageStatus; message: string }> {
    try {
      // This would be implemented to execute the trades based on the opportunity
      return {
        success: true,
        status: 'completed',
        message: 'Arbitrage executed successfully'
      };
    } catch (err) {
      console.error('Error executing arbitrage:', err);
      return {
        success: false,
        status: 'failed',
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
}

// Hook to use the arbitrage service
export const useArbitrageService = () => {
  const { user, supabase } = useSupabase();
  
  const createService = () => {
    if (!user) return null;
    return new ArbitrageService(user.id, supabase);
  };
  
  return { createService };
}; 