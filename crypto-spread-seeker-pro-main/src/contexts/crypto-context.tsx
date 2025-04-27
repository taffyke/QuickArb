import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ExchangeManager, PriceUpdateEvent } from '../adapters/exchange-manager';
import { useAppSettings } from './app-settings-context';
import { useNotifications } from './notifications-manager';
import { useSupabase } from '../contexts/supabase-context';
import { ProfileService } from '../services/ProfileService';

// Types for our context
export type Exchange = 
  | 'Binance'
  | 'Bitget'
  | 'Bybit'
  | 'KuCoin'
  | 'Gate.io'
  | 'Bitmart'
  | 'Bitfinex'
  | 'Gemini'
  | 'Coinbase'
  | 'Kraken'
  | 'Poloniex'
  | 'OKX'
  | 'AscendEX'
  | 'Bittrue'
  | 'HTX'
  | 'MEXC';

export type CryptoPair = {
  symbol: string;
  base: string;
  quote: string;
};

export type PriceData = {
  exchange: Exchange;
  pair: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: Date;
};

export type ArbitrageOpportunity = {
  id: string;
  fromExchange: Exchange;
  toExchange: Exchange;
  pair: string;
  spreadAmount: number;
  spreadPercent: number;
  volume24h: number;
  timestamp: Date;
  estimatedProfit: number;
  fees: number;
  netProfit: number;
  networks: NetworkInfo[];
  bestNetwork?: NetworkInfo;
  feeDetails: {
    exchangeFees: number;
    networkFees: number;
    otherFees: number;
  };
  fromExchangePrice?: number;
  toExchangePrice?: number;
};

export type NetworkInfo = {
  name: string;
  fee: number;
  speed: string; // "Fast", "Medium", "Slow"
  congestion: string; // "Low", "Medium", "High"
  estimatedTimeMinutes: number;
};

export type TriangularOpportunity = {
  id: string;
  exchange: Exchange;
  firstPair: string;
  secondPair: string;
  thirdPair: string;
  profitPercent: number;
  timestamp: Date;
  path: string;
  estimatedProfit: number;
  fees: number;
  netProfit: number;
  networks?: NetworkInfo[];
  bestNetwork?: NetworkInfo;
  firstPairPrice?: number;
  secondPairPrice?: number;
  thirdPairPrice?: number;
};

export type FuturesOpportunity = {
  id: string;
  exchange: Exchange;
  pair: string;
  fundingRate: number;
  fundingInterval: string;
  spotPrice: number;
  futuresPrice: number;
  spreadPercent: number;
  timestamp: Date;
  estimatedProfit: number;
  fees: number;
  netProfit: number;
  networks?: NetworkInfo[];
  bestNetwork?: NetworkInfo;
};

export type ExchangeVolume = {
  exchange: Exchange;
  volume24h: number;
  change24h: number;
  pairCount: number;
};

// List of all supported exchanges
const allExchanges: Exchange[] = [
  'Binance', 'Bitget', 'Bybit', 'KuCoin', 'Gate.io', 
  'Bitfinex', 'Gemini', 'Coinbase', 'Kraken', 'Poloniex', 
  'OKX', 'AscendEX', 'Bittrue', 'HTX', 'MEXC'
];

// Common pairs to monitor for arbitrage
const commonPairs = [
  'BTC-USDT',
  'ETH-USDT',
  'BNB-USDT',
  'XRP-USDT',
  'SOL-USDT',
  'ADA-USDT',
  'DOGE-USDT',
  'AVAX-USDT',
  'DOT-USDT',
  'SHIB-USDT'
];

