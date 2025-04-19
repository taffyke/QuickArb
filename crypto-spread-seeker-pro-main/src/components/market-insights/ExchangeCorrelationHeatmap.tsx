import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// List of top exchanges
const exchanges = [
  "Binance", "Coinbase", "Kraken", "KuCoin", "OKX", "Bybit", "Huobi", "Gate.io"
];

// Generate correlation data between exchanges
const generateCorrelationData = () => {
  const data = [];
  
  for (let i = 0; i < exchanges.length; i++) {
    const row = [];
    for (let j = 0; j < exchanges.length; j++) {
      if (i === j) {
        // Perfect correlation with self
        row.push(1);
      } else if (data[j] && data[j][i] !== undefined) {
        // Use existing data for symmetry
        row.push(data[j][i]);
      } else {
        // Generate random correlation coefficient (higher values more likely)
        // Realistically, most exchanges correlate highly
        const baseCorrelation = 0.7; // Base correlation
        const random = Math.random() * 0.3; // Random factor
        row.push(parseFloat((baseCorrelation + random).toFixed(2)));
      }
    }
    data.push(row);
  }
  
  return data;
};

// Color function for correlation values
const getCorrelationColor = (value: number): string => {
  if (value >= 0.9) return "bg-crypto-green opacity-90";
  if (value >= 0.8) return "bg-crypto-green opacity-70";
  if (value >= 0.7) return "bg-crypto-blue opacity-80";
  if (value >= 0.6) return "bg-crypto-blue opacity-60";
  if (value >= 0.5) return "bg-crypto-yellow opacity-70";
  return "bg-crypto-red opacity-50";
};

export const ExchangeCorrelationHeatmap = () => {
  const [pairFilter, setPairFilter] = useState<string>("BTC/USDT");
  const [correlationData, setCorrelationData] = useState<number[][]>(generateCorrelationData());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Common trading pairs
  const tradingPairs = [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", 
    "XRP/USDT", "ADA/USDT", "DOGE/USDT", "All Pairs"
  ];
  
  // Refresh data
  const refreshData = () => {
    setCorrelationData(generateCorrelationData());
    setLastUpdated(new Date());
  };
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle pair filter change
  const handlePairChange = (value: string) => {
    setPairFilter(value);
    setCorrelationData(generateCorrelationData());
    setLastUpdated(new Date());
  };
  
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Exchange Correlation Heatmap</CardTitle>
          <CardDescription>
            Price correlation between major exchanges
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={pairFilter} onValueChange={handlePairChange}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue placeholder="BTC/USDT" />
            </SelectTrigger>
            <SelectContent>
              {tradingPairs.map(pair => (
                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  Higher correlation (green) indicates prices move together.
                  Lower correlation (red) may indicate arbitrage opportunities.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="h-8 gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row with exchange names */}
            <div className="grid grid-cols-9 mb-1">
              <div className="text-xs font-medium text-center"></div>
              {exchanges.map((exchange) => (
                <div key={exchange} className="text-xs font-medium text-center truncate px-1">
                  {exchange}
                </div>
              ))}
            </div>
            
            {/* Correlation grid */}
            {exchanges.map((exchange, i) => (
              <div key={exchange} className="grid grid-cols-9 mb-1">
                <div className="text-xs font-medium flex items-center justify-end pr-2 truncate">
                  {exchange}
                </div>
                {correlationData[i].map((value, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className={`text-xs text-center py-2 px-1 rounded ${getCorrelationColor(value)}`}
                    title={`${exchange} ↔ ${exchanges[j]}: ${value}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()} • Pair: {pairFilter}
        </div>
      </CardContent>
    </Card>
  );
};
