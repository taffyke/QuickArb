import { Exchange } from '../contexts/crypto-context';
import { UserSessionManager, PriceUpdateEvent } from './UserSessionManager';

/**
 * Arbitrage opportunity between two exchanges
 */
export interface ArbitrageOpportunity {
  id: string;
  fromExchange: Exchange;
  toExchange: Exchange;
  pair: string;
  spreadAmount: number;
  spreadPercent: number;
  timestamp: Date;
  fromExchangePrice: number;
  toExchangePrice: number;
  volume24h?: number;
  estimatedProfit: number;
  fees: {
    tradingFees: number;
    networkFees: number;
    gasPrice?: number;
  };
  netProfit: number;
  profitable: boolean;
  risk: 'low' | 'medium' | 'high';
}

/**
 * Configuration for the arbitrage service
 */
export interface ArbitrageServiceConfig {
  minSpreadPercent: number;
  maxOpportunities: number;
  includeFees: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  onlyProfitableOpportunities: boolean;
  tradingFeePercent: number;
  networkFeeUsd: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ArbitrageServiceConfig = {
  minSpreadPercent: 0.5,
  maxOpportunities: 100,
  includeFees: true,
  autoRefresh: true,
  refreshInterval: 30,
  onlyProfitableOpportunities: false,
  tradingFeePercent: 0.1, // 0.1% per trade
  networkFeeUsd: 5 // $5 for network transfer
};

/**
 * Service for detecting and analyzing direct arbitrage opportunities 
 * between exchanges for the current user
 */
export class DirectArbitrageService {
  private static instance: DirectArbitrageService;
  private userSession: UserSessionManager;
  private config: ArbitrageServiceConfig;
  private opportunities: ArbitrageOpportunity[] = [];
  private latestPrices: Map<string, Map<Exchange, PriceUpdateEvent>> = new Map();
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(opportunities: ArbitrageOpportunity[]) => void> = [];
  
  private constructor() {
    this.userSession = new UserSessionManager();
    this.config = { ...DEFAULT_CONFIG };
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): DirectArbitrageService {
    if (!DirectArbitrageService.instance) {
      DirectArbitrageService.instance = new DirectArbitrageService();
    }
    return DirectArbitrageService.instance;
  }
  
  /**
   * Initialize the service for a user
   * @param userId User ID to initialize for
   * @param config Optional configuration
   */
  public async initialize(userId: string, config?: Partial<ArbitrageServiceConfig>): Promise<void> {
    // Update config if provided
    if (config) {
      this.config = {
        ...this.config,
        ...config
      };
    }
    
    // Initialize user session with exchange adapters
    await this.userSession.initialize(userId);
    
    // Subscribe to price updates
    this.userSession.onPriceUpdate(this.handlePriceUpdate.bind(this));
    
    // Start auto-refresh if enabled
    if (this.config.autoRefresh) {
      this.startAutoRefresh();
    }
  }
  
  /**
   * Handle price updates from exchanges
   */
  private handlePriceUpdate(data: PriceUpdateEvent): void {
    // Store latest price for exchange/symbol pair
    if (!this.latestPrices.has(data.symbol)) {
      this.latestPrices.set(data.symbol, new Map());
    }
    
    const symbolMap = this.latestPrices.get(data.symbol)!;
    symbolMap.set(data.exchange, data);
    
    // Check for arbitrage opportunities when we have at least 2 exchanges
    if (symbolMap.size >= 2) {
      this.detectArbitrageForSymbol(data.symbol);
    }
  }
  
