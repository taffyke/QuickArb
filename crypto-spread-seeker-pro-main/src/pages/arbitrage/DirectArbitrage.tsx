import { useState, useEffect, useMemo } from "react";
import { 
  ArbitrageOpportunity, 
  Exchange, 
  useCrypto 
} from "@/contexts/crypto-context";
import { ArbitrageOpportunityCard } from "@/components/arbitrage/arbitrage-opportunity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowDownUp, 
  Bell, 
  Filter, 
  LayoutGrid, 
  List, 
  RefreshCcw, 
  Search, 
  SlidersHorizontal, 
  SortAsc, 
  SortDesc,
  ChevronDown,
  TrendingUp,
  LineChart,
  Milestone,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock data for development since imported module is not available
const mockArbitrageOpportunities: ArbitrageOpportunity[] = Array.from({ length: 15 }, (_, i) => {
  const mockExchanges: Exchange[] = [
    'Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bitfinex', 
    'Huobi', 'FTX', 'Bybit', 'OKX', 'Gemini'
  ];
  
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

export default function DirectArbitrage() {
  const { isLoading, arbitrageOpportunities, exchanges, refreshData } = useCrypto();
  const { theme } = useTheme();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter and sorting state
  const [filteredOpportunities, setFilteredOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSpread, setMinSpread] = useState(0.5);
  const [sortBy, setSortBy] = useState<"spreadPercent" | "volume24h" | "timestamp">("spreadPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFromExchange, setSelectedFromExchange] = useState<Exchange | "all">("all");
  const [selectedToExchange, setSelectedToExchange] = useState<Exchange | "all">("all");
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [minProfit, setMinProfit] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showProfitEstimates, setShowProfitEstimates] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Handle alert setup
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    condition: "above",
    value: minSpread,
    asset: "BTC/USDT",
    notifyVia: ["app"]
  });

  // Fetch opportunities
  useEffect(() => {
    // Simulate API call
    const fetchOpportunities = () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setFilteredOpportunities(mockArbitrageOpportunities);
        setLastRefreshed(new Date());
        setLoading(false);
      }, 800);
    };

    fetchOpportunities();
  }, []);

  // Handle filtering and searching changes
  useEffect(() => {
    // Apply min spread filter
    let filtered = [...arbitrageOpportunities];
    
    if (filtered.length === 0) {
      // Use local mock data if no opportunities available from context
      filtered = [...mockArbitrageOpportunities];
    }
    
    filtered = filtered.filter(opp => opp.spreadPercent >= minSpread);
    
    // Apply exchange filters
    if (selectedFromExchange !== "all") {
      filtered = filtered.filter(opp => opp.fromExchange === selectedFromExchange);
    }
    
    if (selectedToExchange !== "all") {
      filtered = filtered.filter(opp => opp.toExchange === selectedToExchange);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp => 
          opp.pair.toLowerCase().includes(query) ||
          opp.fromExchange.toLowerCase().includes(query) ||
          opp.toExchange.toLowerCase().includes(query)
      );
    }
    
    // Apply profit filter based on investment amount
    if (minProfit > 0) {
      filtered = filtered.filter((opportunity) => {
        const potentialProfit = (opportunity.spreadPercent / 100) * investmentAmount - opportunity.fees;
        return potentialProfit >= minProfit;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      
      if (sortBy === "spreadPercent") {
        return (a.spreadPercent - b.spreadPercent) * factor;
      }
      
      if (sortBy === "volume24h") {
        return (a.volume24h - b.volume24h) * factor;
      }
      
      // sort by timestamp (newest first by default)
      return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * factor;
    });
    
    setFilteredOpportunities(filtered);
  }, [
    arbitrageOpportunities, 
    searchQuery, 
    minSpread, 
    sortBy, 
    sortOrder, 
    selectedFromExchange, 
    selectedToExchange,
    investmentAmount,
    minProfit
  ]);

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
    setLastRefreshed(new Date());
  };

  // Toggle expanded opportunity
  const toggleExpandOpportunity = (id: string) => {
    setExpandedOpportunity(prev => prev === id ? null : id);
  };

  // Calculate estimated profit based on investment amount
  const calculateEstimatedProfit = (opportunity: ArbitrageOpportunity) => {
    const grossProfit = (opportunity.spreadPercent / 100) * investmentAmount;
    const netProfit = grossProfit - opportunity.fees;
    return {
      gross: grossProfit,
      net: netProfit,
      roi: (netProfit / investmentAmount) * 100
    };
  };

  // Extract unique exchanges and trading pairs for filters
  const availableExchanges = useMemo(() => {
    const exchanges = new Set<string>();
    arbitrageOpportunities.forEach((opp) => {
      exchanges.add(opp.fromExchange);
      exchanges.add(opp.toExchange);
    });
    return Array.from(exchanges).sort();
  }, [arbitrageOpportunities]);

  const availablePairs = useMemo(() => {
    const pairs = new Set<string>();
    arbitrageOpportunities.forEach((opp) => {
      pairs.add(opp.pair);
    });
    return Array.from(pairs).sort();
  }, [arbitrageOpportunities]);

  // Filter and sort opportunities
  const filteredOpportunitiesWithProfitEstimates = useMemo(() => {
    return filteredOpportunities.map(opp => {
      // Calculate gross and net profit based on investment amount
      const grossProfit = (opp.spreadPercent / 100) * investmentAmount;
      
      // Estimate total fees as a percentage of the investment
      const totalFeePercentage = (opp.fees / opp.spreadAmount) * 100;
      const feesOnInvestment = (totalFeePercentage / 100) * investmentAmount;
      
      // Calculate net profit after fees
      const netProfit = grossProfit - feesOnInvestment;
      
      // Calculate ROI percentage
      const roi = (netProfit / investmentAmount) * 100;
      
      return {
        ...opp,
        profitEstimate: {
          gross: grossProfit,
          net: netProfit,
          roi: roi
        }
      };
    });
  }, [filteredOpportunities, investmentAmount]);

  // Handle advanced filters toggle
  const handleAdvancedFiltersToggle = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle alert setup
  const handleSetAlert = () => {
    setShowAlertDialog(true);
  };

  const createAlert = () => {
    // In a real app, this would send the alert to a backend
    toast({
      title: "Alert Created",
      description: `You'll be notified when spread is ${alertSettings.condition} ${alertSettings.value}% for ${alertSettings.asset}`,
    });
    setShowAlertDialog(false);
  };
  
  // Handle executing trade via arbitrage bot
  const executeViaArbitrageBot = (opportunity: ArbitrageOpportunity) => {
    // Save the selected opportunity to local storage to pass to the ArbitrageBot
    localStorage.setItem('selectedArbitrageOpportunity', JSON.stringify(opportunity));
    
    // Navigate to arbitrage bot page
    navigate('/arbitrage-bot');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Direct Arbitrage</h1>
          <p className="text-muted-foreground">
            Monitor cross-exchange price differences in real-time
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleSetAlert}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Arbitrage Opportunities</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode("grid")}
                  className={cn(viewMode === "grid" ? "bg-muted" : "")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode("list")}
                  className={cn(viewMode === "list" ? "bg-muted" : "")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pairs or exchanges..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spreadPercent">Spread %</SelectItem>
                  <SelectItem value="volume24h">Volume (24h)</SelectItem>
                  <SelectItem value="timestamp">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOpportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ArrowDownUp className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No matching opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or refresh the data
                </p>
              </div>
            ) : (
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" 
                  : "space-y-4"
              )}>
                {filteredOpportunitiesWithProfitEstimates.map((opportunity, index) => (
                  <div 
                    key={opportunity.id} 
                    onClick={() => toggleExpandOpportunity(opportunity.id)}
                    className="cursor-pointer"
                  >
                    <ArbitrageOpportunityCard 
                      opportunity={opportunity} 
                      rank={index + 1}
                      expanded={expandedOpportunity === opportunity.id}
                      investmentAmount={investmentAmount}
                      profitEstimate={showProfitEstimates ? opportunity.profitEstimate : undefined}
                      onExecute={executeViaArbitrageBot}
                    />
                  </div>
                ))}
              </div>
            )}
            {filteredOpportunities.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {filteredOpportunities.length} of {arbitrageOpportunities.length} opportunities
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>Refine arbitrage opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Minimum Spread</label>
                <span className="text-sm font-mono">{minSpread.toFixed(1)}%</span>
              </div>
              <Slider
                value={[minSpread]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={(values) => setMinSpread(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>5%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Exchange</label>
              <Select 
                value={selectedFromExchange.toString()} 
                onValueChange={(value) => setSelectedFromExchange(value as Exchange | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All exchanges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {exchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Exchange</label>
              <Select 
                value={selectedToExchange.toString()} 
                onValueChange={(value) => setSelectedToExchange(value as Exchange | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All exchanges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {exchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Amount ($)</label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Profit ($)</label>
              <Input
                type="number"
                value={minProfit}
                onChange={(e) => setMinProfit(Number(e.target.value))}
                min="0"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={handleAdvancedFiltersToggle}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>More Filters</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full gap-2"
                onClick={handleSetAlert}
              >
                <Bell className="h-4 w-4" />
                <span>Set Alert</span>
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="space-y-4 pt-2">
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trading Pair</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All pairs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pairs</SelectItem>
                      {availablePairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Volume (24h)</label>
                  <Input type="number" placeholder="Min volume in USD" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <div>
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </div>
          <div>
            Data refresh rate: 2 seconds
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Price Alert</DialogTitle>
            <DialogDescription>
              Get notified when arbitrage opportunities match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Trading Pair</Label>
              <Input 
                id="asset" 
                value={alertSettings.asset} 
                onChange={(e) => setAlertSettings({...alertSettings, asset: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <Select 
                value={alertSettings.condition}
                onValueChange={(value) => setAlertSettings({...alertSettings, condition: value})}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Spread Above</SelectItem>
                  <SelectItem value="below">Spread Below</SelectItem>
                  <SelectItem value="crosses_above">Crosses Above</SelectItem>
                  <SelectItem value="crosses_below">Crosses Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value (%)</Label>
              <Input 
                id="value" 
                type="number" 
                value={alertSettings.value} 
                onChange={(e) => setAlertSettings({...alertSettings, value: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notify via</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="app" 
                  checked={alertSettings.notifyVia.includes("app")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAlertSettings({...alertSettings, notifyVia: [...alertSettings.notifyVia, "app"]})
                    } else {
                      setAlertSettings({...alertSettings, notifyVia: alertSettings.notifyVia.filter(n => n !== "app")})
                    }
                  }}
                />
                <Label htmlFor="app">App Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email" 
                  checked={alertSettings.notifyVia.includes("email")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAlertSettings({...alertSettings, notifyVia: [...alertSettings.notifyVia, "email"]})
                    } else {
                      setAlertSettings({...alertSettings, notifyVia: alertSettings.notifyVia.filter(n => n !== "email")})
                    }
                  }}
                />
                <Label htmlFor="email">Email</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button onClick={createAlert}>Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
