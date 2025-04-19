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
  Bell
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
      exchange: "Huobi",
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

  // Filter and sort opportunities
  useEffect(() => {
    let filtered = [...mockP2POpportunities];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp => 
          opp.cryptoCurrency.toLowerCase().includes(query) ||
          opp.fiatCurrency.toLowerCase().includes(query) ||
          opp.exchange.toLowerCase().includes(query) ||
          opp.paymentMethod.toLowerCase().includes(query)
      );
    }
    
    // Apply spread filter
    filtered = filtered.filter(opp => opp.spreadPercent >= minSpread);
    
    // Apply completion rate filter
    filtered = filtered.filter(opp => opp.completionRate >= minCompletionRate);
    
    // Apply crypto filter
    if (selectedCrypto !== "all") {
      filtered = filtered.filter(opp => opp.cryptoCurrency === selectedCrypto);
    }
    
    // Apply fiat filter
    if (selectedFiat !== "all") {
      filtered = filtered.filter(opp => opp.fiatCurrency === selectedFiat);
    }
    
    // Apply payment method filter
    if (selectedPaymentMethods.length > 0) {
      filtered = filtered.filter(opp => selectedPaymentMethods.includes(opp.paymentMethod));
    }
    
    // Apply exchange filter
    if (selectedExchanges.length > 0) {
      filtered = filtered.filter(opp => selectedExchanges.includes(opp.exchange));
    }
    
    // Calculate estimated profit based on investment amount
    filtered = filtered.map(opp => ({
      ...opp,
      estimatedProfit: (opp.spreadPercent / 100) * Math.min(investmentAmount, opp.maxAmount)
    }));
    
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
        case "completionRate":
          aValue = a.completionRate;
          bValue = b.completionRate;
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
    minCompletionRate,
    sortBy, 
    sortOrder, 
    selectedCrypto,
    selectedFiat,
    selectedPaymentMethods,
    selectedExchanges,
    investmentAmount
  ]);
  
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
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">P2P Arbitrage</h1>
            <p className="text-muted-foreground">
              Find arbitrage opportunities between P2P markets and exchanges
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
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All Cryptos</TabsTrigger>
            <TabsTrigger value="BTC">Bitcoin</TabsTrigger>
            <TabsTrigger value="ETH">Ethereum</TabsTrigger>
            <TabsTrigger value="USDT">Stablecoins</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by crypto, fiat or payment method..."
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
                    <SelectItem value="completionRate">Completion Rate</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {filteredOpportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No P2P arbitrage opportunities found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {filteredOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <CardTitle className="text-xl">{opportunity.cryptoCurrency}/{opportunity.fiatCurrency}</CardTitle>
                            <Badge className="ml-2">{opportunity.exchange}</Badge>
                          </div>
                          <CardDescription>
                            via {opportunity.paymentMethod}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={opportunity.spreadPercent >= 5 ? "default" : 
                                 opportunity.spreadPercent >= 3 ? "secondary" : "outline"}
                          className="ml-2"
                        >
                          {opportunity.spreadPercent.toFixed(2)}% Spread
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Buy Price</p>
                          <p className="text-lg font-bold">
                            {opportunity.fiatCurrency} {opportunity.buyPrice.toLocaleString(undefined, {
                              minimumFractionDigits: opportunity.cryptoCurrency === 'USDT' ? 2 : 0,
                              maximumFractionDigits: opportunity.cryptoCurrency === 'USDT' ? 2 : 0
                            })}
                          </p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Sell Price</p>
                          <p className="text-lg font-bold text-crypto-green">
                            {opportunity.fiatCurrency} {opportunity.sellPrice.toLocaleString(undefined, {
                              minimumFractionDigits: opportunity.cryptoCurrency === 'USDT' ? 2 : 0,
                              maximumFractionDigits: opportunity.cryptoCurrency === 'USDT' ? 2 : 0
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span className="font-medium">{opportunity.completionRate}%</span>
                        </div>
                        <Progress value={opportunity.completionRate} className="h-2" />
                        
                        <div className="flex justify-between text-sm mt-2">
                          <span>Trade Limits</span>
                          <span className="font-medium">
                            {opportunity.fiatCurrency} {opportunity.minAmount} - {opportunity.maxAmount}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Est. Profit (on {opportunity.fiatCurrency} {investmentAmount})</span>
                          <span className="font-medium text-crypto-green">
                            {opportunity.fiatCurrency} {opportunity.estimatedProfit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button className="w-full" size="sm" onClick={() => executeViaArbitrageBot(opportunity)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Execute
                      </Button>
                    </CardFooter>
                  </Card>
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
                    max={10}
                    step={0.5}
                    onValueChange={(value) => setMinSpread(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Min. Completion Rate</label>
                    <span className="text-sm">{minCompletionRate}%</span>
                  </div>
                  <Slider
                    value={[minCompletionRate]}
                    min={80}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMinCompletionRate(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Investment Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-8"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cryptocurrency</label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cryptocurrencies</SelectItem>
                      {cryptoCurrencies.map(crypto => (
                        <SelectItem key={crypto} value={crypto}>{crypto}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fiat Currency</label>
                  <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fiat currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fiat Currencies</SelectItem>
                      {fiatCurrencies.map(fiat => (
                        <SelectItem key={fiat} value={fiat}>{fiat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {paymentMethods.map((method) => (
                      <Badge
                        key={method}
                        variant={selectedPaymentMethods.includes(method) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handlePaymentMethodChange(method)}
                      >
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exchanges</label>
                  <div className="flex flex-wrap gap-2">
                    {exchanges.slice(0, 6).map((exchange) => (
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
                      <label className="text-sm font-medium">Payment Method</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Methods</SelectItem>
                          <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reputation Score</label>
                      <Slider
                        defaultValue={[50]}
                        max={100}
                        step={5}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  setSelectedCrypto("all");
                  setSelectedFiat("all");
                  setSelectedPaymentMethods([]);
                  setSelectedExchanges([]);
                  setMinSpread(2.0);
                  setMinCompletionRate(90);
                  setInvestmentAmount(1000);
                }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">P2P Trading Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-crypto-yellow flex-shrink-0" />
                  <p className="text-sm">Always verify the seller's reputation and completion rate before trading.</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-crypto-yellow flex-shrink-0" />
                  <p className="text-sm">Use escrow services provided by the exchange for security.</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-crypto-yellow flex-shrink-0" />
                  <p className="text-sm">Be aware of payment method restrictions and processing times.</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-crypto-yellow flex-shrink-0" />
                  <p className="text-sm">Start with smaller amounts to test the process before larger trades.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create P2P Arbitrage Alert</DialogTitle>
            <DialogDescription>
              Get notified when P2P arbitrage opportunities match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Cryptocurrency/Fiat Pair</Label>
              <Input 
                id="asset" 
                value={alertSettings.asset} 
                onChange={(e) => setAlertSettings({...alertSettings, asset: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={alertSettings.paymentMethod}
                onValueChange={(value) => setAlertSettings({...alertSettings, paymentMethod: value})}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Revolut">Revolut</SelectItem>
                  <SelectItem value="Wise">Wise</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="SEPA">SEPA</SelectItem>
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