type CryptoContextType = {
  isLoading: boolean;
  exchanges: Exchange[];
  priceData: PriceData[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  triangularOpportunities: TriangularOpportunity[];
  futuresOpportunities: FuturesOpportunity[];
  exchangeVolumes: ExchangeVolume[];
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  refreshData: () => void;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  lastRefreshTime: Date;
};

// Create our context
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// Function to transform price update events to our PriceData format
function transformPriceUpdateToPriceData(update: PriceUpdateEvent): PriceData {
  // Calculate mid price between bid and ask
  const price = (update.bid + update.ask) / 2;
  
  // Symbols are in format BTC-USDT, but we want BTC/USDT for UI
  const pair = update.symbol.replace('-', '/');
  
  return {
    exchange: update.exchange,
    pair,
    price,
    volume24h: update.volume24h || 0,
    // These fields will be populated when we have historical data
    priceChange24h: 0,
    priceChangePercent24h: 0,
    high24h: price,
    low24h: price,
    lastUpdated: new Date(update.timestamp)
  };
}

// Detect arbitrage opportunities from price data
function detectArbitrageOpportunities(priceData: PriceData[]): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const symbols = [...new Set(priceData.map(data => data.pair))];
  
  for (const symbol of symbols) {
    const symbolData = priceData.filter(data => data.pair === symbol);
    
    // Need at least 2 exchanges to compare
    if (symbolData.length < 2) continue;
    
    // Compare each exchange with every other exchange
    for (let i = 0; i < symbolData.length; i++) {
      for (let j = i + 1; j < symbolData.length; j++) {
        const fromData = symbolData[i];
        const toData = symbolData[j];
        
        // Calculate spread
        const spreadAmount = Math.abs(fromData.price - toData.price);
        const spreadPercent = (spreadAmount / Math.min(fromData.price, toData.price)) * 100;
        
        // Only consider meaningful spreads (above 0.5%)
        if (spreadPercent < 0.5) continue;
        
        // Determine which exchange has the lower price (buy from) and higher price (sell to)
        const [buyData, sellData] = fromData.price < toData.price 
          ? [fromData, toData] 
          : [toData, fromData];
          
        // Calculate estimated profit (using the lower volume of the two exchanges)
        const volume = Math.min(buyData.volume24h, sellData.volume24h) * 0.001; // 0.1% of volume
        const estimatedProfit = volume * (spreadPercent / 100);
        
        // Estimate fees
        const exchangeFees = estimatedProfit * 0.1; // 10% exchange fees
        const networkFees = 5; // Fixed network fee in USD
        const otherFees = estimatedProfit * 0.05; // 5% slippage and other costs
        const totalFees = exchangeFees + networkFees + otherFees;
        
        // Create mock network info (would be replaced with real data)
        const networks = [
          {
            name: "Ethereum",
            fee: 5 + Math.random() * 15,
            speed: "Medium",
            congestion: "Medium",
            estimatedTimeMinutes: 10
          },
          {
            name: "Binance Smart Chain",
            fee: 0.5 + Math.random() * 2,
            speed: "Fast",
            congestion: "Low",
            estimatedTimeMinutes: 3
          },
          {
            name: "Solana",
            fee: 0.01 + Math.random() * 0.05,
            speed: "Fast",
            congestion: "Low",
            estimatedTimeMinutes: 1
          }
        ];
        
        // Choose best network (lowest fee in this example)
        const bestNetwork = [...networks].sort((a, b) => a.fee - b.fee)[0];
        
        opportunities.push({
          id: `arb-${buyData.exchange}-${sellData.exchange}-${symbol}`,
          fromExchange: buyData.exchange,
          toExchange: sellData.exchange,
          pair: symbol,
          spreadAmount,
          spreadPercent,
          volume24h: volume,
          timestamp: new Date(),
          estimatedProfit,
          fees: totalFees,
          netProfit: estimatedProfit - totalFees,
          networks,
          bestNetwork,
          feeDetails: {
            exchangeFees,
            networkFees,
            otherFees
          },
          fromExchangePrice: buyData.price,
          toExchangePrice: sellData.price
        });
      }
    }
  }
  
  // Sort by net profit
  return opportunities.sort((a, b) => b.netProfit - a.netProfit);
}

