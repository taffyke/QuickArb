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

// Provider component
export function CryptoProvider({ children }: { children: ReactNode }) {
  const { notifyError, notifySuccess } = useNotifications();
  const { appSettings } = useAppSettings();
  const { user } = useSupabase();
  
  const [isLoading, setIsLoading] = useState(true);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [triangularOpportunities, setTriangularOpportunities] = useState<TriangularOpportunity[]>([]);
  const [futuresOpportunities, setFuturesOpportunities] = useState<FuturesOpportunity[]>([]);
  const [exchangeVolumes, setExchangeVolumes] = useState<ExchangeVolume[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>(commonPairs[0]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // Create a ref to store the ExchangeManager instance
  const exchangeManagerRef = React.useRef<ExchangeManager | null>(null);
  
  // Initialize on component mount
  useEffect(() => {
    console.log('CryptoProvider: Initializing');
    
    // Create exchange manager instance
    const useMockData = appSettings?.useMockData || !user;
    exchangeManagerRef.current = new ExchangeManager({
      useMockData,
      userId: user?.id,
      maxUpdatesPerSecond: 5,
      autoReconnect: true,
      logErrors: true
    });
    
    // Get user API keys
    if (user?.id) {
      initializeApiKeys();
    } else {
      // If not logged in, initialize with default exchanges
      initializeExchanges();
    }
    
    // Cleanup on unmount
    return () => {
      if (exchangeManagerRef.current) {
        exchangeManagerRef.current.disconnectAll();
      }
    };
  }, [user?.id]);
  
  // Initialize API keys for authenticated users
  const initializeApiKeys = async () => {
    try {
      const profileService = ProfileService.getInstance();
      if (!user?.id) return;
      
      await profileService.initializeUserProfile(user.id);
      
      // Get user's preferred exchanges with API keys
      const exchangesWithKeys = profileService.getExchangesWithActiveKeys();
      
      // Set active exchanges
      setExchanges(exchangesWithKeys.length > 0 ? exchangesWithKeys : ['Binance', 'Bybit', 'KuCoin']);
      
      // Initialize exchanges
      await initializeExchanges();
    } catch (error) {
      console.error('Error initializing API keys:', error);
      notifyError('Failed to load API keys', 'Using default exchanges instead.');
      
      // Fallback to default exchanges
      setExchanges(['Binance', 'Bybit', 'KuCoin']);
      await initializeExchanges();
    }
  };
  
  // Set up exchange connections and listeners
  async function initializeExchanges() {
    try {
      setIsLoading(true);
      
      if (!exchangeManagerRef.current) {
        throw new Error('Exchange manager not initialized');
      }
      
      // Register price update handler
      exchangeManagerRef.current.onPriceUpdate((update) => {
        // Transform to our PriceData format
        const newPriceData = transformPriceUpdateToPriceData(update);
        
        // Update state (using functional update to ensure we have latest state)
        setPriceData((currentData) => {
          // Find if we already have data for this exchange and pair
          const existingIndex = currentData.findIndex(
            item => item.exchange === newPriceData.exchange && item.pair === newPriceData.pair
          );
          
          if (existingIndex >= 0) {
            // Update existing
            const updatedData = [...currentData];
            updatedData[existingIndex] = newPriceData;
            return updatedData;
          } else {
            // Add new
            return [...currentData, newPriceData];
          }
        });
      });
      
      // Register error handler
      exchangeManagerRef.current.onError((error, exchange, isWebSocket) => {
        console.error(`[CryptoContext] Error from ${exchange}:`, error);
        notifyError(`Error from ${exchange}`, error.message);
      });
      
      // Connect to exchanges
      await exchangeManagerRef.current.connectAll();
      
      // Get all supported symbols
      const supportedSymbols = await exchangeManagerRef.current.getCommonSymbols();
      console.log('Common supported symbols:', supportedSymbols);
      
      // Subscribe to initial pairs
      const initialPairs = supportedSymbols.length > 0 
        ? supportedSymbols.slice(0, 5)  // Use first 5 common symbols
        : commonPairs.slice(0, 5);      // Fallback to predefined pairs
      
      await exchangeManagerRef.current.subscribeToSymbols(initialPairs);
      
      // Initial data fetch
      await refreshData();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing exchanges:', error);
      notifyError('Exchange Connection Error', 'Failed to connect to cryptocurrency exchanges');
      setIsLoading(false);
    }
  }
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!exchangeManagerRef.current) return;
    
    try {
      await exchangeManagerRef.current.refreshAllPrices();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);
  
  // Subscribe to new symbol
  const subscribeToSymbol = async (symbol: string) => {
    if (!exchangeManagerRef.current) return;
    try {
      await exchangeManagerRef.current.subscribeToSymbol(symbol);
    } catch (error) {
      console.error(`Error subscribing to ${symbol}:`, error);
    }
  };
  
  // Unsubscribe from symbol
  const unsubscribeFromSymbol = async (symbol: string) => {
    if (!exchangeManagerRef.current) return;
    try {
      await exchangeManagerRef.current.unsubscribeFromSymbol(symbol);
    } catch (error) {
      console.error(`Error unsubscribing from ${symbol}:`, error);
    }
  };
  
  // Detect arbitrage opportunities whenever price data changes
  useEffect(() => {
    // Only run if we have enough data (at least 2 exchanges with data)
    if (priceData.length < 2) return;
    
    // Group by pairs to see if we have multiple exchanges with the same pair
    const pairsWithMultipleExchanges = priceData.reduce((acc, data) => {
      acc[data.pair] = (acc[data.pair] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Filter pairs that have data from at least 2 exchanges
    const validPairs = Object.entries(pairsWithMultipleExchanges)
      .filter(([_, count]) => count >= 2)
      .map(([pair]) => pair);
    
    if (validPairs.length === 0) return;
    
    // Detect opportunities
    const newArbitrageOpportunities = [];
    
    for (const pair of validPairs) {
      // Get all price data for this pair
      const pairData = priceData.filter(data => data.pair === pair);
      
      // Compare prices between exchanges
      for (let i = 0; i < pairData.length; i++) {
        for (let j = i + 1; j < pairData.length; j++) {
          const exA = pairData[i];
          const exB = pairData[j];
          
          // Calculate spread
          const spread = Math.abs(exA.price - exB.price);
          const spreadPercent = (spread / Math.min(exA.price, exB.price)) * 100;
          
          // Only include significant spreads (> 1%)
          if (spreadPercent > 1.0) {
            const [buyExchange, sellExchange] = exA.price < exB.price 
              ? [exA, exB] 
              : [exB, exA];
            
            // Create mock networks for demo purposes
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
            ] as NetworkInfo[];
            
            // Choose best network (lowest fee)
            const bestNetwork = [...networks].sort((a, b) => a.fee - b.fee)[0];
            
            newArbitrageOpportunities.push({
              id: `${buyExchange.exchange}-${sellExchange.exchange}-${pair}`,
              fromExchange: buyExchange.exchange,
              toExchange: sellExchange.exchange,
              pair: pair,
              spreadAmount: spread,
              spreadPercent: spreadPercent,
              volume24h: Math.min(buyExchange.volume24h, sellExchange.volume24h),
              timestamp: new Date(),
              estimatedProfit: (spread * 100) / buyExchange.price, // Rough estimate
              fees: 10 + Math.random() * 20, // Mock fee
              netProfit: (spread * 100) / buyExchange.price - (10 + Math.random() * 20),
              networks,
              bestNetwork,
              feeDetails: {
                exchangeFees: 5 + Math.random() * 10,
                networkFees: bestNetwork.fee,
                otherFees: 2 + Math.random() * 5
              },
              fromExchangePrice: buyExchange.price,
              toExchangePrice: sellExchange.price
            });
          }
        }
      }
    }
    
    // Sort by spread percentage (highest first)
    newArbitrageOpportunities.sort((a, b) => b.spreadPercent - a.spreadPercent);
    
    // Update state with new opportunities
    setArbitrageOpportunities(newArbitrageOpportunities);
  }, [priceData]);
  
  // Context value
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

// Custom hook for consuming this context
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}
