import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './supabase-context';
import { ArbitrageService, ArbitrageOpportunity, ArbitrageType } from '@/services/ArbitrageService';

// Define the context type
type ArbitrageContextType = {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  availableExchanges: string[];
  availableArbitrageTypes: ArbitrageType[];
  opportunities: ArbitrageOpportunity[];
  refreshOpportunities: (minProfitPercentage?: number) => Promise<void>;
  executeArbitrage: (opportunityId: string) => Promise<boolean>;
};

// Create the context
const ArbitrageContext = createContext<ArbitrageContextType | undefined>(undefined);

// Provider component
export const ArbitrageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, supabase } = useSupabase();
  const [arbitrageService, setArbitrageService] = useState<ArbitrageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExchanges, setAvailableExchanges] = useState<string[]>([]);
  const [availableArbitrageTypes, setAvailableArbitrageTypes] = useState<ArbitrageType[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);

  // Initialize arbitrage service when user changes
  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!user) {
          setArbitrageService(null);
          setIsInitialized(false);
          return;
        }

        const service = new ArbitrageService(user.id, supabase);
        const initialized = await service.initialize();
        
        if (initialized) {
          setArbitrageService(service);
          setAvailableExchanges([...service['availableExchanges']]);
          setAvailableArbitrageTypes(service.getAvailableArbitrageTypes());
          setIsInitialized(true);
          setError(null);
        } else {
          setError('Failed to initialize arbitrage service. Please check your API keys.');
        }
      } catch (err) {
        console.error('Error initializing arbitrage service:', err);
        setError('An error occurred while initializing the arbitrage service.');
      }
    };

    initializeService();
  }, [user, supabase]);

  // Function to refresh arbitrage opportunities
  const refreshOpportunities = async (minProfitPercentage = 0.5) => {
    if (!arbitrageService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const opps = await arbitrageService.getAllArbitrageOpportunities(minProfitPercentage);
      setOpportunities(opps);
    } catch (err) {
      console.error('Error refreshing opportunities:', err);
      setError('Failed to refresh arbitrage opportunities.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to execute an arbitrage opportunity
  const executeArbitrage = async (opportunityId: string): Promise<boolean> => {
    if (!arbitrageService) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await arbitrageService.executeArbitrage(opportunityId);
      
      if (result.success) {
        // Update the opportunities list (in a real app, you'd update the specific opportunity)
        await refreshOpportunities();
        return true;
      } else {
        setError(`Failed to execute arbitrage: ${result.message}`);
        return false;
      }
    } catch (err) {
      console.error('Error executing arbitrage:', err);
      setError('An error occurred while executing the arbitrage.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Value for the context provider
  const contextValue: ArbitrageContextType = {
    isInitialized,
    isLoading,
    error,
    availableExchanges,
    availableArbitrageTypes,
    opportunities,
    refreshOpportunities,
    executeArbitrage
  };

  return (
    <ArbitrageContext.Provider value={contextValue}>
      {children}
    </ArbitrageContext.Provider>
  );
};

// Hook to use the arbitrage context
export const useArbitrage = () => {
  const context = useContext(ArbitrageContext);
  
  if (context === undefined) {
    throw new Error('useArbitrage must be used within an ArbitrageProvider');
  }
  
  return context;
}; 