  /**
   * Detect arbitrage opportunities for a specific symbol
   */
  private detectArbitrageForSymbol(symbol: string): void {
    const symbolMap = this.latestPrices.get(symbol);
    if (!symbolMap || symbolMap.size < 2) return;
    
    const exchanges = Array.from(symbolMap.keys());
    const newOpportunities: ArbitrageOpportunity[] = [];
    
    // Compare each exchange with every other exchange
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const exchange1 = exchanges[i];
        const exchange2 = exchanges[j];
        
        const data1 = symbolMap.get(exchange1)!;
        const data2 = symbolMap.get(exchange2)!;
        
        // Calculate mid price for each exchange
        const price1 = (data1.bid + data1.ask) / 2;
        const price2 = (data2.bid + data2.ask) / 2;
        
        // Calculate absolute spread
        const spreadAmount = Math.abs(price1 - price2);
        
        // Calculate percentage spread
        const minPrice = Math.min(price1, price2);
        const spreadPercent = (spreadAmount / minPrice) * 100;
        
        // Check if spread meets minimum threshold
        if (spreadPercent >= this.config.minSpreadPercent) {
          // Determine buy/sell exchanges (buy at lower price, sell at higher price)
          const [fromExchange, toExchange, fromPrice, toPrice] = 
            price1 < price2 
              ? [exchange1, exchange2, price1, price2] 
              : [exchange2, exchange1, price2, price1];
          
          // Calculate volume (use the minimum between both exchanges)
          const volume24h = Math.min(
            data1.volume24h ?? 0, 
            data2.volume24h ?? 0
          );
          
          // Calculate fees if enabled
          const tradingFees = this.config.includeFees 
            ? (toPrice * (this.config.tradingFeePercent / 100)) * 2 // Buy and sell fees
            : 0;
          
          const networkFees = this.config.includeFees 
            ? this.config.networkFeeUsd 
            : 0;
          
          // Estimated profit (for 1 unit)
          const estimatedProfit = spreadAmount;
          
          // Net profit after fees
          const netProfit = estimatedProfit - tradingFees - networkFees;
          
          // Check if profitable (if setting requires it)
          const profitable = netProfit > 0;
          
          if (!this.config.onlyProfitableOpportunities || profitable) {
            // Create opportunity object
            const opportunity: ArbitrageOpportunity = {
              id: `${fromExchange}-${toExchange}-${symbol}-${Date.now()}`,
              fromExchange,
              toExchange,
              pair: symbol,
              spreadAmount,
              spreadPercent,
              timestamp: new Date(),
              fromExchangePrice: fromPrice,
              toExchangePrice: toPrice,
              volume24h,
              estimatedProfit,
              fees: {
                tradingFees,
                networkFees
              },
              netProfit,
              profitable,
              risk: this.calculateRisk(spreadPercent, volume24h)
            };
            
            newOpportunities.push(opportunity);
          }
        }
      }
    }
    
