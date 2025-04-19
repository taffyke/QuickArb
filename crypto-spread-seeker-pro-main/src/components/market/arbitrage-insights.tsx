import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  BarChart3,
  PieChart,
  ArrowRightLeft,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Timer,
  Zap,
  Download,
  Percent,
  RefreshCw,
  Info,
  Triangle,
  Network,
  DollarSign
} from "lucide-react";

// Interface for arbitrage opportunity analytics
interface ArbitrageAnalytics {
  timestamp: Date;
  strategyType: "cex-to-cex" | "cex-to-dex" | "triangular" | "cross-chain" | "futures-spot";
  totalOpportunities: number;
  averageSpread: number;
  highestSpread: number;
  volumeUSD: number;
  averageDuration: number; // minutes
  successRate: number;
  popularPairs: string[];
  fromExchange: string;
  toExchange: string;
  bestNetworks: string[];
  estimatedDailyProfit: number;
  riskLevel: "low" | "medium" | "high";
  complexityLevel: "beginner" | "intermediate" | "advanced";
}

// Mock data for arbitrage analytics
const mockArbitrageAnalytics: ArbitrageAnalytics[] = [
  {
    timestamp: new Date(),
    strategyType: "cex-to-cex",
    totalOpportunities: 156,
    averageSpread: 1.8,
    highestSpread: 4.7,
    volumeUSD: 425000000,
    averageDuration: 12,
    successRate: 92,
    popularPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    fromExchange: "Binance",
    toExchange: "Kraken",
    bestNetworks: ["Solana", "BSC", "Polygon"],
    estimatedDailyProfit: 450,
    riskLevel: "low",
    complexityLevel: "beginner"
  },
  {
    timestamp: new Date(),
    strategyType: "cex-to-dex",
    totalOpportunities: 212,
    averageSpread: 2.5,
    highestSpread: 6.2,
    volumeUSD: 287000000,
    averageDuration: 8,
    successRate: 85,
    popularPairs: ["ETH/USDT", "SOL/USDT", "AVAX/USDT"],
    fromExchange: "Binance",
    toExchange: "Uniswap",
    bestNetworks: ["Ethereum", "Arbitrum", "Optimism"],
    estimatedDailyProfit: 620,
    riskLevel: "medium",
    complexityLevel: "intermediate"
  },
  {
    timestamp: new Date(),
    strategyType: "triangular",
    totalOpportunities: 98,
    averageSpread: 1.4,
    highestSpread: 3.8,
    volumeUSD: 195000000,
    averageDuration: 5,
    successRate: 87,
    popularPairs: ["ETH/BTC/USDT", "SOL/ETH/USDT", "BNB/BTC/USDT"],
    fromExchange: "Binance",
    toExchange: "Binance",
    bestNetworks: ["N/A"],
    estimatedDailyProfit: 380,
    riskLevel: "low",
    complexityLevel: "intermediate"
  },
  {
    timestamp: new Date(),
    strategyType: "futures-spot",
    totalOpportunities: 76,
    averageSpread: 1.2,
    highestSpread: 4.1,
    volumeUSD: 320000000,
    averageDuration: 240, // funding interval in minutes (4 hours)
    successRate: 94,
    popularPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    fromExchange: "Binance",
    toExchange: "Binance",
    bestNetworks: ["N/A"],
    estimatedDailyProfit: 520,
    riskLevel: "medium",
    complexityLevel: "advanced"
  },
  {
    timestamp: new Date(),
    strategyType: "cross-chain",
    totalOpportunities: 64,
    averageSpread: 3.1,
    highestSpread: 7.5,
    volumeUSD: 120000000,
    averageDuration: 15,
    successRate: 78,
    popularPairs: ["ETH/USDT", "USDC/USDT", "BNB/USDT"],
    fromExchange: "Binance",
    toExchange: "PancakeSwap",
    bestNetworks: ["BSC", "Ethereum", "Arbitrum"],
    estimatedDailyProfit: 720,
    riskLevel: "high",
    complexityLevel: "advanced"
  }
];

// Sample historical data for time-series charts
const historicalData = {
  dates: ["May 1", "May 2", "May 3", "May 4", "May 5", "May 6", "May 7"],
  spreads: {
    "cex-to-cex": [1.7, 1.8, 1.9, 1.7, 1.6, 1.8, 1.8],
    "cex-to-dex": [2.3, 2.4, 2.7, 2.6, 2.5, 2.3, 2.5],
    "triangular": [1.2, 1.3, 1.5, 1.4, 1.4, 1.3, 1.4],
    "futures-spot": [1.1, 1.0, 1.3, 1.2, 1.4, 1.3, 1.2],
    "cross-chain": [2.9, 3.0, 3.2, 3.3, 3.0, 2.8, 3.1]
  },
  opportunities: {
    "cex-to-cex": [145, 152, 160, 158, 149, 150, 156],
    "cex-to-dex": [195, 205, 220, 218, 210, 208, 212],
    "triangular": [90, 92, 95, 100, 102, 95, 98],
    "futures-spot": [72, 70, 75, 78, 77, 74, 76],
    "cross-chain": [58, 60, 68, 70, 65, 62, 64]
  },
  volume: {
    "cex-to-cex": [410, 415, 430, 440, 420, 418, 425],
    "cex-to-dex": [270, 275, 285, 290, 292, 280, 287],
    "triangular": [180, 185, 190, 195, 198, 192, 195],
    "futures-spot": [300, 305, 315, 325, 320, 318, 320],
    "cross-chain": [110, 115, 125, 128, 122, 118, 120]
  }
};

