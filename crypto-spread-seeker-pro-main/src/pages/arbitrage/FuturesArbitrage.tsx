import { useState, useEffect, useMemo } from "react";
import { 
  FuturesOpportunity, 
  Exchange, 
  useCrypto 
} from "@/contexts/crypto-context";
import { FuturesOpportunityCard } from "@/components/arbitrage/futures-opportunity-card";
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
  Bell, 
  ChevronsUpDown, 
  Filter, 
  LayoutGrid, 
  List, 
  RefreshCcw, 
  Search, 
  SlidersHorizontal, 
  SortAsc, 
  SortDesc,
  TrendingUp,
  LineChart,
  Milestone,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Network,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Checkbox
} from "@/components/ui/checkbox";
import {
  Label
} from "@/components/ui/label";

export default function FuturesArbitrage() {
  const { isLoading, futuresOpportunities, exchanges, refreshData } = useCrypto();
  const { theme } = useTheme();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const navigate = useNavigate();
  
  // Filter and sorting state
  const [filteredOpportunities, setFilteredOpportunities] = useState<FuturesOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSpread, setMinSpread] = useState(0.2);
  const [sortBy, setSortBy] = useState<"spreadPercent" | "fundingRate" | "timestamp">("spreadPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | "all">("all");
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [minProfit, setMinProfit] = useState<number>(0);
  const [showProfitEstimates, setShowProfitEstimates] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // Handle alert setup
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    condition: "above",
    value: minSpread,
    asset: "",
    notifyVia: ["app"]
  });

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...futuresOpportunities];
    
    // Apply min spread filter
    filtered = filtered.filter(opp => Math.abs(opp.spreadPercent) >= minSpread);
    
    // Apply exchange filter
    if (selectedExchange !== "all") {
      filtered = filtered.filter(opp => opp.exchange === selectedExchange);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp => 
          opp.pair.toLowerCase().includes(query) ||
          opp.exchange.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (selectedTab === "premium") {
      filtered = filtered.filter(opp => opp.spreadPercent > 0);
    } else if (selectedTab === "discount") {
      filtered = filtered.filter(opp => opp.spreadPercent < 0);
    } else if (selectedTab === "funding") {
      filtered = filtered.filter(opp => Math.abs(opp.fundingRate) >= 0.0001);
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
        return (Math.abs(a.spreadPercent) - Math.abs(b.spreadPercent)) * factor;
      }
      
      if (sortBy === "fundingRate") {
        return (Math.abs(a.fundingRate) - Math.abs(b.fundingRate)) * factor;
      }
      
      // sort by timestamp (newest first by default)
      return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * factor;
    });
    
    setFilteredOpportunities(filtered);
  }, [
    futuresOpportunities, 
    searchQuery, 
    minSpread, 
    sortBy, 
    sortOrder, 
    selectedExchange,
    investmentAmount,
    minProfit,
    selectedTab
  ]);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      refreshData();
      setLastRefreshed(new Date());
      setLoading(false);
    }, 800);
  };

  // Toggle expanded opportunity
  const toggleExpandOpportunity = (id: string) => {
    setExpandedOpportunity(prev => prev === id ? null : id);
  };
  
  // Calculate estimated profit based on investment amount
  const calculateEstimatedProfit = (opportunity: FuturesOpportunity) => {
    const grossProfit = (opportunity.spreadPercent / 100) * investmentAmount;
    
    // Fee calculations
    const exchangeFees = grossProfit * 0.1; // Assuming 10% in exchange fees
    const networkFees = opportunity.bestNetwork ? opportunity.bestNetwork.fee : 0;
    const otherFees = grossProfit * 0.05; // 5% for slippage etc.
    
    const totalFees = exchangeFees + networkFees + otherFees;
    const netProfit = grossProfit - totalFees;
    
    const roi = (netProfit / investmentAmount) * 100;
    
    return {
      grossProfit,
      totalFees,
      netProfit,
      roi,
      feeBreakdown: {
        exchangeFees,
        networkFees,
        otherFees
      }
    };
  };

  // Handle advanced filters toggle
  const handleAdvancedFiltersToggle = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle alert setup
  const handleSetAlert = () => {
    setShowAlertDialog(true);
  };
  
  // Create alert
  const createAlert = () => {
    // In a real implementation, this would save the alert to a database
    setShowAlertDialog(false);
    
    // Show success toast
    alert(`Alert created for ${alertSettings.asset || 'all pairs'} when spread is ${alertSettings.condition} ${alertSettings.value}%`);
  };
  
  // Handle navigating to exchange
  const navigateToExchange = (exchange: string) => {
    // This would navigate to the exchange's website, but we'll just show an alert for the example
    window.open(`https://${exchange.toLowerCase()}.com`, '_blank');
  };
  
  // Handle executing trade via arbitrage bot
  const executeViaArbitrageBot = (opportunity: FuturesOpportunity) => {
    // Save the selected opportunity to local storage to pass to the ArbitrageBot
    localStorage.setItem('selectedArbitrageOpportunity', JSON.stringify(opportunity));
    
    // Navigate to arbitrage bot page
    navigate('/arbitrage-bot');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Futures Arbitrage</h1>
          <p className="text-muted-foreground">
            Spot-Futures price differences and funding rate opportunities
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-3.5 w-3.5" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleSetAlert}>
            <Bell className="h-3.5 w-3.5" />
            Alerts
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1", showAdvancedFilters && "border-primary text-primary")}
            onClick={handleAdvancedFiltersToggle}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
          
          <div className="border rounded-md flex">
            <Toggle 
              pressed={viewMode === "grid"} 
              onPressedChange={() => setViewMode("grid")}
              size="sm"
              className="h-8 px-2 rounded-none rounded-l-md"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle 
              pressed={viewMode === "list"} 
              onPressedChange={() => setViewMode("list")}
              size="sm"
              className="h-8 px-2 rounded-none rounded-r-md"
            >
              <List className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-3/4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by pair or exchange..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedExchange as string} onValueChange={(value) => setSelectedExchange(value as Exchange | "all")}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Exchange" />
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
              
              <div className="flex space-x-1 items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9" 
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spreadPercent">Spread %</SelectItem>
                    <SelectItem value="fundingRate">Funding Rate</SelectItem>
                    <SelectItem value="timestamp">Timestamp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="bg-card border rounded-md p-4 mt-4 space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="min-spread">Min. Spread: {minSpread}%</Label>
                </div>
                <div className="px-1">
                  <Slider 
                    id="min-spread"
                    defaultValue={[minSpread]} 
                    min={0} 
                    max={2} 
                    step={0.1} 
                    onValueChange={(value) => setMinSpread(value[0])}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="investment-amount">Investment Amount ($)</Label>
                  <Input 
                    id="investment-amount"
                    type="number" 
                    value={investmentAmount} 
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="min-profit">Min. Profit ($)</Label>
                  <Input 
                    id="min-profit"
                    type="number" 
                    value={minProfit} 
                    onChange={(e) => setMinProfit(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Opportunity tabs */}
          <div className="mt-4">
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="premium" className="flex-1">
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Premium <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500">{futuresOpportunities.filter(o => o.spreadPercent > 0).length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="discount" className="flex-1">
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Discount <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500">{futuresOpportunities.filter(o => o.spreadPercent < 0).length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="funding" className="flex-1">
                  <Percent className="h-4 w-4 mr-2" />
                  Funding <Badge variant="outline" className="ml-2 bg-purple-500/10 text-purple-500">{futuresOpportunities.filter(o => Math.abs(o.fundingRate) >= 0.0001).length}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Opportunities */}
          <div className={cn(
            "mt-4 grid gap-4",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
          )}>
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opportunity) => (
                <div 
                  key={`${opportunity.exchange}-${opportunity.pair}-${opportunity.timestamp.getTime()}`}
                  onClick={() => toggleExpandOpportunity(`${opportunity.exchange}-${opportunity.pair}-${opportunity.timestamp.getTime()}`)}
                  className="cursor-pointer"
                >
                  <FuturesOpportunityCard 
                    opportunity={opportunity}
                    expanded={expandedOpportunity === `${opportunity.exchange}-${opportunity.pair}-${opportunity.timestamp.getTime()}`}
                    onExecute={executeViaArbitrageBot}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <ChevronsUpDown className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No opportunities found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Try adjusting your filters or refreshing to find futures arbitrage opportunities.
                </p>
                <Button className="mt-4" onClick={handleRefresh}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="md:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Last Updated</div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{lastRefreshed.toLocaleTimeString()}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">Total Opportunities</div>
                  <div className="text-2xl font-bold">{filteredOpportunities.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Top Spread</div>
                  <div className="text-2xl font-bold">
                    {filteredOpportunities.length > 0 
                      ? `${Math.abs(filteredOpportunities[0].spreadPercent).toFixed(2)}%` 
                      : '0.00%'}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-xs text-muted-foreground mb-2">Top Exchanges</div>
                <div className="space-y-2">
                  {exchanges.slice(0, 3).map((exchange) => (
                    <div key={exchange} className="flex justify-between items-center">
                      <span>{exchange}</span>
                      <Badge variant="outline">{
                        filteredOpportunities.filter(o => o.exchange === exchange).length
                      }</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">What is Futures Arbitrage?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Futures arbitrage capitalizes on price differences between spot and
                futures markets for the same asset.
              </p>
              <p>
                Traders can also profit from funding rates, which are periodic payments 
                between long and short position holders.
              </p>
              <p className="text-xs text-muted-foreground">
                Always consider fees, liquidation risks, and market volatility when
                executing futures arbitrage strategies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Futures Arbitrage Alert</DialogTitle>
            <DialogDescription>
              Get notified when new futures arbitrage opportunities match your criteria.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="alert-condition" className="text-right">
                Alert me when
              </Label>
              <div className="col-span-2 flex space-x-2">
                <Select
                  value={alertSettings.condition}
                  onValueChange={(value) => setAlertSettings({...alertSettings, condition: value})}
                >
                  <SelectTrigger id="alert-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="equal">Equal to</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  value={alertSettings.value}
                  onChange={(e) => setAlertSettings({...alertSettings, value: parseFloat(e.target.value)})}
                  step={0.1}
                  min={0}
                />
                <span className="flex items-center">%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="alert-asset" className="text-right">
                For pair
              </Label>
              <Input
                id="alert-asset"
                className="col-span-2"
                placeholder="e.g. BTC/USDT (leave empty for all)"
                value={alertSettings.asset}
                onChange={(e) => setAlertSettings({...alertSettings, asset: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right">
                Notify via
              </Label>
              <div className="col-span-2 flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-app" 
                    checked={alertSettings.notifyVia.includes('app')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAlertSettings({
                          ...alertSettings, 
                          notifyVia: [...alertSettings.notifyVia, 'app']
                        });
                      } else {
                        setAlertSettings({
                          ...alertSettings, 
                          notifyVia: alertSettings.notifyVia.filter(v => v !== 'app')
                        });
                      }
                    }}
                  />
                  <label htmlFor="notify-app">In-app notification</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-email" 
                    checked={alertSettings.notifyVia.includes('email')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAlertSettings({
                          ...alertSettings, 
                          notifyVia: [...alertSettings.notifyVia, 'email']
                        });
                      } else {
                        setAlertSettings({
                          ...alertSettings, 
                          notifyVia: alertSettings.notifyVia.filter(v => v !== 'email')
                        });
                      }
                    }}
                  />
                  <label htmlFor="notify-email">Email</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createAlert}>
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