// Provider component
export function CryptoProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings();
  const { notifyArbitrageOpportunity, notifyPriceAlert } = useNotifications();
  const { user } = useSupabase();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exchangeManager] = useState<ExchangeManager>(() => new ExchangeManager({
    userId: user?.id
  }));
  const [exchanges] = useState<Exchange[]>(allExchanges);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [triangularOpportunities, setTriangularOpportunities] = useState<TriangularOpportunity[]>([]);
  const [futuresOpportunities, setFuturesOpportunities] = useState<FuturesOpportunity[]>([]);
  const [exchangeVolumes, setExchangeVolumes] = useState<ExchangeVolume[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>(commonPairs[0]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [apiKeysInitialized, setApiKeysInitialized] = useState<boolean>(false);
  
  // Update user ID when user changes
  useEffect(() => {
    if (user?.id) {
      // Make sure the exchangeManager has the latest user ID
      exchangeManager.setUserId(user.id);
      
      // Initialize API keys
      initializeApiKeys();
    }
  }, [user?.id, exchangeManager]);
  
  // Load and set API keys
  const initializeApiKeys = async () => {
    if (!user?.id || apiKeysInitialized) return;
    
    try {
      console.log('[CryptoProvider] Starting API key initialization for user:', user.id);
      
      // Get the profile service
      const profileService = ProfileService.getInstance();
      
      // Get the user profile which will load API keys
      console.log('[CryptoProvider] Fetching user profile...');
      const profile = await profileService.getUserProfile();
      console.log('[CryptoProvider] User profile loaded, API keys found:', profile?.apiKeys?.length || 0);
      
      if (profile?.apiKeys && profile.apiKeys.length > 0) {
        // Set API keys for each exchange
        for (const apiKey of profile.apiKeys) {
          try {
            console.log(`[CryptoProvider] Setting API key for exchange: ${apiKey.exchangeId}`);
            exchangeManager.setApiKey(apiKey.exchangeId, apiKey.id);
          } catch (error) {
            console.error(`Failed to set API key for ${apiKey.exchangeId}:`, error);
          }
        }
        
        console.log(`[CryptoProvider] Initialized ${profile.apiKeys.length} API keys`);
      } else {
        console.log('[CryptoProvider] No API keys found for user');
      }
      
      setApiKeysInitialized(true);
    } catch (error) {
      console.error('[CryptoProvider] Failed to initialize API keys:', error);
    }
  };
  
  // Initialize exchange connections
  useEffect(() => {
    async function initializeExchanges() {
      setIsLoading(true);
      
      try {
        // Connect to all exchanges
        await exchangeManager.connectAll();
        
        // Subscribe to price updates for common pairs
        await exchangeManager.subscribeToSymbols(commonPairs);
        
        // Register price update handler
        exchangeManager.onPriceUpdate(handlePriceUpdate);
        
        // Initial data load is complete
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize exchanges:', error);
        setIsLoading(false);
      }
    }
    
    initializeExchanges();
    
    // Cleanup on unmount
    return () => {
      exchangeManager.disconnectAll();
    };
  }, [exchangeManager]);
  
  // Handle price updates from exchanges
  const handlePriceUpdate = useCallback((update: PriceUpdateEvent) => {
    // Transform to our PriceData format
    const newPriceData = transformPriceUpdateToPriceData(update);
    
    // Update price data state
    setPriceData(current => {
      // Replace existing data for this exchange/pair, or add new
      const existingIndex = current.findIndex(
        data => data.exchange === update.exchange && data.pair === newPriceData.pair
      );
      
      // Check for significant price changes to trigger alerts
      if (existingIndex >= 0) {
        const existingData = current[existingIndex];
        const priceChange = ((newPriceData.price - existingData.price) / existingData.price) * 100;
        
        // If price change exceeds 5%, send a notification
        if (Math.abs(priceChange) >= 5) {
          notifyPriceAlert(newPriceData.pair, newPriceData.price, priceChange);
        }
      }
      
      if (existingIndex >= 0) {
        const updatedData = [...current];
        updatedData[existingIndex] = newPriceData;
        return updatedData;
      } else {
        return [...current, newPriceData];
      }
    });
  }, [notifyPriceAlert]);
  
  // Update arbitrage opportunities when price data changes
  useEffect(() => {
    if (priceData.length >= 2) {
      const opportunities = detectArbitrageOpportunities(priceData);
      setArbitrageOpportunities(opportunities);
      
      // Notify about high-profit opportunities
      const minProfitForNotification = settings.notifications.minProfitThreshold || 2.0;
      opportunities
        .filter(opp => opp.spreadPercent >= minProfitForNotification)
        .slice(0, 3) // Limit to top 3 to avoid notification spam
        .forEach(opp => {
          notifyArbitrageOpportunity(opp);
        });
    }
  }, [priceData, notifyArbitrageOpportunity, settings.notifications.minProfitThreshold]);
  
  // Auto-refresh based on user settings
  useEffect(() => {
    // Only set up auto-refresh if interval is greater than 0
    if (settings.refreshInterval > 0) {
      const intervalId = setInterval(() => {
        refreshData();
      }, settings.refreshInterval * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [settings.refreshInterval]);
  
  // Function to subscribe to a symbol
  const subscribeToSymbol = async (symbol: string) => {
    try {
      await exchangeManager.subscribeToSymbol(symbol);
    } catch (error) {
      console.error(`Failed to subscribe to ${symbol}:`, error);
    }
  };
  
  // Function to unsubscribe from a symbol
  const unsubscribeFromSymbol = async (symbol: string) => {
    try {
      await exchangeManager.unsubscribeFromSymbol(symbol);
    } catch (error) {
      console.error(`Failed to unsubscribe from ${symbol}:`, error);
    }
  };
  
  // Function to manually refresh all data
  const refreshData = useCallback(() => {
    // Force data refresh
    exchangeManager.refreshAllPrices();
    setLastRefreshTime(new Date());
  }, [exchangeManager]);
  
  // Our context value
  const contextValue: CryptoContextType = {
    isLoading,
    exchanges,
    priceData,
    arbitrageOpportunities,
    triangularOpportunities,
    futuresOpportunities,
    exchangeVolumes,
    selectedPair,
    setSelectedPair,
    refreshData,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    lastRefreshTime
  };
  
  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  );
}

// Hook to access our context
export function useCrypto() {
  const context = useContext(CryptoContext);
  
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  
  return context;
}
