import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  BarChart3,
  Clock,
  Zap,
  Download,
  Percent,
  RefreshCw,
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowDownUp
} from "lucide-react";

// Types for funding rate data
interface FundingRateData {
  symbol: string;
  exchange: string;
  currentRate: number;
  nextRate: number | null;
  predictedRate: number | null;
  hourlyRate: number;
  dailyRate: number;
  annualizedRate: number;
  timestamp: Date;
  averageVolume: number;
  priceChange24h: number;
  historicalRates: number[];
}

// Mock funding rate data
const mockFundingRates: FundingRateData[] = [
  {
    symbol: "BTC-USDT",
    exchange: "Binance",
    currentRate: 0.0115,
    nextRate: 0.0108,
    predictedRate: 0.0105,
    hourlyRate: 0.0115,
    dailyRate: 0.0345,
    annualizedRate: 12.59,
    timestamp: new Date(),
    averageVolume: 1250000000,
    priceChange24h: 1.8,
    historicalRates: [0.009, 0.011, 0.012, 0.0115, 0.0113, 0.0116, 0.0115]
  },
  {
    symbol: "ETH-USDT",
    exchange: "Binance",
    currentRate: 0.0125,
    nextRate: 0.0118,
    predictedRate: 0.0120,
    hourlyRate: 0.0125,
    dailyRate: 0.0375,
    annualizedRate: 13.69,
    timestamp: new Date(),
    averageVolume: 850000000,
    priceChange24h: 2.3,
    historicalRates: [0.010, 0.012, 0.013, 0.0125, 0.0123, 0.0126, 0.0125]
  },
  {
    symbol: "SOL-USDT",
    exchange: "Binance",
    currentRate: 0.0220,
    nextRate: 0.0210,
    predictedRate: 0.0215,
    hourlyRate: 0.0220,
    dailyRate: 0.0660,
    annualizedRate: 24.09,
    timestamp: new Date(),
    averageVolume: 450000000,
    priceChange24h: 4.2,
    historicalRates: [0.020, 0.022, 0.023, 0.022, 0.021, 0.022, 0.022]
  },
  {
    symbol: "BNB-USDT",
    exchange: "Binance",
    currentRate: 0.0105,
    nextRate: 0.0100,
    predictedRate: 0.0102,
    hourlyRate: 0.0105,
    dailyRate: 0.0315,
    annualizedRate: 11.50,
    timestamp: new Date(),
    averageVolume: 320000000,
    priceChange24h: -0.5,
    historicalRates: [0.008, 0.010, 0.011, 0.0105, 0.0103, 0.0106, 0.0105]
  },
  {
    symbol: "BTC-USDT",
    exchange: "OKX",
    currentRate: 0.0128,
    nextRate: 0.0120,
    predictedRate: 0.0118,
    hourlyRate: 0.0128,
    dailyRate: 0.0384,
    annualizedRate: 14.02,
    timestamp: new Date(),
    averageVolume: 820000000,
    priceChange24h: 1.8,
    historicalRates: [0.010, 0.012, 0.013, 0.0128, 0.0125, 0.0130, 0.0128]
  },
  {
    symbol: "ETH-USDT",
    exchange: "OKX",
    currentRate: 0.0132,
    nextRate: 0.0128,
    predictedRate: 0.0130,
    hourlyRate: 0.0132,
    dailyRate: 0.0396,
    annualizedRate: 14.45,
    timestamp: new Date(),
    averageVolume: 580000000,
    priceChange24h: 2.3,
    historicalRates: [0.011, 0.013, 0.014, 0.0132, 0.0129, 0.0134, 0.0132]
  },
  {
    symbol: "BTC-USDT",
    exchange: "Bybit",
    currentRate: 0.0110,
    nextRate: 0.0105,
    predictedRate: 0.0103,
    hourlyRate: 0.0110,
    dailyRate: 0.0330,
    annualizedRate: 12.05,
    timestamp: new Date(),
    averageVolume: 750000000,
    priceChange24h: 1.8,
    historicalRates: [0.008, 0.010, 0.011, 0.0110, 0.0108, 0.0112, 0.0110]
  },
  {
    symbol: "ETH-USDT",
    exchange: "Bybit",
    currentRate: 0.0120,
    nextRate: 0.0115,
    predictedRate: 0.0118,
    hourlyRate: 0.0120,
    dailyRate: 0.0360,
    annualizedRate: 13.14,
    timestamp: new Date(),
    averageVolume: 520000000,
    priceChange24h: 2.3,
    historicalRates: [0.009, 0.011, 0.012, 0.0120, 0.0118, 0.0122, 0.0120]
  }
];

