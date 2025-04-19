
import { useState, useEffect } from "react";
import { 
  ArrowDownFromLine, 
  ArrowRightLeft, 
  ArrowUpFromLine, 
  BellDot, 
  BarChart3, 
  Calculator, 
  Clock, 
  CurrencyIcon,
  Gauge,
  Info,
  LineChart, 
  PercentIcon,
  Wallet,
  RefreshCw, 
  TrendingDown, 
  TrendingUp,
  Eye,
  Download,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Enhanced chart component
const ChartContainer = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

export function MarketAnalysis() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("technical");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Technical indicators data
  const [technicalData, setTechnicalData] = useState({
    rsi: 58.3,
    macd: 125.45,
    ema: 37842.12,
    bbands: {
      upper: 38920.45,
      middle: 38250.75,
      lower: 37580.22
    },
    signals: {
      shortTerm: "buy",
      mediumTerm: "neutral",
      longTerm: "buy"
    }
  });

  // Market data
  const [marketData, setMarketData] = useState({
    price: 38245.67,
    change24h: 2.4,
    high24h: 38950.25,
    low24h: 37100.50,
    volume24h: 28.5, // Billion USD
    marketCap: 742.8, // Billion USD
    dominance: 52.3, // Percentage
    totalSupply: 19.5, // Million
  });

  // Fetch data on pair or timeframe change
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update data (in real implementation, this would be from API)
      setLastUpdated(new Date());
      setIsLoading(false);
    }
    
    fetchData();
  }, [selectedPair, timeframe]);
  
  // Handle data refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update data
    setLastUpdated(new Date());
    setIsLoading(false);
  };
  
  return (
    <Card className="w-full overflow-hidden border-0 bg-gradient-to-b from-background to-background/80 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 border-b">
        <CardTitle className="text-xl font-bold">Market Analysis</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="w-[140px] border-0 bg-secondary/50 h-9">
              <SelectValue placeholder="Select pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
              <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[80px] border-0 bg-secondary/50 h-9">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1d">1d</SelectItem>
              <SelectItem value="1w">1w</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="h-9 w-9 p-0 border-0 bg-secondary/50"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button 
            size="sm"
            variant="secondary"
            className="h-9 ml-1 gap-1 border-0 bg-secondary/50"
          >
            <BellDot className="h-4 w-4" />
            <span className="text-xs">Alerts</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="stats-card bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Price</span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mb-1">${marketData.price.toLocaleString()}</div>
            <div className={cn(
              "text-xs font-medium flex items-center",
              marketData.change24h >= 0 ? "text-crypto-green" : "text-crypto-red"
            )}>
              {marketData.change24h >= 0 ? (
                <ArrowUpFromLine className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownFromLine className="h-3 w-3 mr-1" />
              )}
              {Math.abs(marketData.change24h)}% (24h)
            </div>
          </div>
          
          <div className="stats-card bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">24h Range</span>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">${marketData.low24h.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">to</span>
              <span className="text-sm font-semibold">${marketData.high24h.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ 
                  width: `${((marketData.price - marketData.low24h) / (marketData.high24h - marketData.low24h)) * 100}%` 
                }}
              />
            </div>
          </div>
          
          <div className="stats-card bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Volume (24h)</span>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mb-1">${marketData.volume24h}B</div>
            <div className="text-xs text-muted-foreground">
              Market Cap: ${marketData.marketCap}B
            </div>
          </div>
          
          <div className="stats-card bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Technical Signals</span>
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                technicalData.signals.shortTerm === "buy" ? "bg-crypto-green/10 text-crypto-green" :
                technicalData.signals.shortTerm === "sell" ? "bg-crypto-red/10 text-crypto-red" :
                "bg-yellow-500/10 text-yellow-500"
              )}>
                Short: {technicalData.signals.shortTerm}
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                technicalData.signals.longTerm === "buy" ? "bg-crypto-green/10 text-crypto-green" :
                technicalData.signals.longTerm === "sell" ? "bg-crypto-red/10 text-crypto-red" :
                "bg-yellow-500/10 text-yellow-500"
              )}>
                Long: {technicalData.signals.longTerm}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              RSI: {technicalData.rsi} | MACD: {technicalData.macd}
            </div>
          </div>
        </div>
        
        <Tabs 
          defaultValue="technical" 
          value={selectedTab} 
          onValueChange={setSelectedTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 h-9 mb-4 bg-secondary/30">
            <TabsTrigger value="technical" className="text-xs">Technical Analysis</TabsTrigger>
            <TabsTrigger value="fundamentals" className="text-xs">Fundamentals</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-xs">Market Sentiment</TabsTrigger>
            <TabsTrigger value="correlations" className="text-xs">Correlations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="space-y-4 mt-0">
            <div className="h-[300px] w-full rounded-lg border bg-card/50 flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-primary opacity-50" />
                <p className="text-sm text-muted-foreground">Technical analysis chart will render here</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ChartContainer title="Technical Indicators">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-crypto-green"></div>
                      <span className="text-sm font-medium">RSI (14)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{technicalData.rsi}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Relative Strength Index</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-crypto-blue"></div>
                      <span className="text-sm font-medium">MACD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{technicalData.macd}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Moving Average Convergence Divergence</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-crypto-purple"></div>
                      <span className="text-sm font-medium">EMA (20)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">${technicalData.ema.toLocaleString()}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Exponential Moving Average</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium">Bollinger Bands</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 w-40">
                              <p className="text-xs">Upper: ${technicalData.bbands.upper.toLocaleString()}</p>
                              <p className="text-xs">Middle: ${technicalData.bbands.middle.toLocaleString()}</p>
                              <p className="text-xs">Lower: ${technicalData.bbands.lower.toLocaleString()}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </ChartContainer>
              
              <ChartContainer title="Trading Signals">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Signal</span>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      technicalData.signals.mediumTerm === "buy" ? "bg-crypto-green/10 text-crypto-green" :
                      technicalData.signals.mediumTerm === "sell" ? "bg-crypto-red/10 text-crypto-red" :
                      "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {technicalData.signals.mediumTerm === "buy" ? (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Buy
                        </span>
                      ) : technicalData.signals.mediumTerm === "sell" ? (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5" />
                          Sell
                        </span>
                      ) : (
                        <span>Neutral</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-crypto-red via-yellow-500 to-crypto-green" 
                      style={{ width: "100%" }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Strong Sell</span>
                    <span>Neutral</span>
                    <span>Strong Buy</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Oscillators</span>
                      <span className="text-xs text-crypto-green font-medium">BUY 7/3/2</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Moving Averages</span>
                      <span className="text-xs text-crypto-green font-medium">BUY 12/0/1</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Volume Indicators</span>
                      <span className="text-xs text-yellow-500 font-medium">NEUTRAL 2/5/1</span>
                    </div>
                  </div>
                </div>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="fundamentals" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Market Statistics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-medium">${marketData.marketCap}B</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-medium">${marketData.volume24h}B</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Dominance</span>
                    <span className="font-medium">{marketData.dominance}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-medium">{marketData.totalSupply}M</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Trading Activity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Buy Volume</span>
                    <span className="font-medium text-crypto-green">56.2%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sell Volume</span>
                    <span className="font-medium text-crypto-red">43.8%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Buy/Sell Ratio</span>
                    <span className="font-medium">1.28</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Active Traders</span>
                    <span className="font-medium">184.5K</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="h-[250px] rounded-lg border bg-card/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Social Sentiment</h3>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center h-[170px]">
                  <div className="text-2xl font-bold mb-1 text-crypto-green">Bullish</div>
                  <div className="text-sm text-muted-foreground mb-3">Overall market sentiment</div>
                  <div className="w-full max-w-xs h-2 bg-secondary/50 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-crypto-green" style={{ width: "72%" }}></div>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-xs text-muted-foreground">
                    <span>Bearish</span>
                    <span>72% Bullish</span>
                  </div>
                </div>
              </div>

              <div className="h-[250px] rounded-lg border bg-card/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Fear & Greed Index</h3>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center h-[170px]">
                  <div className="relative w-full max-w-xs h-16 mb-4">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-crypto-red via-yellow-500 to-crypto-green rounded-full overflow-hidden"></div>
                    <div className="absolute top-0 left-[63%] h-full w-1 bg-white"></div>
                    <div className="absolute top-full left-[63%] -ml-5 mt-2 text-sm font-medium">63</div>
                  </div>
                  <div className="text-lg font-bold">Greed</div>
                  <div className="text-sm text-muted-foreground">Current Market Sentiment</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="correlations" className="space-y-4 mt-0">
            <div className="rounded-lg border bg-card/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Correlation Matrix</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium px-2 py-2 border-b">Asset</th>
                      <th className="text-center font-medium px-2 py-2 border-b">BTC</th>
                      <th className="text-center font-medium px-2 py-2 border-b">ETH</th>
                      <th className="text-center font-medium px-2 py-2 border-b">SOL</th>
                      <th className="text-center font-medium px-2 py-2 border-b">BNB</th>
                      <th className="text-center font-medium px-2 py-2 border-b">ADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium px-2 py-2 border-b">BTC</td>
                      <td className="text-center px-2 py-2 border-b">1.00</td>
                      <td className="text-center px-2 py-2 border-b">0.82</td>
                      <td className="text-center px-2 py-2 border-b">0.76</td>
                      <td className="text-center px-2 py-2 border-b">0.71</td>
                      <td className="text-center px-2 py-2 border-b">0.64</td>
                    </tr>
                    <tr>
                      <td className="font-medium px-2 py-2 border-b">ETH</td>
                      <td className="text-center px-2 py-2 border-b">0.82</td>
                      <td className="text-center px-2 py-2 border-b">1.00</td>
                      <td className="text-center px-2 py-2 border-b">0.84</td>
                      <td className="text-center px-2 py-2 border-b">0.69</td>
                      <td className="text-center px-2 py-2 border-b">0.62</td>
                    </tr>
                    <tr>
                      <td className="font-medium px-2 py-2 border-b">SOL</td>
                      <td className="text-center px-2 py-2 border-b">0.76</td>
                      <td className="text-center px-2 py-2 border-b">0.84</td>
                      <td className="text-center px-2 py-2 border-b">1.00</td>
                      <td className="text-center px-2 py-2 border-b">0.73</td>
                      <td className="text-center px-2 py-2 border-b">0.68</td>
                    </tr>
                    <tr>
                      <td className="font-medium px-2 py-2 border-b">BNB</td>
                      <td className="text-center px-2 py-2 border-b">0.71</td>
                      <td className="text-center px-2 py-2 border-b">0.69</td>
                      <td className="text-center px-2 py-2 border-b">0.73</td>
                      <td className="text-center px-2 py-2 border-b">1.00</td>
                      <td className="text-center px-2 py-2 border-b">0.65</td>
                    </tr>
                    <tr>
                      <td className="font-medium px-2 py-2">ADA</td>
                      <td className="text-center px-2 py-2">0.64</td>
                      <td className="text-center px-2 py-2">0.62</td>
                      <td className="text-center px-2 py-2">0.68</td>
                      <td className="text-center px-2 py-2">0.65</td>
                      <td className="text-center px-2 py-2">1.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground p-2 rounded bg-muted/20">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {format(lastUpdated, 'HH:mm:ss')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            <span>Data updates automatically every 15 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
