import { useState, useEffect } from "react";
import { 
  ArbitrageOpportunity, 
  Exchange, 
  useCrypto,
  NetworkInfo
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
  CardFooter
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
  DollarSign,
  Clock,
  ChevronRight,
  Coins,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define stablecoin types
type StablecoinType = 'USD-backed' | 'Crypto-backed' | 'Algorithmic' | 'Commodity-backed';

// Extend the ArbitrageOpportunity type for stablecoins
interface StablecoinArbitrageOpportunity extends Omit<ArbitrageOpportunity, 'networks' | 'feeDetails'> {
  stablecoinType: StablecoinType;
  pegDeviation: number;
  riskScore: number; // 1-10 scale
  networks: NetworkInfo[];
  feeDetails: {
    exchangeFees: number;
    networkFees: number;
    otherFees: number;
  };
  fromExchangePrice: number;
  toExchangePrice: number;
}

// Stablecoin Opportunity Card Component with Price Display
const StablecoinOpportunityCard = ({ 
  opportunity, 
  profitEstimate, 
  onExecute 
}: { 
  opportunity: StablecoinArbitrageOpportunity;
  profitEstimate: any;
  onExecute: (opportunity: StablecoinArbitrageOpportunity) => void;
}) => {
  // Format timestamp
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Today';
  };

  // Get risk label
  const getRiskLabel = (score: number) => {
    if (score <= 2) return "Low";
    if (score <= 5) return "Medium";
    return "High";
  };

  // Get risk color
  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-green-500";
    if (score <= 5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className={cn(
      "opportunity-card transition-all",
      opportunity.spreadPercent >= 1.0 ? "bg-success/5 dark:bg-success/10" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Coins className="mr-1.5 h-4 w-4 text-blue-500" />
            {opportunity.fromExchange} → {opportunity.toExchange}
          </CardTitle>
          <Badge variant={opportunity.spreadPercent >= 1.0 ? "default" : "outline"}>
            {opportunity.spreadPercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="font-medium">{opportunity.pair}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTimeAgo(opportunity.timestamp)}</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-muted/50 rounded-md p-2 mt-2">
          <h4 className="text-xs font-medium mb-1.5">Current Prices</h4>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="flex justify-between">
              <span>{opportunity.fromExchange} Price:</span>
              <span className="font-mono">${opportunity.fromExchangePrice?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>{opportunity.toExchange} Price:</span>
              <span className="font-mono">${opportunity.toExchangePrice?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Spread:</span>
              <span className="font-mono text-green-500">
                ${opportunity.spreadAmount.toFixed(4)} ({opportunity.spreadPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div className="font-medium">{opportunity.stablecoinType}</div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Peg Deviation:</div>
          <div className="font-medium">{(opportunity.pegDeviation * 100).toFixed(3)}%</div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Risk Level:</div>
          <div className={cn("font-medium", getRiskColor(opportunity.riskScore))}>
            {getRiskLabel(opportunity.riskScore)}
            {opportunity.riskScore > 5 && <AlertTriangle className="inline-block ml-1 h-3.5 w-3.5" />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex items-center text-sm">
          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
          <span className="font-medium">Est. profit: ${profitEstimate.netProfit.toFixed(2)}</span>
        </div>
        <Button 
          onClick={() => onExecute(opportunity)} 
          className="ml-auto gap-1" 
          size="sm"
          variant="outline"
        >
          Execute <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function StablecoinArbitrage() {
  const { isLoading, arbitrageOpportunities, exchanges, refreshData } = useCrypto();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter and sorting state
  const [filteredOpportunities, setFilteredOpportunities] = useState<StablecoinArbitrageOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSpread, setMinSpread] = useState(0.1); // Lower default for stablecoins
  const [sortBy, setSortBy] = useState<"spreadPercent" | "volume24h" | "timestamp" | "riskScore">("spreadPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStablecoinTypes, setSelectedStablecoinTypes] = useState<StablecoinType[]>([
    'USD-backed', 'Crypto-backed', 'Algorithmic', 'Commodity-backed'
  ]);
  const [maxRiskScore, setMaxRiskScore] = useState<number>(10);
  const [selectedExchanges, setSelectedExchanges] = useState<Exchange[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [minProfitAmount, setMinProfitAmount] = useState<number>(0);
  const [showProfitEstimates, setShowProfitEstimates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);

  // Handle alert setup
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    condition: "above",
    value: minSpread,
    asset: "USDT/USDC",
    notifyVia: ["app"],
    stablecoinType: "USD-backed"
  });

  // Mock stablecoin data (in a real app, this would come from an API)
  const mockStablecoinOpportunities: StablecoinArbitrageOpportunity[] = [
    {
      id: "stbl-1",
      fromExchange: "Binance",
      toExchange: "Coinbase",
      pair: "USDT/USD",
      spreadAmount: 0.012,
      spreadPercent: 1.2,
      volume24h: 25000000,
      timestamp: new Date(),
      estimatedProfit: 120,
      fees: 15,
      netProfit: 105,
      stablecoinType: "USD-backed",
      pegDeviation: 0.003,
      riskScore: 2,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.995,
      toExchangePrice: 1.007
    },
    {
      id: "stbl-2",
      fromExchange: "Kraken",
      toExchange: "KuCoin",
      pair: "USDC/USDT",
      spreadAmount: 0.008,
      spreadPercent: 0.8,
      volume24h: 18000000,
      timestamp: new Date(),
      estimatedProfit: 80,
      fees: 12,
      netProfit: 68,
      stablecoinType: "USD-backed",
      pegDeviation: 0.002,
      riskScore: 1,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.998,
      toExchangePrice: 1.006
    },
    {
      id: "stbl-3",
      fromExchange: "Bybit",
      toExchange: "OKX",
      pair: "DAI/USDT",
      spreadAmount: 0.015,
      spreadPercent: 1.5,
      volume24h: 12000000,
      timestamp: new Date(),
      estimatedProfit: 150,
      fees: 18,
      netProfit: 132,
      stablecoinType: "Crypto-backed",
      pegDeviation: 0.004,
      riskScore: 3,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.992,
      toExchangePrice: 1.007
    },
    {
      id: "stbl-4",
      fromExchange: "Huobi",
      toExchange: "Gate.io",
      pair: "BUSD/USDT",
      spreadAmount: 0.009,
      spreadPercent: 0.9,
      volume24h: 15000000,
      timestamp: new Date(),
      estimatedProfit: 90,
      fees: 14,
      netProfit: 76,
      stablecoinType: "USD-backed",
      pegDeviation: 0.002,
      riskScore: 2,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.996,
      toExchangePrice: 1.005
    },
    {
      id: "stbl-5",
      fromExchange: "Bitfinex",
      toExchange: "Bitstamp",
      pair: "FRAX/USD",
      spreadAmount: 0.018,
      spreadPercent: 1.8,
      volume24h: 8000000,
      timestamp: new Date(),
      estimatedProfit: 180,
      fees: 22,
      netProfit: 158,
      stablecoinType: "Algorithmic",
      pegDeviation: 0.006,
      riskScore: 5,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.994,
      toExchangePrice: 1.006
    },
    {
      id: "stbl-6",
      fromExchange: "Gemini",
      toExchange: "Poloniex",
      pair: "GUSD/USDT",
      spreadAmount: 0.011,
      spreadPercent: 1.1,
      volume24h: 6000000,
      timestamp: new Date(),
      estimatedProfit: 110,
      fees: 16,
      netProfit: 94,
      stablecoinType: "USD-backed",
      pegDeviation: 0.003,
      riskScore: 2,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.997,
      toExchangePrice: 1.003
    },
    {
      id: "stbl-7",
      fromExchange: "Bittrex",
      toExchange: "BitMart",
      pair: "PAXG/USD",
      spreadAmount: 0.025,
      spreadPercent: 2.5,
      volume24h: 4000000,
      timestamp: new Date(),
      estimatedProfit: 250,
      fees: 30,
      netProfit: 220,
      stablecoinType: "Commodity-backed",
      pegDeviation: 0.008,
      riskScore: 4,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.992,
      toExchangePrice: 1.008
    },
    {
      id: "stbl-8",
      fromExchange: "Binance",
      toExchange: "Kraken",
      pair: "TUSD/USDT",
      spreadAmount: 0.007,
      spreadPercent: 0.7,
      volume24h: 10000000,
      timestamp: new Date(),
      estimatedProfit: 70,
      fees: 10,
      netProfit: 60,
      stablecoinType: "USD-backed",
      pegDeviation: 0.002,
      riskScore: 1,
      networks: [],
      feeDetails: {
        exchangeFees: 0,
        networkFees: 0,
        otherFees: 0
      },
      fromExchangePrice: 0.998,
      toExchangePrice: 1.002
    }
  ];

  // Calculate profit estimate based on investment amount
  const calculateProfitEstimate = (opportunity: StablecoinArbitrageOpportunity) => {
    const grossProfit = (opportunity.spreadPercent / 100) * investmentAmount;
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

  // Filter and sort opportunities
  useEffect(() => {
    let filtered = [...mockStablecoinOpportunities];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp => 
          opp.pair.toLowerCase().includes(query) ||
          opp.fromExchange.toLowerCase().includes(query) ||
          opp.toExchange.toLowerCase().includes(query) ||
          opp.stablecoinType.toLowerCase().includes(query)
      );
    }
    
    // Apply spread filter
    filtered = filtered.filter(opp => opp.spreadPercent >= minSpread);
    
    // Apply stablecoin type filter
    filtered = filtered.filter(opp => selectedStablecoinTypes.includes(opp.stablecoinType));
    
    // Apply risk score filter
    filtered = filtered.filter(opp => opp.riskScore <= maxRiskScore);
    
    // Apply exchange filter
    if (selectedExchanges.length > 0) {
      filtered = filtered.filter(
        opp => 
          selectedExchanges.includes(opp.fromExchange) || 
          selectedExchanges.includes(opp.toExchange)
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(opp => opp.stablecoinType === activeTab);
    }
    
    // Apply profit amount filter
    if (minProfitAmount > 0) {
      filtered = filtered.filter(opportunity => {
        const potentialProfit = (opportunity.spreadPercent / 100) * investmentAmount - opportunity.fees;
        return potentialProfit >= minProfitAmount;
      });
    }
    
    // Sort the filtered opportunities
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "spreadPercent":
          aValue = a.spreadPercent;
          bValue = b.spreadPercent;
          break;
        case "volume24h":
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case "timestamp":
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case "riskScore":
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          aValue = a.spreadPercent;
          bValue = b.spreadPercent;
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
    
    setFilteredOpportunities(filtered);
  }, [
    searchQuery, 
    minSpread, 
    sortBy, 
    sortOrder, 
    selectedStablecoinTypes, 
    maxRiskScore, 
    selectedExchanges,
    activeTab,
    investmentAmount,
    minProfitAmount
  ]);
  
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
        description: `Found ${filteredOpportunities.length} stablecoin arbitrage opportunities.`,
      });
    }, 800);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // Handle stablecoin type selection
  const handleStablecoinTypeChange = (type: StablecoinType) => {
    if (selectedStablecoinTypes.includes(type)) {
      setSelectedStablecoinTypes(selectedStablecoinTypes.filter(t => t !== type));
    } else {
      setSelectedStablecoinTypes([...selectedStablecoinTypes, type]);
    }
  };

  // Handle exchange selection
  const handleExchangeChange = (exchange: Exchange) => {
    if (selectedExchanges.includes(exchange)) {
      setSelectedExchanges(selectedExchanges.filter(e => e !== exchange));
    } else {
      setSelectedExchanges([...selectedExchanges, exchange]);
    }
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
      description: `You'll be notified when stablecoin spread is ${alertSettings.condition} ${alertSettings.value}% for ${alertSettings.asset}`,
    });
    setShowAlertDialog(false);
  };
  
  // Handle executing trade via arbitrage bot
  const executeViaArbitrageBot = (opportunity: StablecoinArbitrageOpportunity) => {
    // Save the selected opportunity to local storage to pass to the ArbitrageBot
    localStorage.setItem('selectedArbitrageOpportunity', JSON.stringify(opportunity));
    
    // Navigate to arbitrage bot page
    navigate('/arbitrage-bot');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stablecoin Arbitrage</h1>
          <p className="text-muted-foreground">
            Find arbitrage opportunities between stablecoins across different exchanges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSetAlert}
          >
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="USD-backed">USD-backed</TabsTrigger>
          <TabsTrigger value="Crypto-backed">Crypto-backed</TabsTrigger>
          <TabsTrigger value="Algorithmic">Algorithmic</TabsTrigger>
          <TabsTrigger value="Commodity-backed">Commodity-backed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by pair or exchange..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spreadPercent">Spread %</SelectItem>
                  <SelectItem value="volume24h">Volume</SelectItem>
                  <SelectItem value="timestamp">Time</SelectItem>
                  <SelectItem value="riskScore">Risk Score</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="icon" onClick={toggleViewMode}>
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No arbitrage opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredOpportunities.map((opportunity) => (
                <StablecoinOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  profitEstimate={calculateProfitEstimate(opportunity)}
                  onExecute={executeViaArbitrageBot}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Min. Spread (%)</label>
                  <span className="text-sm">{minSpread.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[minSpread]}
                  min={0}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setMinSpread(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Max Risk Score</label>
                  <span className="text-sm">{maxRiskScore}/10</span>
                </div>
                <Slider
                  value={[maxRiskScore]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setMaxRiskScore(value[0])}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stablecoin Types</label>
                <div className="flex flex-wrap gap-2">
                  {(['USD-backed', 'Crypto-backed', 'Algorithmic', 'Commodity-backed'] as StablecoinType[]).map((type) => (
                    <Badge
                      key={type}
                      variant={selectedStablecoinTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleStablecoinTypeChange(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Exchanges</label>
                <div className="flex flex-wrap gap-2">
                  {exchanges.slice(0, 8).map((exchange) => (
                    <Badge
                      key={exchange}
                      variant={selectedExchanges.includes(exchange) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleExchangeChange(exchange)}
                    >
                      {exchange}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                setSelectedStablecoinTypes(['USD-backed', 'Crypto-backed', 'Algorithmic', 'Commodity-backed']);
                setSelectedExchanges([]);
                setMinSpread(0.1);
                setMaxRiskScore(10);
              }}>
                Reset Filters
              </Button>

              <Separator />

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={handleAdvancedFiltersToggle}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="space-y-4 pt-2">
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stablecoin Types</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fiat-backed" defaultChecked />
                        <label htmlFor="fiat-backed" className="text-sm">Fiat-backed</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="crypto-backed" defaultChecked />
                        <label htmlFor="crypto-backed" className="text-sm">Crypto-backed</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="algorithmic" defaultChecked />
                        <label htmlFor="algorithmic" className="text-sm">Algorithmic</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="commodity-backed" defaultChecked />
                        <label htmlFor="commodity-backed" className="text-sm">Commodity-backed</label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Liquidity ($)</label>
                    <Input type="number" placeholder="Min liquidity in USD" defaultValue="100000" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Average Stablecoin Spread</p>
                <p className="text-2xl font-bold">
                  {(filteredOpportunities.reduce((sum, opp) => sum + opp.spreadPercent, 0) / 
                    (filteredOpportunities.length || 1)).toFixed(2)}%
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Best Opportunity</p>
                <p className="text-lg font-semibold">
                  {filteredOpportunities.length > 0 ? 
                    `${filteredOpportunities[0].pair} (${filteredOpportunities[0].spreadPercent.toFixed(2)}%)` : 
                    'None available'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Total Opportunities</p>
                <p className="text-lg font-semibold">{filteredOpportunities.length}</p>
              </div>
              
              <Button className="w-full" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Set Price Alert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Stablecoin Alert</DialogTitle>
            <DialogDescription>
              Get notified when stablecoin arbitrage opportunities match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Stablecoin Pair</Label>
              <Input 
                id="asset" 
                value={alertSettings.asset} 
                onChange={(e) => setAlertSettings({...alertSettings, asset: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stablecoinType">Stablecoin Type</Label>
              <Select 
                value={alertSettings.stablecoinType}
                onValueChange={(value) => setAlertSettings({...alertSettings, stablecoinType: value})}
              >
                <SelectTrigger id="stablecoinType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD-backed">USD-backed</SelectItem>
                  <SelectItem value="Crypto-backed">Crypto-backed</SelectItem>
                  <SelectItem value="Algorithmic">Algorithmic</SelectItem>
                  <SelectItem value="Commodity-backed">Commodity-backed</SelectItem>
                </SelectContent>
              </Select>
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
