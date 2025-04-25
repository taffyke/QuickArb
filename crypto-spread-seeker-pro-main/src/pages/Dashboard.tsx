import { useEffect, useState, useRef } from "react";
import { useCrypto } from "@/contexts/crypto-context";
import { ArbitrageOpportunityCard } from "@/components/arbitrage/arbitrage-opportunity-card";
import { MarketOverviewCard } from "@/components/dashboard/market-overview-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle,
  ArrowLeftRight, 
  BarChart3, 
  Bitcoin, 
  CheckCircle2,
  Clock,
  DollarSign, 
  ExternalLink,
  Filter,
  GitCompareArrows, 
  Globe,
  LineChart,
  ListFilter, 
  Percent, 
  RadioTower,
  RefreshCcw, 
  Search,
  Settings,
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Volume2, 
  Wallet,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { TradingViewEnhancedTicker } from "@/components/TradingViewEnhancedTicker";
import { MarketNewsDisplay } from "@/components/MarketNewsDisplay";
import { DirectTradingViewNews } from "@/components/DirectTradingViewNews";
import { MarqueeNewsTicker } from "@/components/MarqueeNewsTicker";
import TradingViewCryptoHeatmap from "@/components/TradingViewCryptoHeatmap";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    isLoading, 
    priceData, 
    arbitrageOpportunities, 
    exchangeVolumes, 
    refreshData,
    subscribeToSymbol 
  } = useCrypto();
  
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("cross-exchange");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [exchangeFilter, setExchangeFilter] = useState<string[]>([]);
  const [minSpreadFilter, setMinSpreadFilter] = useState(0.5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimeout = useRef<number | null>(null);
  const [minSpread, setMinSpread] = useState(0.5);
  
  // Subscribe to additional pairs on component mount
  useEffect(() => {
    const additionalPairs = [
      'SOL-USDT',
      'DOGE-USDT',
      'XRP-USDT'
    ];
    
    additionalPairs.forEach(pair => {
      subscribeToSymbol(pair);
    });
  }, [subscribeToSymbol]);
  
  // Calculate market overview metrics
  const btcData = priceData.find(item => item.pair === 'BTC/USDT' && item.exchange === 'Binance');
  const ethData = priceData.find(item => item.pair === 'ETH/USDT' && item.exchange === 'Coinbase');
  
  const totalVolume = exchangeVolumes.reduce((acc, item) => acc + item.volume24h, 0);
  
  // Calculate average price change - handle case when priceData is empty
  const avgChangePercent = priceData.length > 0 
    ? priceData.reduce((acc, item) => acc + item.priceChangePercent24h, 0) / priceData.length
    : 0;
    
  const totalOpportunities = arbitrageOpportunities.filter(opp => opp.spreadPercent >= 0.5).length;
  
  // Filter opportunities based on search query, active tab, and custom filters
  const filteredOpportunities = arbitrageOpportunities
    .filter(opportunity => {
      // Search query filter
      const matchesSearch = searchQuery
        ? opportunity.fromExchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opportunity.toExchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opportunity.pair.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      // Tab filter
      const matchesTab = 
        activeTab === "all" ? true :
        activeTab === "highSpread" ? opportunity.spreadPercent >= 2 :
        activeTab === "highVolume" ? opportunity.volume24h > 1000000 :
        activeTab === "lowRisk" ? opportunity.netProfit > 0 : true;
      
      // Minimum spread filter
      const matchesSpread = opportunity.spreadPercent >= minSpreadFilter;
      
      // Exchange filter
      const matchesExchange = exchangeFilter.length === 0 ? true : 
        exchangeFilter.includes(opportunity.fromExchange) || 
        exchangeFilter.includes(opportunity.toExchange);
        
      return matchesSearch && matchesTab && matchesSpread && matchesExchange;
    });
    
  // Set up auto-refresh interval
  useEffect(() => {
    // Auto-refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    // Clean up on unmount
    return () => clearInterval(refreshInterval);
  }, [refreshData]); // Add refreshData as dependency

  // Top arbitrage opportunities
  const topOpportunities = filteredOpportunities.slice(0, 5);

  // Trigger a refresh
  const handleRefresh = () => {
    refreshData();
    setLastRefreshed(new Date());
    setSuccessMessage("Data refreshed successfully");
    
    // Clear any existing timeout
    if (successTimeout.current) {
      window.clearTimeout(successTimeout.current);
    }
    
    // Clear success message after 3 seconds
    successTimeout.current = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  const navigateToSettings = () => {
    navigate("/settings");
  };
  
  const navigateToAllOpportunities = () => {
    navigate("/arbitrage");
  };
  
  const openProDialog = () => {
    // Navigate to billing section
    navigate("/settings");
    
    // Add a timeout to set the active tab to "billing" after navigation
    setTimeout(() => {
      // Dispatch an event to set the active tab in settings
      const event = new CustomEvent('set-settings-tab', { detail: 'billing' });
      window.dispatchEvent(event);
    }, 100);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeout.current) {
        window.clearTimeout(successTimeout.current);
      }
    };
  }, []);

  // Loading indicator for the full dashboard
  if (isLoading && priceData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Connecting to exchanges...</h2>
        <p className="text-muted-foreground">
          Loading real-time data from multiple cryptocurrency exchanges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10 relative">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      
      <div className="flex flex-col gap-3 bg-gradient-to-r from-blue-600/15 to-blue-500/5 p-4 rounded-lg border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GitCompareArrows className="h-6 w-6 text-blue-500" />
              ArbitrageScanner Pro
            </h1>
            <p className="text-muted-foreground">
              Your personal crypto arbitrage assistant - Real-time profit finder
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={navigateToSettings}
              className="gap-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* News Display */}
        <MarketNewsDisplay />
        
        {priceData.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>
            <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <GitCompareArrows className="h-3 w-3" />
              {totalOpportunities} arbitrage opportunities
            </div>
            <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <RadioTower className="h-3 w-3" />
              {priceData.length} price feeds
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card rounded-lg border p-3 gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1.5 px-3 py-1">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </Badge>
          
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1.5 px-3 py-1">
            <Globe className="h-3.5 w-3.5" />
            {exchangeVolumes.length} Exchanges Connected
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {minSpreadFilter > 0.5 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1.5 px-3 py-1">
              <Filter className="h-3.5 w-3.5" />
              Min Spread: {minSpreadFilter}%
            </Badge>
          )}
          
          <Select value={selectedMode} onValueChange={(value) => {
            setSelectedMode(value);
            setSuccessMessage(`Mode changed to ${value}`);
            
            // Add actual functionality for changing modes
            if (value === "cross-exchange") {
              navigate("/arbitrage/direct");
            } else if (value === "triangular") {
              navigate("/arbitrage/triangular");
            } else if (value === "futures") {
              navigate("/arbitrage/futures");
            } else if (value === "stablecoin") {
              navigate("/arbitrage/stablecoin");
            }
            
            if (successTimeout.current) window.clearTimeout(successTimeout.current);
            successTimeout.current = window.setTimeout(() => setSuccessMessage(null), 3000);
          }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cross-exchange">Cross-Exchange</SelectItem>
              <SelectItem value="triangular">Triangular</SelectItem>
              <SelectItem value="futures">Futures</SelectItem>
              <SelectItem value="stablecoin">Stablecoin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MarketOverviewCard
          title="Average Spread"
          value={`${(arbitrageOpportunities.reduce((acc, opp) => acc + opp.spreadPercent, 0) / (arbitrageOpportunities.length || 1)).toFixed(2)}%`}
          change={15.2}
          trend="up"
          isPercentage
          icon={<GitCompareArrows className="h-4 w-4 text-primary" />}
        />
        <MarketOverviewCard
          title="Best Profit Potential"
          value={`${(Math.max(...arbitrageOpportunities.map(opp => opp.spreadPercent), 0)).toFixed(2)}%`}
          change={8.4}
          trend="up"
          isPercentage
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <MarketOverviewCard
          title="Total 24h Volume"
          value={(totalVolume / 1000000000).toFixed(2) + "B"}
          change={5.3}
          trend="up"
          isVolume
          icon={<Volume2 className="h-4 w-4 text-primary" />}
        />
        <MarketOverviewCard
          title="Active Opportunities"
          value={totalOpportunities}
          change={12.5}
          trend="up"
          icon={<Sparkles className="h-4 w-4 text-primary" />}
        />
      </div>

      <Card className="border-blue-500/20 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
              <CardTitle>Live Arbitrage Scanner</CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pairs or exchanges"
                  className="pl-8 focus-visible:ring-blue-500/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 border-blue-500/20">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowFilterDialog(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Advanced Filters
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setMinSpreadFilter(0.5);
                      setSuccessMessage("Filter applied: Spread > 0.5%");
                      if (successTimeout.current) window.clearTimeout(successTimeout.current);
                      successTimeout.current = window.setTimeout(() => setSuccessMessage(null), 3000);
                    }}>
                      Spread &gt; 0.5%
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setMinSpreadFilter(1);
                      setSuccessMessage("Filter applied: Spread > 1%");
                      if (successTimeout.current) window.clearTimeout(successTimeout.current);
                      successTimeout.current = window.setTimeout(() => setSuccessMessage(null), 3000);
                    }}>
                      Spread &gt; 1%
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setMinSpreadFilter(2);
                      setSuccessMessage("Filter applied: Spread > 2%");
                      if (successTimeout.current) window.clearTimeout(successTimeout.current);
                      successTimeout.current = window.setTimeout(() => setSuccessMessage(null), 3000);
                    }}>
                      Spread &gt; 2%
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          
          // Add actual response when tabs are clicked
          if (value === "all") {
            setMinSpreadFilter(0.5);
          } else if (value === "highSpread") {
            setMinSpreadFilter(2);
          } else if (value === "highVolume") {
            // Apply high volume filter
            setMinSpreadFilter(0.5);
          } else if (value === "lowRisk") {
            // Apply Best ROI filter
            setMinSpreadFilter(1);
          }
        }}>
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-4 bg-blue-500/5">
              <TabsTrigger 
                value="all" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                All Opportunities
              </TabsTrigger>
              <TabsTrigger 
                value="highSpread" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                High Profit (2%+)
              </TabsTrigger>
              <TabsTrigger 
                value="highVolume" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                High Volume
              </TabsTrigger>
              <TabsTrigger 
                value="lowRisk" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Best ROI
              </TabsTrigger>
            </TabsList>
          </div>
        
          <CardContent className="pt-4 pb-2">
            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOpportunities.slice(0, 6).map((opportunity, index) => (
                  <ArbitrageOpportunityCard 
                    key={opportunity.id} 
                    opportunity={opportunity} 
                    rank={index + 1}
                    expanded={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No opportunities found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or refreshing the data
                </p>
              </div>
            )}
          </CardContent>
        </Tabs>
        
        <div className="flex justify-center p-4 border-t bg-gradient-to-r from-blue-600/5 to-transparent">
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={navigateToAllOpportunities}
          >
            <ExternalLink className="h-4 w-4" />
            View All {filteredOpportunities.length} Opportunities
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Crypto Market Heatmap</CardTitle>
            </div>
            <CardDescription>
              Live visualization of cryptocurrency performance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <TradingViewCryptoHeatmap 
              width="100%" 
              height={500} 
              colorTheme="light" 
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-blue-500/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-transparent pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle>Pro Scanner Features</CardTitle>
          </div>
          <CardDescription>
            Maximize your arbitrage profits with these professional tools
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <TrendingUp className="h-10 w-10 text-blue-500 p-2 border border-blue-500/30 bg-white/80 rounded-full mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">Real-time Scanner</div>
                <div className="text-xs text-muted-foreground">Get instant alerts when profitable arbitrage appears</div>
              </div>
            </div>
            
            <div className="flex items-center bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <ArrowLeftRight className="h-10 w-10 text-green-600 p-2 border border-green-500/30 bg-white/80 rounded-full mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">Auto Trading</div>
                <div className="text-xs text-muted-foreground">Execute trades automatically when conditions are perfect</div>
              </div>
            </div>
            
            <div className="flex items-center bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <Settings className="h-10 w-10 text-amber-500 p-2 border border-amber-400/30 bg-white/80 rounded-full mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">Advanced Settings</div>
                <div className="text-xs text-muted-foreground">Customize scanner parameters for your trading strategy</div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-center p-3 border-t bg-gradient-to-r from-blue-600/5 to-transparent">
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={openProDialog}
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      </Card>
      
      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Customize your arbitrage opportunity filters for better results
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Minimum Spread</h4>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  value={minSpreadFilter} 
                  onChange={(e) => setMinSpreadFilter(parseFloat(e.target.value))} 
                  step="0.1"
                  min="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Exchanges</h4>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-2">
                  {exchangeVolumes.map((exchange) => (
                    <div key={exchange.exchange} className="flex items-center space-x-2">
                      <Checkbox 
                        id={exchange.exchange}
                        checked={exchangeFilter.includes(exchange.exchange)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExchangeFilter([...exchangeFilter, exchange.exchange]);
                          } else {
                            setExchangeFilter(
                              exchangeFilter.filter((name) => name !== exchange.exchange)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={exchange.exchange} className="text-sm font-normal">
                        {exchange.exchange}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setExchangeFilter([]);
                setMinSpreadFilter(0.5);
              }}
            >
              Reset
            </Button>
            <Button 
              onClick={() => {
                setShowFilterDialog(false);
                setSuccessMessage("Filters applied successfully");
                
                if (successTimeout.current) {
                  window.clearTimeout(successTimeout.current);
                }
                
                successTimeout.current = window.setTimeout(() => {
                  setSuccessMessage(null);
                }, 3000);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show partial loading indicator when refreshing but already have data */}
      {isLoading && priceData.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-md border">
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing data...
        </div>
      )}
    </div>
  );
}