    // If we found new opportunities, update the list
    if (newOpportunities.length > 0) {
      this.updateOpportunities(newOpportunities);
    }
  }
  
  /**
   * Calculate risk level for an opportunity
   */
  private calculateRisk(
    spreadPercent: number, 
    volume24h: number
  ): 'low' | 'medium' | 'high' {
    // Higher spread typically means higher risk of the spread closing quickly
    if (spreadPercent > 5) {
      return 'high';
    }
    
    // Low volume means higher risk of slippage
    if (volume24h < 100000) { // Less than $100k daily volume
      return 'high';
    }
    
    if (volume24h < 1000000) { // Less than $1M daily volume
      return 'medium';
    }
    
    // Low spread, high volume = lowest risk
    if (spreadPercent < 1) {
      return 'low';
    }
    
    return 'medium';
  }
  
  /**
   * Update the opportunities list with new opportunities
   */
  private updateOpportunities(newOpportunities: ArbitrageOpportunity[]): void {
    // Merge new opportunities with existing ones
    // Remove duplicates (same exchange pair and symbol)
    const opportunityMap = new Map<string, ArbitrageOpportunity>();
    
    // First add existing opportunities
    this.opportunities.forEach(opp => {
      const key = `${opp.fromExchange}-${opp.toExchange}-${opp.pair}`;
      opportunityMap.set(key, opp);
    });
    
    // Then add or update with new opportunities
    newOpportunities.forEach(opp => {
      const key = `${opp.fromExchange}-${opp.toExchange}-${opp.pair}`;
      opportunityMap.set(key, opp);
    });
    
    // Convert back to array and sort by spread percentage
    this.opportunities = Array.from(opportunityMap.values())
      .sort((a, b) => b.spreadPercent - a.spreadPercent);
    
    // Limit to maximum number of opportunities
    if (this.opportunities.length > this.config.maxOpportunities) {
      this.opportunities = this.opportunities.slice(0, this.config.maxOpportunities);
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Start auto-refresh timer for opportunity detection
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      // Refresh all opportunities by re-analyzing all symbols
      this.refreshOpportunities();
    }, this.config.refreshInterval * 1000);
  }
  
  /**
   * Stop auto-refresh timer
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  /**
   * Manually refresh all opportunities
   */
  public refreshOpportunities(): void {
    console.log('[DirectArbitrageService] Refreshing opportunities');
    
    // Re-analyze all symbols
    for (const symbol of this.latestPrices.keys()) {
      this.detectArbitrageForSymbol(symbol);
    }
  }
  
  /**
   * Subscribe to symbols for arbitrage analysis
   * @param symbols List of symbols to subscribe to
   */
  public async subscribeToSymbols(symbols: string[]): Promise<void> {
    if (!this.userSession.isInitialized()) {
      throw new Error('User session not initialized');
    }
    
    await this.userSession.subscribeToSymbols(symbols);
  }
  
  /**
   * Unsubscribe from symbols
   * @param symbols List of symbols to unsubscribe from
   */
  public async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    if (!this.userSession.isInitialized()) {
      throw new Error('User session not initialized');
    }
    
    await this.userSession.unsubscribeFromSymbols(symbols);
  }
  
  /**
   * Get all current arbitrage opportunities
   */
  public getOpportunities(): ArbitrageOpportunity[] {
    return [...this.opportunities];
  }
  
  /**
   * Get a specific opportunity by ID
   */
  public getOpportunityById(id: string): ArbitrageOpportunity | undefined {
    return this.opportunities.find(opp => opp.id === id);
  }
  
  /**
   * Add a listener for opportunity updates
   */
  public addListener(callback: (opportunities: ArbitrageOpportunity[]) => void): void {
    this.listeners.push(callback);
  }
  
  /**
   * Remove a listener
   */
  public removeListener(callback: (opportunities: ArbitrageOpportunity[]) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of opportunity updates
   */
  private notifyListeners(): void {
    const opportunities = this.getOpportunities();
    this.listeners.forEach(listener => {
      try {
        listener(opportunities);
      } catch (error) {
        console.error('[DirectArbitrageService] Error in listener:', error);
      }
    });
  }
  
  /**
   * Update service configuration
   */
  public updateConfig(config: Partial<ArbitrageServiceConfig>): void {
    const prevAutoRefresh = this.config.autoRefresh;
    const prevInterval = this.config.refreshInterval;
    
    // Update config
    this.config = {
      ...this.config,
      ...config
    };
    
    // Handle auto-refresh changes
    if (!prevAutoRefresh && this.config.autoRefresh) {
      // Auto-refresh was enabled
      this.startAutoRefresh();
    } else if (prevAutoRefresh && !this.config.autoRefresh) {
      // Auto-refresh was disabled
      this.stopAutoRefresh();
    } else if (prevAutoRefresh && this.config.autoRefresh && prevInterval !== this.config.refreshInterval) {
      // Refresh interval changed
      this.stopAutoRefresh();
      this.startAutoRefresh();
    }
    
    // Reprocess opportunities if criteria changed
    if (
      config.minSpreadPercent !== undefined || 
      config.includeFees !== undefined ||
      config.onlyProfitableOpportunities !== undefined ||
      config.tradingFeePercent !== undefined ||
      config.networkFeeUsd !== undefined
    ) {
      this.refreshOpportunities();
    }
  }
  
  /**
   * Clean up when user logs out
   */
  public async cleanup(): Promise<void> {
    // Stop auto-refresh
    this.stopAutoRefresh();
    
    // Clear opportunities
    this.opportunities = [];
    this.latestPrices.clear();
    
    // Clean up user session
    await this.userSession.cleanup();
  }
} 