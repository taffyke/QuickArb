import { useState, useEffect } from "react";
import { 
  TriangularOpportunity, 
  Exchange, 
  useCrypto 
} from "@/contexts/crypto-context";
import { TriangularOpportunityCard } from "@/components/arbitrage/triangular-opportunity-card";
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
  Filter, 
  LayoutGrid, 
  List, 
  RefreshCcw, 
  Search, 
  SlidersHorizontal, 
  SortAsc, 
  SortDesc, 
  Triangle,
  ChevronDown,
  TrendingUp,
  DollarSign,
  ArrowDownUp,
  ExternalLink,
  LineChart
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

export default function TriangularArbitrage() {
  const { isLoading, triangularOpportunities, exchanges, refreshData } = useCrypto();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter and sorting state
  const [filteredOpportunities, setFilteredOpportunities] = useState<TriangularOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minProfit, setMinProfit] = useState(0.3);
  const [sortBy, setSortBy] = useState<"profitPercent" | "estimatedProfit" | "timestamp">("profitPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | "all">("all");
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [minProfitAmount, setMinProfitAmount] = useState<number>(0);
  const [showProfitEstimates, setShowProfitEstimates] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // Handle alert setup
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    condition: "above",
    value: minProfit,
    asset: "ETH/BTC/USDT",
    notifyVia: ["app"]
  });

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...triangularOpportunities];
    
    // Apply min profit filter
    filtered = filtered.filter(opp => opp.profitPercent >= minProfit);
    
    // Apply exchange filter
    if (selectedExchange !== "all") {
      filtered = filtered.filter(opp => opp.exchange === selectedExchange);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp => 
          opp.firstPair.toLowerCase().includes(query) ||
          opp.secondPair.toLowerCase().includes(query) ||
          opp.thirdPair.toLowerCase().includes(query) ||
          opp.exchange.toLowerCase().includes(query) ||
          opp.path.toLowerCase().includes(query)
      );
    }
    
    // Apply profit amount filter
    if (minProfitAmount > 0) {
      filtered = filtered.filter(opp => {
        const estimatedProfit = (opp.profitPercent / 100) * investmentAmount;
        return estimatedProfit >= minProfitAmount;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      
      if (sortBy === "profitPercent") {
        return (a.profitPercent - b.profitPercent) * factor;
      }
      
      if (sortBy === "estimatedProfit") {
        return (a.estimatedProfit - b.estimatedProfit) * factor;
      }
      
      // sort by timestamp (newest first by default)
      return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * factor;
    });
    
    setFilteredOpportunities(filtered);
  }, [
    triangularOpportunities, 
    searchQuery, 
    minProfit, 
    sortBy, 
    sortOrder, 
    selectedExchange,
    investmentAmount,
    minProfitAmount
  ]);

  // Calculate profit estimate based on investment amount
  const calculateProfitEstimate = (opportunity: TriangularOpportunity) => {
    const grossProfit = (opportunity.profitPercent / 100) * investmentAmount;
    const fees = grossProfit * 0.15; // assuming 15% in total fees
    const netProfit = grossProfit - fees;
    const roi = (netProfit / investmentAmount) * 100;
    
    return {
      grossProfit,
      fees,
      netProfit,
      roi
    };
  };

  // Enhance opportunities with profit estimates
  const opportunitiesWithProfitEstimates = filteredOpportunities.map(opportunity => ({
    ...opportunity,
    profitEstimate: calculateProfitEstimate(opportunity)
  }));

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
    refreshData();
    setLastRefreshed(new Date());
      setLoading(false);
      
      toast({
        title: "Data Refreshed",
        description: `Found ${filteredOpportunities.length} triangular arbitrage opportunities.`,
      });
    }, 800);
  };

  // Toggle expanded opportunity
  const toggleExpandOpportunity = (id: string) => {
    setExpandedOpportunity(prev => prev === id ? null : id);
  };

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
      description: `You'll be notified when profit is ${alertSettings.condition} ${alertSettings.value}% for ${alertSettings.asset}`,
    });
    setShowAlertDialog(false);
  };
  
  // Handle executing trade via arbitrage bot
  const executeViaArbitrageBot = (opportunity: TriangularOpportunity) => {
    // Save the selected opportunity to local storage to pass to the ArbitrageBot
    localStorage.setItem('selectedArbitrageOpportunity', JSON.stringify(opportunity));
    
    // Navigate to arbitrage bot page
    navigate('/arbitrage-bot');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Triangular Arbitrage</h1>
          <p className="text-muted-foreground">
            Identify profitable three-step trading patterns
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
            disabled={loading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Triangular Opportunities</CardTitle>
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
                  <SelectItem value="profitPercent">Profit %</SelectItem>
                  <SelectItem value="estimatedProfit">Est. Profit</SelectItem>
                  <SelectItem value="timestamp">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOpportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Triangle className="h-8 w-8 text-muted-foreground mb-4" />
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
                {opportunitiesWithProfitEstimates.map((opportunity, index) => (
                  <div 
                    key={opportunity.id} 
                    onClick={() => toggleExpandOpportunity(opportunity.id)}
                    className="cursor-pointer"
                  >
                    <TriangularOpportunityCard 
                      opportunity={opportunity} 
                      rank={index + 1}
                      expanded={expandedOpportunity === opportunity.id}
                      investmentAmount={investmentAmount}
                      profitEstimate={showProfitEstimates ? opportunity.profitEstimate : undefined}
                      onExecute={() => executeViaArbitrageBot(opportunity)}
                    />
                  </div>
                ))}
              </div>
            )}
            {filteredOpportunities.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {filteredOpportunities.length} of {triangularOpportunities.length} opportunities
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
                <label className="text-sm font-medium">Minimum Profit</label>
                <span className="text-sm font-mono">{minProfit.toFixed(1)}%</span>
              </div>
              <Slider
                value={[minProfit]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={(values) => setMinProfit(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>5%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange</label>
              <Select 
                value={selectedExchange.toString()} 
                onValueChange={(value) => setSelectedExchange(value as Exchange | "all")}
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
              />
              <div className="text-xs text-muted-foreground">
                For profit estimation purposes
              </div>
            </div>

            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleAdvancedFiltersToggle}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Min Profit Amount ($)</label>
                    <span className="text-sm font-mono">${minProfitAmount}</span>
                  </div>
                  <Slider
                    value={[minProfitAmount]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(values) => setMinProfitAmount(values[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$50</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showProfitEstimates" 
                    checked={showProfitEstimates} 
                    onCheckedChange={() => setShowProfitEstimates(!showProfitEstimates)}
                  />
                  <label htmlFor="showProfitEstimates" className="text-sm font-medium">
                    Show profit estimates
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Triangular Arbitrage Alert</DialogTitle>
            <DialogDescription>
              Get notified when triangular arbitrage opportunities match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Trading Path</Label>
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
                  <SelectItem value="above">Profit Above</SelectItem>
                  <SelectItem value="below">Profit Below</SelectItem>
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
