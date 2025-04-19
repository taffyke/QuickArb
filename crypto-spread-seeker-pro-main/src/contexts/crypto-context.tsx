import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for our context
export type Exchange = 
  | 'Binance'
  | 'Bitget'
  | 'Bybit'
  | 'KuCoin'
  | 'Gate.io'
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

// Mock data for now
const mockExchanges: Exchange[] = [
  'Binance', 'Bitget', 'Bybit', 'KuCoin', 'Gate.io', 
  'Bitfinex', 'Gemini', 'Coinbase', 'Kraken', 'Poloniex', 
  'OKX', 'AscendEX', 'Bittrue', 'HTX', 'MEXC'
];

const mockPriceData: PriceData[] = mockExchanges.map(exchange => ({
  exchange,
  pair: 'BTC/USDT',
  price: 38000 + Math.random() * 2000,
  volume24h: 1000000 + Math.random() * 9000000,
  priceChange24h: Math.random() * 1000 - 500,
  priceChangePercent24h: Math.random() * 10 - 5,
  high24h: 40000 + Math.random() * 1000,
  low24h: 37000 + Math.random() * 1000,
  lastUpdated: new Date()
}));

// Generate mock arbitrage opportunities
const mockArbitrageOpportunities: ArbitrageOpportunity[] = Array.from({ length: 15 }, (_, i) => {
  const fromExchange = mockExchanges[Math.floor(Math.random() * mockExchanges.length)];
  let toExchange;
  do {
    toExchange = mockExchanges[Math.floor(Math.random() * mockExchanges.length)];
  } while (fromExchange === toExchange);
  
  const spreadPercent = (Math.random() * 5) + 0.5;
  const volume = 500000 + Math.random() * 5000000;
  const estimatedProfit = volume * (spreadPercent / 100);
  
  // Create mock network info
  const networks = [
    {
      name: "Ethereum",
      fee: 5 + Math.random() * 15,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 5 + Math.floor(Math.random() * 20)
    },
    {
      name: "Binance Smart Chain",
      fee: 0.5 + Math.random() * 2,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 5)
    },
    {
      name: "Solana",
      fee: 0.01 + Math.random() * 0.05,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 2)
    }
  ];
  
  // Choose best network (lowest fee in this mock example)
  const bestNetwork = [...networks].sort((a, b) => a.fee - b.fee)[0];
  
  const exchangeFees = estimatedProfit * 0.1; // 10% exchange fees
  const networkFees = bestNetwork.fee;
  const otherFees = estimatedProfit * 0.05; // 5% slippage and other costs
  const totalFees = exchangeFees + networkFees + otherFees;
  
  return {
    id: `arb-${i}`,
    fromExchange,
    toExchange,
    pair: 'BTC/USDT',
    spreadAmount: 100 + Math.random() * 900,
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
    }
  };
}).sort((a, b) => b.spreadPercent - a.spreadPercent);

// Generate mock triangular opportunities
const mockTriangularOpportunities: TriangularOpportunity[] = Array.from({ length: 10 }, (_, i) => {
  const exchange = mockExchanges[Math.floor(Math.random() * mockExchanges.length)];
  const profitPercent = (Math.random() * 3) + 0.3;
  const estimatedProfit = 1000 + Math.random() * 9000;
  const fees = estimatedProfit * 0.2; // 20% fees for 3 trades
  
  // Create mock network info
  const networks = [
    {
      name: "Ethereum",
      fee: 5 + Math.random() * 15,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 5 + Math.floor(Math.random() * 20)
    },
    {
      name: "Binance Smart Chain",
      fee: 0.5 + Math.random() * 2,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 5)
    },
    {
      name: "Solana",
      fee: 0.01 + Math.random() * 0.05,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 2)
    }
  ];
  
  // Choose best network (lowest fee in this mock example)
  const bestNetwork = [...networks].sort((a, b) => a.fee - b.fee)[0];
  
  return {
    id: `tri-${i}`,
    exchange,
    firstPair: 'BTC/USDT',
    secondPair: 'ETH/BTC',
    thirdPair: 'ETH/USDT',
    profitPercent,
    timestamp: new Date(),
    path: 'USDT → BTC → ETH → USDT',
    estimatedProfit,
    fees,
    netProfit: estimatedProfit - fees,
    networks,
    bestNetwork
  };
}).sort((a, b) => b.profitPercent - a.profitPercent);

