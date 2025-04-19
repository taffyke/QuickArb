import { useState, useEffect } from "react";
import { MarketAnalysisHub } from "@/components/market/market-analysis-hub";
import { ExchangeComparison } from "@/components/market/exchange-comparison";
import { ArbitrageInsights } from "@/components/market/arbitrage-insights";
import { FundingRatesDashboard } from "@/components/market/funding-rates-dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BellDot,
  BarChart4,
  LineChart,
  RefreshCw,
  ArrowRightLeft,
  Percent,
  DollarSign,
  TrendingUp,
  Landmark,
  Network
} from "lucide-react";

export default function MarketAnalysisPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Simulate data refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };
  
  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Market Analysis
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
              Live Data
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Comprehensive market data and arbitrage analysis across 40+ exchanges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground flex items-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart4 className="h-4 w-4" />
            <span className="hidden sm:inline">Market Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-1">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Exchange Comparison</span>
            <span className="sm:hidden">Exchanges</span>
          </TabsTrigger>
          <TabsTrigger value="arbitrage" className="flex items-center gap-1">
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Arbitrage Analytics</span>
            <span className="sm:hidden">Arbitrage</span>
          </TabsTrigger>
          <TabsTrigger value="funding" className="flex items-center gap-1">
            <Percent className="h-4 w-4" />
            <span className="hidden sm:inline">Funding Rates</span>
            <span className="sm:hidden">Funding</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-1">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Network Analytics</span>
            <span className="sm:hidden">Networks</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <MarketAnalysisHub lastUpdated={lastUpdated} />
        </TabsContent>
        
        <TabsContent value="exchanges" className="mt-0">
          <ExchangeComparison lastUpdated={lastUpdated} />
        </TabsContent>
        
        <TabsContent value="arbitrage" className="mt-0">
          <ArbitrageInsights lastUpdated={lastUpdated} />
        </TabsContent>
        
        <TabsContent value="funding" className="mt-0">
          <FundingRatesDashboard lastUpdated={lastUpdated} />
        </TabsContent>
        
        <TabsContent value="network" className="mt-0">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Network className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Network Analytics</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Detailed blockchain network analytics coming soon. This feature will provide real-time data on gas fees, transaction speeds, and cross-chain opportunities.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
