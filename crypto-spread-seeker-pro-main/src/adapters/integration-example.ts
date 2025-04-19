/**
 * This file demonstrates how to integrate the Exchange Manager with the CryptoContext.
 * It's not meant to be used directly, but rather as a guide for updating the crypto-context.tsx file.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Exchange, 
  PriceData,
  ArbitrageOpportunity,
  TriangularOpportunity,
  FuturesOpportunity,
  ExchangeVolume
} from '../contexts/crypto-context';
import { exchangeManager, PriceUpdateEvent } from './index';

/**
 * Updated CryptoContextType to include real-time data functionality
 */
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
  // New methods for real-time data
  subscribeToSymbol: (symbol: string) => Promise<void>;
  unsubscribeFromSymbol: (symbol: string) => Promise<void>;
  getCommonSymbols: () => Promise<string[]>;
};

/**
 * Example implementation of the updated CryptoProvider
 */
export function CryptoProvider({ children }: { children: ReactNode }) {
  // Existing state
  const [isLoading, setIsLoading] = useState(true);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [triangularOpportunities, setTriangularOpportunities] = useState<TriangularOpportunity[]>([]);
  const [futuresOpportunities, setFuturesOpportunities] = useState<FuturesOpportunity[]>([]);
  const [exchangeVolumes, setExchangeVolumes] = useState<ExchangeVolume[]>([]);
  const [selectedPair, setSelectedPair] = useState('BTC-USDT');

  /**
   * Initialize exchange manager and set up real-time data
   */
  useEffect(() => {
    async function initializeExchanges() {
      try {
        setIsLoading(true);
        
        // Connect to all exchanges
        await exchangeManager.connectAll();
        
        // Get a list of available exchanges
        const adapters = exchangeManager.getAdapters();
        const availableExchanges = Array.from(adapters.keys());
        setExchanges(availableExchanges);
        
        // Register price update handler
        exchangeManager.onPriceUpdate(handlePriceUpdate);
        
        // Subscribe to default pair
        await exchangeManager.subscribeToSymbol(selectedPair);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize exchanges:', error);
        setIsLoading(false);
      }
    }
    
    initializeExchanges();
    
    // Clean up on unmount
    return () => {
      exchangeManager.disconnectAll();
    };
  }, []);
  
  /**
   * Handle price updates from the exchange manager
   */
  const handlePriceUpdate = (event: PriceUpdateEvent) => {
    // Update priceData
    setPriceData(prevData => {
      // Find if we already have data for this exchange and symbol
      const existingIndex = prevData.findIndex(
        item => item.exchange === event.exchange && item.pair === event.symbol
      );
      
      if (existingIndex >= 0) {
        // Update existing data
        const newData = [...prevData];
        newData[existingIndex] = {
          exchange: event.exchange,
          pair: event.symbol,
          price: (event.bid + event.ask) / 2, // Average of bid and ask for display
          volume24h: event.volume24h || newData[existingIndex].volume24h,
          priceChange24h: newData[existingIndex].priceChange24h, // Keep existing value until we have a better source
          priceChangePercent24h: newData[existingIndex].priceChangePercent24h, // Keep existing value
          high24h: Math.max(newData[existingIndex].high24h, event.ask), // Update if higher
          low24h: newData[existingIndex].low24h ? Math.min(newData[existingIndex].low24h, event.bid) : event.bid, // Update if lower
          lastUpdated: new Date(event.timestamp)
        };
        return newData;
      } else {
        // Add new data
        return [...prevData, {
          exchange: event.exchange,
          pair: event.symbol,
          price: (event.bid + event.ask) / 2, // Average of bid and ask for display
          volume24h: event.volume24h || 0,
          priceChange24h: 0, // Default until we have more data
          priceChangePercent24h: 0, // Default until we have more data
          high24h: event.ask,
          low24h: event.bid,
          lastUpdated: new Date(event.timestamp)
        }];
      }
    });
    
    // This would also trigger arbitrage opportunity detection logic
    detectArbitrageOpportunities();
  };
  
  /**
   * Detect arbitrage opportunities based on current price data
   */
  const detectArbitrageOpportunities = () => {
    // This is a placeholder for the arbitrage detection logic
    // In a real implementation, this would analyze the price data
    // and identify opportunities
    
    // For example, for cross-exchange arbitrage:
    const opportunities: ArbitrageOpportunity[] = [];
    
    const symbolGroups = priceData.reduce((groups, data) => {
      if (!groups[data.pair]) {
        groups[data.pair] = [];
      }
      groups[data.pair].push(data);
      return groups;
    }, {} as Record<string, PriceData[]>);
    
    // For each symbol, check price differences between exchanges
    Object.entries(symbolGroups).forEach(([pair, dataPoints]) => {
      if (dataPoints.length < 2) return; // Need at least 2 exchanges
      
      // Sort by price (lowest to highest)
      const sorted = [...dataPoints].sort((a, b) => a.price - b.price);
      
      // Check for opportunities between cheapest and most expensive
      for (let i = 0; i < sorted.length - 1; i++) {
        const cheapest = sorted[i];
        const mostExpensive = sorted[sorted.length - 1];
        
        const spreadPercent = ((mostExpensive.price - cheapest.price) / cheapest.price) * 100;
        
        // Only consider meaningful opportunities (e.g., > 0.5%)
        if (spreadPercent > 0.5) {
          opportunities.push({
            id: `arb-${cheapest.exchange}-${mostExpensive.exchange}-${pair}-${Date.now()}`,
            fromExchange: cheapest.exchange,
            toExchange: mostExpensive.exchange,
            pair,
            spreadAmount: mostExpensive.price - cheapest.price,
            spreadPercent,
            volume24h: Math.min(cheapest.volume24h, mostExpensive.volume24h),
            timestamp: new Date(),
            estimatedProfit: (mostExpensive.price - cheapest.price) * 1, // Assuming 1 unit trade
            fees: 0, // Simplified - would be calculated based on actual exchange fees
            netProfit: 0, // Will be calculated
            networks: [], // Simplified
            bestNetwork: undefined,
            feeDetails: {
              exchangeFees: 0,
              networkFees: 0,
              otherFees: 0
            }
          });
        }
      }
    });
    
    // Update state with new opportunities
    if (opportunities.length > 0) {
      setArbitrageOpportunities(prev => {
        const combined = [...prev, ...opportunities];
        // Keep only unique and recent opportunities
        return combined
          .filter((o, i, self) => 
            i === self.findIndex(t => t.id === o.id))
          .sort((a, b) => b.spreadPercent - a.spreadPercent)
          .slice(0, 50); // Limit to 50 opportunities
      });
    }
  };
  
  /**
   * Subscribe to price updates for a symbol
   */
  const subscribeToSymbol = async (symbol: string) => {
    try {
      await exchangeManager.subscribeToSymbol(symbol);
    } catch (error) {
      console.error(`Failed to subscribe to ${symbol}:`, error);
    }
  };
  
  /**
   * Unsubscribe from price updates for a symbol
   */
  const unsubscribeFromSymbol = async (symbol: string) => {
    try {
      await exchangeManager.unsubscribeFromSymbol(symbol);
    } catch (error) {
      console.error(`Failed to unsubscribe from ${symbol}:`, error);
    }
  };
  
  /**
   * Get common symbols supported by all exchanges
   */
  const getCommonSymbols = async () => {
    try {
      return await exchangeManager.getCommonSymbols();
    } catch (error) {
      console.error('Failed to get common symbols:', error);
      return [];
    }
  };
  
  /**
   * Refresh all data
   */
  const refreshData = () => {
    // For now, we just trigger a re-fetch of the current symbol
    if (selectedPair) {
      exchangeManager.subscribeToSymbol(selectedPair);
    }
  };
  
  const value = {
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
    // New methods
    subscribeToSymbol,
    unsubscribeFromSymbol,
    getCommonSymbols
  };
  
  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
}

// Create context with default values
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

/**
 * Hook to use the crypto context
 */
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
} 