// Generate mock futures opportunities
const mockFuturesOpportunities: FuturesOpportunity[] = Array.from({ length: 12 }, (_, i) => {
  const exchange = mockExchanges[Math.floor(Math.random() * mockExchanges.length)];
  const fundingRate = (Math.random() * 0.2) - 0.1; // Between -0.1% and 0.1%
  const spotPrice = 38000 + Math.random() * 2000;
  const futuresPrice = spotPrice * (1 + (Math.random() * 0.02 - 0.01)); // +/- 1%
  const spreadPercent = ((futuresPrice - spotPrice) / spotPrice) * 100;
  const estimatedProfit = Math.abs(spreadPercent) * 100 + Math.random() * 900;
  const fees = estimatedProfit * 0.1; // 10% fees
  
  // Create mock network info
  const networks = [
    {
      name: "Ethereum",
      fee: 5 + Math.random() * 15,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 5 + Math.floor(Math.random() * 20)
    },
    {
      name: "Binance Smart Chain",
      fee: 0.5 + Math.random() * 2,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 5)
    },
    {
      name: "Solana",
      fee: 0.01 + Math.random() * 0.05,
      speed: ["Fast", "Medium", "Slow"][Math.floor(Math.random() * 3)],
      congestion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      estimatedTimeMinutes: 1 + Math.floor(Math.random() * 2)
    }
  ];
  
  // Choose best network (lowest fee in this mock example)
  const bestNetwork = [...networks].sort((a, b) => a.fee - b.fee)[0];
  
  return {
    id: `fut-${i}`,
    exchange,
    pair: 'BTC/USDT',
    fundingRate,
    fundingInterval: '8h',
    spotPrice,
    futuresPrice,
    spreadPercent,
    timestamp: new Date(),
    estimatedProfit,
    fees,
    netProfit: estimatedProfit - fees,
    networks,
    bestNetwork
  };
}).sort((a, b) => Math.abs(b.spreadPercent) - Math.abs(a.spreadPercent));

// Generate mock exchange volumes
const mockExchangeVolumes: ExchangeVolume[] = mockExchanges.map(exchange => ({
  exchange,
  volume24h: 10000000 + Math.random() * 90000000,
  change24h: Math.random() * 20 - 10,
  pairCount: 100 + Math.floor(Math.random() * 900)
})).sort((a, b) => b.volume24h - a.volume24h);

// Context type
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
};

// Create the context
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// Context provider component
export function CryptoProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [exchanges] = useState<Exchange[]>(mockExchanges);
  const [priceData, setPriceData] = useState<PriceData[]>(mockPriceData);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>(mockArbitrageOpportunities);
  const [triangularOpportunities, setTriangularOpportunities] = useState<TriangularOpportunity[]>(mockTriangularOpportunities);
  const [futuresOpportunities, setFuturesOpportunities] = useState<FuturesOpportunity[]>(mockFuturesOpportunities);
  const [exchangeVolumes, setExchangeVolumes] = useState<ExchangeVolume[]>(mockExchangeVolumes);
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');

  // Simulating WebSocket data updates
  useEffect(() => {
    const initialLoad = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update price data
      setPriceData(prev => 
        prev.map(item => ({
          ...item,
          price: item.price * (1 + (Math.random() * 0.01 - 0.005)), // +/- 0.5%
          lastUpdated: new Date()
        }))
      );

      // Update arbitrage opportunities
      setArbitrageOpportunities(prev => {
        const updated = prev.map(opp => ({
          ...opp,
          spreadPercent: opp.spreadPercent * (1 + (Math.random() * 0.1 - 0.05)), // +/- 5%
          timestamp: new Date()
        }));
        return updated.sort((a, b) => b.spreadPercent - a.spreadPercent);
      });

      // Update triangular opportunities
      setTriangularOpportunities(prev => {
        const updated = prev.map(opp => ({
          ...opp,
          profitPercent: opp.profitPercent * (1 + (Math.random() * 0.1 - 0.05)), // +/- 5%
          timestamp: new Date()
        }));
        return updated.sort((a, b) => b.profitPercent - a.profitPercent);
      });

      // Update futures opportunities
      setFuturesOpportunities(prev => {
        const updated = prev.map(opp => ({
          ...opp,
          fundingRate: opp.fundingRate * (1 + (Math.random() * 0.2 - 0.1)), // +/- 10%
          spotPrice: opp.spotPrice * (1 + (Math.random() * 0.01 - 0.005)), // +/- 0.5%
          futuresPrice: opp.futuresPrice * (1 + (Math.random() * 0.01 - 0.005)), // +/- 0.5%
          timestamp: new Date()
        }));
        return updated.sort((a, b) => Math.abs(b.spreadPercent) - Math.abs(a.spreadPercent));
      });

      // Update exchange volumes
      setExchangeVolumes(prev => {
        const updated = prev.map(vol => ({
          ...vol,
          volume24h: vol.volume24h * (1 + (Math.random() * 0.02 - 0.01)), // +/- 1%
          change24h: vol.change24h + (Math.random() * 2 - 1) // +/- 1%
        }));
        return updated.sort((a, b) => b.volume24h - a.volume24h);
      });
    }, 2000); // Update every 2 seconds

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  // Manual refresh function
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPriceData(mockPriceData.map(item => ({
        ...item,
        price: 38000 + Math.random() * 2000,
        lastUpdated: new Date()
      })));
      setIsLoading(false);
    }, 800);
  };

  return (
    <CryptoContext.Provider
      value={{
        isLoading,
        exchanges,
        priceData,
        arbitrageOpportunities,
        triangularOpportunities,
        futuresOpportunities,
        exchangeVolumes,
        selectedPair,
        setSelectedPair,
        refreshData
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

// Hook for using the crypto context
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}
