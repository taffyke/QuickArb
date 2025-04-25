import { useState, useEffect } from "react";
import { Exchange, useCrypto } from "@/contexts/crypto-context";
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
  CardFooter,
} from "@/components/ui/card";
import { 
  RefreshCcw, 
  Search, 
  SortAsc, 
  SortDesc,
  Users,
  DollarSign,
  ArrowRight,
  AlertCircle,
  SlidersHorizontal,
  Bell,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

// Define P2P opportunity type
interface P2PArbitrageOpportunity {
  id: string;
  exchange: Exchange;
  paymentMethod: string;
  cryptoCurrency: string;
  fiatCurrency: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  volume24h: number;
  completionRate: number;
  minAmount: number;
  maxAmount: number;
  estimatedProfit: number;
  timestamp: Date;
}

// Add a P2P Opportunity Card component with price display
const P2POpportunityCard = ({ 
  opportunity, 
  profitEstimate, 
  onExecute 
}: { 
  opportunity: P2PArbitrageOpportunity;
  profitEstimate: any;
  onExecute: (opportunity: P2PArbitrageOpportunity) => void;
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

  return (
    <Card className={cn(
      "opportunity-card transition-all",
      opportunity.spreadPercent >= 3 ? "bg-success/5 dark:bg-success/10" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="mr-1.5 h-4 w-4 text-blue-500" />
            {opportunity.exchange} P2P
          </CardTitle>
          <Badge variant={opportunity.spreadPercent >= 3 ? "default" : "outline"}>
            {opportunity.spreadPercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="font-medium">{opportunity.cryptoCurrency}/{opportunity.fiatCurrency}</span>
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
              <span>Buy Price:</span>
              <span className="font-mono">${opportunity.buyPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sell Price:</span>
              <span className="font-mono">${opportunity.sellPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Spread:</span>
              <span className="font-mono text-green-500">
                ${(opportunity.sellPrice - opportunity.buyPrice).toFixed(2)} ({opportunity.spreadPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Payment Method:</div>
          <div className="font-medium">{opportunity.paymentMethod}</div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Completion Rate:</div>
          <div className="font-medium">{opportunity.completionRate}%</div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Limits:</div>
          <div className="font-medium">${opportunity.minAmount} - ${opportunity.maxAmount}</div>
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

export default function P2PArbitrage() {
  const { exchanges, refreshData } = useCrypto();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter and sorting state
  const [filteredOpportunities, setFilteredOpportunities] = useState<P2PArbitrageOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSpread, setMinSpread] = useState(2.0);
  const [minCompletionRate, setMinCompletionRate] = useState(90);
  const [sortBy, setSortBy] = useState<"spreadPercent" | "volume24h" | "completionRate">("spreadPercent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("all");
  const [selectedFiat, setSelectedFiat] = useState<string>("all");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<Exchange[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [minProfitAmount, setMinProfitAmount] = useState<number>(0);
  const [showProfitEstimates, setShowProfitEstimates] = useState(true);

  // Handle alert setup
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    condition: "above",
    value: minSpread,
    asset: "BTC/USD",
    notifyVia: ["app"],
    paymentMethod: "Bank Transfer"
  });

  // Calculate profit estimate based on investment amount
  const calculateProfitEstimate = (opportunity: P2PArbitrageOpportunity) => {
    const grossProfit = (opportunity.spreadPercent / 100) * investmentAmount;
    const fees = grossProfit * 0.12; // assuming 12% in total fees
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

  // Mock P2P data (in a real app, this would come from an API)
  const mockP2POpportunities: P2PArbitrageOpportunity[] = [
    {
      id: "p2p-1",
      exchange: "Binance",
      paymentMethod: "Bank Transfer",
      cryptoCurrency: "BTC",
      fiatCurrency: "USD",
      buyPrice: 38500,
      sellPrice: 39200,
      spreadPercent: 1.82,
      volume24h: 1500000,
      completionRate: 98,
      minAmount: 100,
      maxAmount: 5000,
      estimatedProfit: 18.2,
      timestamp: new Date()
    },
    {
      id: "p2p-2",
      exchange: "Binance",
      paymentMethod: "Revolut",
      cryptoCurrency: "ETH",
      fiatCurrency: "EUR",
      buyPrice: 2250,
      sellPrice: 2310,
      spreadPercent: 2.67,
      volume24h: 850000,
      completionRate: 97,
      minAmount: 100,
      maxAmount: 3000,
      estimatedProfit: 26.7,
      timestamp: new Date()
    },
    {
      id: "p2p-3",
      exchange: "KuCoin",
      paymentMethod: "PayPal",
      cryptoCurrency: "USDT",
      fiatCurrency: "USD",
      buyPrice: 0.98,
      sellPrice: 1.02,
      spreadPercent: 4.08,
      volume24h: 2200000,
      completionRate: 95,
      minAmount: 50,
      maxAmount: 2000,
      estimatedProfit: 40.8,
      timestamp: new Date()
    },
    {
      id: "p2p-4",
      exchange: "OKX",
      paymentMethod: "Bank Transfer",
      cryptoCurrency: "BTC",
      fiatCurrency: "GBP",
      buyPrice: 30500,
      sellPrice: 31200,
      spreadPercent: 2.30,
      volume24h: 750000,
      completionRate: 96,
      minAmount: 200,
      maxAmount: 4000,
      estimatedProfit: 23.0,
      timestamp: new Date()
    },
    {
      id: "p2p-5",
      exchange: "Bybit",
      paymentMethod: "Wise",
      cryptoCurrency: "ETH",
      fiatCurrency: "USD",
      buyPrice: 2240,
      sellPrice: 2320,
      spreadPercent: 3.57,
      volume24h: 920000,
      completionRate: 94,
      minAmount: 100,
      maxAmount: 3500,
      estimatedProfit: 35.7,
      timestamp: new Date()
    },
    {
      id: "p2p-6",
      exchange: "HTX",
      paymentMethod: "Zelle",
      cryptoCurrency: "USDT",
      fiatCurrency: "USD",
      buyPrice: 0.97,
      sellPrice: 1.03,
      spreadPercent: 6.19,
      volume24h: 1800000,
      completionRate: 92,
      minAmount: 50,
      maxAmount: 2500,
      estimatedProfit: 61.9,
      timestamp: new Date()
    },
    {
      id: "p2p-7",
      exchange: "Binance",
      paymentMethod: "SEPA",
      cryptoCurrency: "BTC",
      fiatCurrency: "EUR",
      buyPrice: 35800,
      sellPrice: 36500,
      spreadPercent: 1.96,
      volume24h: 1300000,
      completionRate: 99,
      minAmount: 100,
      maxAmount: 5000,
      estimatedProfit: 19.6,
      timestamp: new Date()
    },
    {
      id: "p2p-8",
      exchange: "KuCoin",
      paymentMethod: "Bank Transfer",
      cryptoCurrency: "ETH",
      fiatCurrency: "USD",
      buyPrice: 2230,
      sellPrice: 2290,
      spreadPercent: 2.69,
      volume24h: 680000,
      completionRate: 97,
      minAmount: 100,
      maxAmount: 3000,
      estimatedProfit: 26.9,
      timestamp: new Date()
    }
  ];

  // Available payment methods
  const paymentMethods = ["Bank Transfer", "PayPal", "Revolut", "Wise", "SEPA", "Zelle"];
  
  // Available cryptocurrencies
  const cryptoCurrencies = ["BTC", "ETH", "USDT", "USDC", "XRP", "SOL"];
  
  // Available fiat currencies
  const fiatCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

  // Handle filtering and search
  useEffect(() => {
    // In a real app, we would fetch this data from an API
    setFilteredOpportunities(mockP2POpportunities.filter(opportunity => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          opportunity.exchange.toLowerCase().includes(query) ||
          opportunity.cryptoCurrency.toLowerCase().includes(query) ||
          opportunity.fiatCurrency.toLowerCase().includes(query) ||
          opportunity.paymentMethod.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      // Apply spread filter
      if (opportunity.spreadPercent < minSpread) return false;
      
      // Apply completion rate filter
      if (opportunity.completionRate < minCompletionRate) return false;
      
      // Apply crypto currency filter
      if (selectedCrypto !== "all" && opportunity.cryptoCurrency !== selectedCrypto) return false;
      
      // Apply fiat currency filter
      if (selectedFiat !== "all" && opportunity.fiatCurrency !== selectedFiat) return false;
      
      // Apply payment method filter
      if (selectedPaymentMethods.length > 0 && !selectedPaymentMethods.includes(opportunity.paymentMethod)) return false;
      
      // Apply exchange filter
      if (selectedExchanges.length > 0 && !selectedExchanges.includes(opportunity.exchange)) return false;
      
      // Apply minimum profit filter
      if (minProfitAmount > 0) {
        const profitEstimate = calculateProfitEstimate(opportunity);
        if (profitEstimate.netProfit < minProfitAmount) return false;
      }
      
      return true;
    }));
  }, [
    searchQuery, 
    minSpread, 
    minCompletionRate, 
    selectedCrypto, 
    selectedFiat, 
    selectedPaymentMethods, 
    selectedExchanges,
    investmentAmount,
    minProfitAmount
  ]);
  
  // Sort opportunities when filteredOpportunities or sorting options change
  useEffect(() => {
    const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      
      if (sortBy === "spreadPercent") {
        return (a.spreadPercent - b.spreadPercent) * factor;
      }
      
      if (sortBy === "volume24h") {
        return (a.volume24h - b.volume24h) * factor;
      }
      
      return (a.completionRate - b.completionRate) * factor;
    });
    
    setFilteredOpportunities(sortedOpportunities);
  }, [filteredOpportunities, sortBy, sortOrder]);
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real-world app, you would fetch data from an API
      setFilteredOpportunities(mockP2POpportunities);
      setLastRefreshed(new Date());
      setLoading(false);
      
      toast({
        title: "Data Refreshed",
        description: `Found ${mockP2POpportunities.length} P2P arbitrage opportunities.`,
      });
    }, 800);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Toggle expanded opportunity
  const toggleExpandOpportunity = (id: string) => {
    setExpandedOpportunity(prev => prev === id ? null : id);
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    if (selectedPaymentMethods.includes(method)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
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
      description: `You'll be notified when P2P spread is ${alertSettings.condition} ${alertSettings.value}% for ${alertSettings.asset}`,
    });
    setShowAlertDialog(false);
  };
  
  // Handle executing trade via arbitrage bot
  const executeViaArbitrageBot = (opportunity: P2PArbitrageOpportunity) => {
    // Save the selected opportunity to local storage to pass to the ArbitrageBot
    localStorage.setItem('selectedArbitrageOpportunity', JSON.stringify(opportunity));
    
    // Navigate to arbitrage bot page
    navigate('/arbitrage-bot');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            P2P Arbitrage
          </h1>
          <p className="text-muted-foreground">
            Peer-to-peer exchange price differences for fiat-crypto arbitrage
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            onClick={handleRefresh} 
            className="gap-2" 
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSetAlert} 
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Set Alert
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedCrypto === "all" ? "all" : selectedCrypto} onValueChange={(value) => setSelectedCrypto(value === "all" ? "all" : value)} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto mb-2 sm:mb-0">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All Cryptos
            </TabsTrigger>
            <TabsTrigger value="BTC" className="flex items-center gap-1 text-amber-500">
              <DollarSign className="h-4 w-4" />
              Bitcoin
            </TabsTrigger>
            <TabsTrigger value="ETH" className="flex items-center gap-1 text-blue-500">
              <DollarSign className="h-4 w-4" />
              Ethereum
            </TabsTrigger>
            <TabsTrigger value="USDT" className="flex items-center gap-1 text-green-500">
              <DollarSign className="h-4 w-4" />
              Stablecoins
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search exchanges or payment methods..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleSortOrder}
                aria-label={sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleAdvancedFiltersToggle}
                className={cn(showAdvancedFilters && "bg-accent")}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {opportunitiesWithProfitEstimates.length > 0 ? (
              opportunitiesWithProfitEstimates.map((opportunity) => (
                <P2POpportunityCard key={opportunity.id} opportunity={opportunity} profitEstimate={opportunity.profitEstimate} onExecute={executeViaArbitrageBot} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No opportunities found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Try adjusting your filters or refreshing to find P2P arbitrage opportunities.
                </p>
                <Button className="mt-4" onClick={handleRefresh}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="BTC" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {opportunitiesWithProfitEstimates.length > 0 ? (
              opportunitiesWithProfitEstimates.map((opportunity) => (
                <P2POpportunityCard key={opportunity.id} opportunity={opportunity} profitEstimate={opportunity.profitEstimate} onExecute={executeViaArbitrageBot} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Bitcoin opportunities found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Try adjusting your filters or refreshing to find Bitcoin P2P arbitrage opportunities.
                </p>
                <Button className="mt-4" onClick={handleRefresh}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="ETH" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {opportunitiesWithProfitEstimates.length > 0 ? (
              opportunitiesWithProfitEstimates.map((opportunity) => (
                <P2POpportunityCard key={opportunity.id} opportunity={opportunity} profitEstimate={opportunity.profitEstimate} onExecute={executeViaArbitrageBot} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Ethereum opportunities found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Try adjusting your filters or refreshing to find Ethereum P2P arbitrage opportunities.
                </p>
                <Button className="mt-4" onClick={handleRefresh}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="USDT" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {opportunitiesWithProfitEstimates.length > 0 ? (
              opportunitiesWithProfitEstimates.map((opportunity) => (
                <P2POpportunityCard key={opportunity.id} opportunity={opportunity} profitEstimate={opportunity.profitEstimate} onExecute={executeViaArbitrageBot} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Stablecoin opportunities found</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Try adjusting your filters or refreshing to find Stablecoin P2P arbitrage opportunities.
                </p>
                <Button className="mt-4" onClick={handleRefresh}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Advanced filters section - keep existing code */}
      {showAdvancedFilters && (
        <Card className="mt-4">
          {/* Keep existing advanced filters code */}
        </Card>
      )}

      {/* Alert dialog - keep existing code */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        {/* Keep existing dialog code */}
      </Dialog>
    </div>
  );
}