// Exchange colors for visual identification
const exchangeColors: Record<string, string> = {
  "Binance": "#F3BA2F",
  "OKX": "#121212",
  "Bybit": "#FFDB4D",
  "Kraken": "#5741D9",
  "FTX": "#11A9BC",
  "dYdX": "#6966FF",
  "Bitmex": "#F7931A"
};

// Strategy descriptions for funding rate arbitrage
const fundingArbitrageStrategies = [
  {
    name: "Cross-exchange funding arbitrage",
    description: "Taking opposite positions on different exchanges to capture funding rate differentials",
    risk: "Medium",
    complexity: "Intermediate"
  },
  {
    name: "Funding rate harvesting",
    description: "Taking positions to collect positive funding rates while hedging market exposure",
    risk: "Low",
    complexity: "Beginner"
  },
  {
    name: "Basis trading with funding",
    description: "Exploiting differences between spot, futures, and funding rates",
    risk: "Medium",
    complexity: "Advanced"
  },
  {
    name: "Delta-neutral funding strategies",
    description: "Using options and futures to create delta-neutral positions that earn funding",
    risk: "High",
    complexity: "Advanced"
  }
];

// Interface for component props
interface FundingRatesDashboardProps {
  lastUpdated: Date;
}

export function FundingRatesDashboard({ lastUpdated }: FundingRatesDashboardProps) {
  const [timeframe, setTimeframe] = useState<"8h" | "24h" | "7d">("24h");
  const [sortBy, setSortBy] = useState<"currentRate" | "annualizedRate" | "priceChange24h" | "averageVolume">("annualizedRate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(["Binance", "OKX", "Bybit"]);
  const [activeTab, setActiveTab] = useState<"rates" | "opportunities" | "strategies">("rates");
  
  // Filter and sort funding rates
  const filteredRates = mockFundingRates
    .filter(rate => 
      (searchQuery === "" || rate.symbol.toLowerCase().includes(searchQuery.toLowerCase())) &&
      selectedExchanges.includes(rate.exchange)
    )
    .sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });
    
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(current => current === "asc" ? "desc" : "asc");
  };
    
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Percent className="h-4 w-4 mr-2 text-primary" />
              Average Funding Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Hourly Avg.</div>
                <div className="text-2xl font-bold">
                  {(mockFundingRates.reduce((acc, rate) => acc + rate.hourlyRate, 0) / mockFundingRates.length * 100).toFixed(3)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Daily Avg.</div>
                <div className="text-2xl font-bold">
                  {(mockFundingRates.reduce((acc, rate) => acc + rate.dailyRate, 0) / mockFundingRates.length * 100).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Annualized</div>
                <div className="text-base font-bold">
                  {(mockFundingRates.reduce((acc, rate) => acc + rate.annualizedRate, 0) / mockFundingRates.length).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Next Est.</div>
                <div className="text-base font-bold">
                  {(mockFundingRates.reduce((acc, rate) => acc + (rate.nextRate || 0), 0) / mockFundingRates.length * 100).toFixed(3)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <ArrowDownUp className="h-4 w-4 mr-2 text-primary" />
              Funding Arbitrage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Highest Spread</div>
                <div className="text-2xl font-bold text-crypto-green">0.023%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Opportunities</div>
                <div className="text-2xl font-bold">14</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Top Pair</div>
                <div className="text-base font-bold">ETH-USDT</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Est. Daily Yield</div>
                <div className="text-base font-bold text-crypto-green">8.4%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Funding Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground">Next Payment</div>
                  <div className="text-lg font-bold flex items-center gap-1">
                    <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20">Binance</Badge>
                    <span>12:00 UTC</span>
                  </div>
                </div>
                <div className="text-sm">in 32m</div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground">Following</div>
                  <div className="text-lg font-bold flex items-center gap-1">
                    <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/20">OKX</Badge>
                    <span>14:00 UTC</span>
                  </div>
                </div>
                <div className="text-sm">in 2h 32m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content with Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-medium">Funding Rates Analysis</CardTitle>
              <CardDescription>Real-time funding rates across major exchanges</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search symbols..."
                  className="w-full sm:w-[180px] pl-8 h-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue={timeframe} onValueChange={(value) => setTimeframe(value as "8h" | "24h" | "7d")}>
                <SelectTrigger className="w-[70px] h-9">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8h">8h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="rates" className="flex-1">Funding Rates</TabsTrigger>
              <TabsTrigger value="opportunities" className="flex-1">Arbitrage Opportunities</TabsTrigger>
              <TabsTrigger value="strategies" className="flex-1">Trading Strategies</TabsTrigger>
            </TabsList>
            
            {/* Funding Rates Tab */}
            <TabsContent value="rates" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 gap-2">
                <div className="flex flex-wrap gap-1">
                  {["Binance", "OKX", "Bybit"].map(exchange => (
                    <Badge 
                      key={exchange}
                      variant={selectedExchanges.includes(exchange) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedExchanges.includes(exchange)) {
                          if (selectedExchanges.length > 1) {
                            setSelectedExchanges(selectedExchanges.filter(e => e !== exchange));
                          }
                        } else {
                          setSelectedExchanges([...selectedExchanges, exchange]);
                        }
                      }}
                    >
                      {exchange}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left font-medium py-2 pl-2 pr-4">Symbol</th>
                      <th className="text-left font-medium py-2 px-4">Exchange</th>
                      <th 
                        className="text-right font-medium py-2 px-4 cursor-pointer"
                        onClick={() => {
                          setSortBy("currentRate");
                          if (sortBy === "currentRate") toggleSortDirection();
                        }}
                      >
                        <div className="flex items-center justify-end">
                          Current Rate
                          {sortBy === "currentRate" && 
                            <ArrowDownUp className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          }
                        </div>
                      </th>
                      <th className="text-right font-medium py-2 px-4">Next Est.</th>
                      <th 
                        className="text-right font-medium py-2 px-4 cursor-pointer"
                        onClick={() => {
                          setSortBy("annualizedRate");
                          if (sortBy === "annualizedRate") toggleSortDirection();
                        }}
                      >
                        <div className="flex items-center justify-end">
                          APR
                          {sortBy === "annualizedRate" && 
                            <ArrowDownUp className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          }
                        </div>
                      </th>
                      <th 
                        className="text-right font-medium py-2 px-4 cursor-pointer"
                        onClick={() => {
                          setSortBy("priceChange24h");
                          if (sortBy === "priceChange24h") toggleSortDirection();
                        }}
                      >
                        <div className="flex items-center justify-end">
                          24h Change
                          {sortBy === "priceChange24h" && 
                            <ArrowDownUp className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          }
                        </div>
                      </th>
                      <th 
                        className="text-right font-medium py-2 pl-4 pr-2 cursor-pointer"
                        onClick={() => {
                          setSortBy("averageVolume");
                          if (sortBy === "averageVolume") toggleSortDirection();
                        }}
                      >
                        <div className="flex items-center justify-end">
                          Volume (24h)
                          {sortBy === "averageVolume" && 
                            <ArrowDownUp className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          }
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRates.map((rate, index) => (
                      <tr key={`${rate.exchange}-${rate.symbol}`} className={`${index % 2 === 0 ? 'bg-muted/50' : ''} text-sm`}>
                        <td className="py-3 pl-2 pr-4 font-medium">{rate.symbol}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: exchangeColors[rate.exchange] || "#888" }}
                            />
                            {rate.exchange}
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${rate.currentRate > 0 ? 'text-crypto-green' : rate.currentRate < 0 ? 'text-crypto-red' : ''}`}>
                          {(rate.currentRate * 100).toFixed(4)}%
                        </td>
                        <td className={`py-3 px-4 text-right ${(rate.nextRate || 0) > 0 ? 'text-crypto-green' : (rate.nextRate || 0) < 0 ? 'text-crypto-red' : ''}`}>
                          {rate.nextRate ? (rate.nextRate * 100).toFixed(4) + '%' : '-'}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${rate.annualizedRate > 0 ? 'text-crypto-green' : rate.annualizedRate < 0 ? 'text-crypto-red' : ''}`}>
                          {rate.annualizedRate.toFixed(2)}%
                        </td>
                        <td className={`py-3 px-4 text-right ${rate.priceChange24h > 0 ? 'text-crypto-green' : rate.priceChange24h < 0 ? 'text-crypto-red' : ''}`}>
                          <div className="flex items-center justify-end">
                            {rate.priceChange24h > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : 
                             rate.priceChange24h < 0 ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
                            {rate.priceChange24h > 0 ? '+' : ''}{rate.priceChange24h}%
                          </div>
                        </td>
                        <td className="py-3 pl-4 pr-2 text-right">
                          ${(rate.averageVolume / 1000000).toFixed(0)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            {/* Arbitrage Opportunities Tab */}
            <TabsContent value="opportunities">
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                <div className="text-center max-w-md px-4">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Funding Rate Arbitrage Analysis</h3>
                  <p className="text-muted-foreground">
                    This feature will show cross-exchange funding rate arbitrage opportunities, 
                    enabling you to profit from rate differentials with detailed risk and capital efficiency metrics.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Coming in the next update</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Trading Strategies Tab */}
            <TabsContent value="strategies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fundingArbitrageStrategies.map((strategy, index) => (
                  <Card key={index} className="bg-muted/30 border">
                    <CardContent className="pt-6">
                      <h3 className="text-base font-medium mb-2">{strategy.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                      <div className="flex justify-between">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          Risk: {strategy.risk}
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Zap className="h-3 w-3" />
                          Complexity: {strategy.complexity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 