// Interface for component props
interface ArbitrageInsightsProps {
  lastUpdated: Date;
}

export function ArbitrageInsights({ lastUpdated }: ArbitrageInsightsProps) {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d");
  const [activeStrategy, setActiveStrategy] = useState<string>("all");
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  
  // Filter strategies based on active tab
  const filteredStrategies = activeStrategy === "all" 
    ? mockArbitrageAnalytics 
    : mockArbitrageAnalytics.filter(strategy => strategy.strategyType === activeStrategy);
  
  return (
    <div className="space-y-6">
      {/* Strategy Selection and Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-medium">Arbitrage Strategy Comparison</CardTitle>
                <CardDescription>Compare performance metrics across different strategies</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue={timeframe} onValueChange={(value) => setTimeframe(value as "24h" | "7d" | "30d")}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeStrategy} onValueChange={setActiveStrategy}>
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="cex-to-cex" className="flex items-center gap-1">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>CEX-CEX</span>
                </TabsTrigger>
                <TabsTrigger value="cex-to-dex" className="flex items-center gap-1">
                  <Network className="h-3.5 w-3.5" />
                  <span>CEX-DEX</span>
                </TabsTrigger>
                <TabsTrigger value="triangular" className="flex items-center gap-1">
                  <Triangle className="h-3.5 w-3.5" />
                  <span>Triangular</span>
                </TabsTrigger>
                <TabsTrigger value="futures-spot" className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  <span>Futures</span>
                </TabsTrigger>
                <TabsTrigger value="cross-chain" className="flex items-center gap-1">
                  <ArrowDownUp className="h-3.5 w-3.5" />
                  <span>Cross-Chain</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Average Spread</div>
                    <div className="text-2xl font-bold">
                      {(filteredStrategies.reduce((sum, s) => sum + s.averageSpread, 0) / filteredStrategies.length).toFixed(2)}%
                    </div>
                    <div className="flex items-center text-xs text-crypto-green mt-1">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      +0.3% from yesterday
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Total Opportunities</div>
                    <div className="text-2xl font-bold">
                      {filteredStrategies.reduce((sum, s) => sum + s.totalOpportunities, 0)}
                    </div>
                    <div className="flex items-center text-xs text-crypto-green mt-1">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      +24 from yesterday
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Highest Spread Available</div>
                    <div className="text-2xl font-bold text-crypto-green">
                      {Math.max(...filteredStrategies.map(s => s.highestSpread)).toFixed(1)}%
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <Zap className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                      {filteredStrategies.sort((a, b) => b.highestSpread - a.highestSpread)[0]?.strategyType}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed mb-6">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Average spread over time will render here</p>
                  <p className="text-xs text-muted-foreground mt-1">Shows historical spread development for selected strategies</p>
                </div>
              </div>
            </Tabs>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-3 font-medium">Strategy</th>
                    <th className="text-right py-3 font-medium">Avg. Spread</th>
                    <th className="text-right py-3 font-medium">Opportunities</th>
                    <th className="text-right py-3 font-medium">Success Rate</th>
                    <th className="text-right py-3 font-medium">Est. Daily Profit</th>
                    <th className="text-right py-3 font-medium">Risk Level</th>
                    <th className="text-right py-3 font-medium">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStrategies.map((strategy) => (
                    <tr key={strategy.strategyType} className="border-b hover:bg-muted/30">
                      <td className="py-3 text-left">
                        <div className="flex items-center">
                          {strategy.strategyType === "cex-to-cex" && <ArrowRightLeft className="h-4 w-4 mr-2 text-primary" />}
                          {strategy.strategyType === "cex-to-dex" && <Network className="h-4 w-4 mr-2 text-primary" />}
                          {strategy.strategyType === "triangular" && <Triangle className="h-4 w-4 mr-2 text-primary" />}
                          {strategy.strategyType === "futures-spot" && <Timer className="h-4 w-4 mr-2 text-primary" />}
                          {strategy.strategyType === "cross-chain" && <ArrowDownUp className="h-4 w-4 mr-2 text-primary" />}
                          <div>
                            <div className="font-medium capitalize">{strategy.strategyType.replace(/-/g, ' ')}</div>
                            <div className="text-xs text-muted-foreground">{strategy.fromExchange} → {strategy.toExchange}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right text-crypto-green">{strategy.averageSpread.toFixed(1)}%</td>
                      <td className="py-3 text-right">{strategy.totalOpportunities}</td>
                      <td className="py-3 text-right">{strategy.successRate}%</td>
                      <td className="py-3 text-right">
                        <span className="font-medium">${strategy.estimatedDailyProfit.toFixed(0)}</span>
                        <div className="text-xs text-muted-foreground">on $1,000</div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge 
                          variant="outline"
                          className={
                            strategy.riskLevel === "low" ? "bg-green-500/10 text-green-500" :
                            strategy.riskLevel === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-red-500/10 text-red-500"
                          }
                        >
                          {strategy.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="outline">
                          {strategy.complexityLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Arbitrage Calculator</CardTitle>
            <CardDescription>Estimate potential profits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Investment Amount</div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={investmentAmount.toString()} 
                    onValueChange={(value) => setInvestmentAmount(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">$100</SelectItem>
                      <SelectItem value="500">$500</SelectItem>
                      <SelectItem value="1000">$1,000</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="font-medium">Daily Profit Estimate</div>
                {filteredStrategies.map(strategy => (
                  <div key={strategy.strategyType} className="flex justify-between items-center">
                    <div className="text-sm flex items-center">
                      {strategy.strategyType === "cex-to-cex" && <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "cex-to-dex" && <Network className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "triangular" && <Triangle className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "futures-spot" && <Timer className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "cross-chain" && <ArrowDownUp className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      <span className="capitalize">{strategy.strategyType.replace(/-/g, ' ')}</span>
                    </div>
                    <div className="font-medium text-crypto-green">
                      ${((strategy.estimatedDailyProfit / 1000) * investmentAmount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="font-medium">Monthly Profit Estimate</div>
                {filteredStrategies.map(strategy => (
                  <div key={strategy.strategyType} className="flex justify-between items-center">
                    <div className="text-sm flex items-center">
                      {strategy.strategyType === "cex-to-cex" && <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "cex-to-dex" && <Network className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "triangular" && <Triangle className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "futures-spot" && <Timer className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      {strategy.strategyType === "cross-chain" && <ArrowDownUp className="h-3.5 w-3.5 mr-1.5 text-primary" />}
                      <span className="capitalize">{strategy.strategyType.replace(/-/g, ' ')}</span>
                    </div>
                    <div className="font-medium text-crypto-green">
                      ${((strategy.estimatedDailyProfit / 1000) * investmentAmount * 30).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                * Estimates are based on current market conditions and historical success rates. Actual results may vary.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Popular Trading Pairs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Arbitrage Trading Pairs</CardTitle>
          <CardDescription>
            Most profitable cryptocurrency pairs for arbitrage trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pair: "BTC/USDT", spread: "1.2-3.8%", volume: "$12.5B", venues: "CEX-DEX, Futures" },
              { pair: "ETH/USDT", spread: "1.5-4.2%", volume: "$8.4B", venues: "All strategies" },
              { pair: "SOL/USDT", spread: "2.1-5.1%", volume: "$3.2B", venues: "CEX-DEX, Cross-Chain" },
              { pair: "AVAX/USDT", spread: "1.9-4.3%", volume: "$1.8B", venues: "CEX-DEX, Cross-Chain" },
              { pair: "BNB/USDT", spread: "1.1-3.2%", volume: "$2.7B", venues: "CEX-DEX, Triangular" },
              { pair: "XRP/USDT", spread: "1.6-3.9%", volume: "$1.5B", venues: "CEX-CEX, Triangular" }
            ].map(item => (
              <Card key={item.pair} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold mb-1">{item.pair}</div>
                      <div className="text-xs text-muted-foreground">24h Volume: {item.volume}</div>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      {item.spread}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-xs">
                    <div className="font-medium mb-1">Best Strategies:</div>
                    <div className="text-muted-foreground">{item.venues}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Arbitrage Tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Arbitrage Strategy Tips</CardTitle>
          <CardDescription>
            Expert recommendations for maximizing arbitrage profits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                CEX-to-DEX Recommendations
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use fast networks like Solana or Arbitrum to minimize slippage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Account for gas fees when calculating profit - they can be significant</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Monitor network congestion to avoid transaction delays</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Triangular Arbitrage Tips
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Execute all trades on the same exchange to eliminate transfer times</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Create preset order templates for quick execution</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check order depth to ensure the spread remains valid for your trade size</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Futures Arbitrage Strategies
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Consider funding rates as an additional source of profit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Set stop losses to protect against market volatility</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Be aware of liquidation risks when using leverage</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Cross-Chain Insights
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use bridging services with the lowest fees and fastest confirmation times</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Batch transactions to amortize fixed costs across larger volumes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Have funds ready on multiple chains to avoid bridging delays</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 