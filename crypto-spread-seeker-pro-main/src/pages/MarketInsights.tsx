import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RefreshCcw, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Market Insight Types
interface ExchangeVolume {
  exchange: string;
  volume24h: number;
  change24h: number;
}

interface ArbitrageMetric {
  date: string;
  averageSpread: number;
  opportunityCount: number;
  totalVolume: number;
}

interface TopArbitrageOpportunity {
  pair: string;
  fromExchange: string;
  toExchange: string;
  spreadPercent: number;
  volume24h: number;
}

interface MarketSentiment {
  bullish: number;
  bearish: number;
  neutral: number;
  timestamp: Date;
}

export default function MarketInsights() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Mock data for exchange volumes
  const exchangeVolumes: ExchangeVolume[] = [
    { exchange: "Binance", volume24h: 12500000000, change24h: 5.2 },
    { exchange: "Coinbase", volume24h: 4800000000, change24h: -2.1 },
    { exchange: "Kraken", volume24h: 2100000000, change24h: 1.8 },
    { exchange: "KuCoin", volume24h: 1800000000, change24h: 3.5 },
    { exchange: "OKX", volume24h: 3200000000, change24h: 0.9 },
    { exchange: "Bybit", volume24h: 2800000000, change24h: 4.7 },
    { exchange: "Huobi", volume24h: 1500000000, change24h: -1.3 },
    { exchange: "Gate.io", volume24h: 950000000, change24h: 2.2 },
  ];
  
  // Mock data for arbitrage metrics over time
  const arbitrageMetrics: ArbitrageMetric[] = [
    { date: "Apr 11", averageSpread: 1.2, opportunityCount: 156, totalVolume: 850000000 },
    { date: "Apr 12", averageSpread: 1.3, opportunityCount: 142, totalVolume: 920000000 },
    { date: "Apr 13", averageSpread: 1.5, opportunityCount: 178, totalVolume: 1050000000 },
    { date: "Apr 14", averageSpread: 1.4, opportunityCount: 165, totalVolume: 980000000 },
    { date: "Apr 15", averageSpread: 1.2, opportunityCount: 149, totalVolume: 870000000 },
    { date: "Apr 16", averageSpread: 1.1, opportunityCount: 137, totalVolume: 790000000 },
    { date: "Apr 17", averageSpread: 1.3, opportunityCount: 152, totalVolume: 930000000 },
    { date: "Apr 18", averageSpread: 1.6, opportunityCount: 189, totalVolume: 1120000000 },
  ];
  
  // Mock data for top arbitrage opportunities
  const topOpportunities: TopArbitrageOpportunity[] = [
    { pair: "BTC/USDT", fromExchange: "Binance", toExchange: "Coinbase", spreadPercent: 1.8, volume24h: 450000000 },
    { pair: "ETH/USDT", fromExchange: "KuCoin", toExchange: "Kraken", spreadPercent: 1.6, volume24h: 280000000 },
    { pair: "SOL/USDT", fromExchange: "Bybit", toExchange: "OKX", spreadPercent: 2.2, volume24h: 120000000 },
    { pair: "XRP/USDT", fromExchange: "Huobi", toExchange: "Gate.io", spreadPercent: 2.5, volume24h: 85000000 },
    { pair: "BNB/USDT", fromExchange: "Binance", toExchange: "KuCoin", spreadPercent: 1.4, volume24h: 210000000 },
  ];
  
  // Mock data for market sentiment
  const marketSentiment: MarketSentiment = {
    bullish: 58,
    bearish: 22,
    neutral: 20,
    timestamp: new Date()
  };
  
  // Chart data for arbitrage metrics
  const spreadChartData = {
    labels: arbitrageMetrics.map(metric => metric.date),
    datasets: [
      {
        label: 'Average Spread %',
        data: arbitrageMetrics.map(metric => metric.averageSpread),
        borderColor: 'rgb(0, 227, 150)',
        backgroundColor: 'rgba(0, 227, 150, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const opportunityChartData = {
    labels: arbitrageMetrics.map(metric => metric.date),
    datasets: [
      {
        label: 'Opportunity Count',
        data: arbitrageMetrics.map(metric => metric.opportunityCount),
        backgroundColor: 'rgba(0, 177, 242, 0.7)',
        borderColor: 'rgb(0, 177, 242)',
        borderWidth: 1,
      },
    ],
  };
  
  const volumeChartData = {
    labels: exchangeVolumes.slice(0, 5).map(vol => vol.exchange),
    datasets: [
      {
        label: '24h Volume (USD)',
        data: exchangeVolumes.slice(0, 5).map(vol => vol.volume24h / 1000000000),
        backgroundColor: [
          'rgba(0, 227, 150, 0.7)',
          'rgba(0, 177, 242, 0.7)',
          'rgba(254, 176, 25, 0.7)',
          'rgba(255, 59, 105, 0.7)',
          'rgba(119, 93, 208, 0.7)',
        ],
        borderColor: [
          'rgb(0, 227, 150)',
          'rgb(0, 177, 242)',
          'rgb(254, 176, 25)',
          'rgb(255, 59, 105)',
          'rgb(119, 93, 208)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const sentimentChartData = {
    labels: ['Bullish', 'Bearish', 'Neutral'],
    datasets: [
      {
        label: 'Market Sentiment',
        data: [marketSentiment.bullish, marketSentiment.bearish, marketSentiment.neutral],
        backgroundColor: [
          'rgba(0, 227, 150, 0.7)',
          'rgba(255, 59, 105, 0.7)',
          'rgba(254, 176, 25, 0.7)',
        ],
        borderColor: [
          'rgb(0, 227, 150)',
          'rgb(255, 59, 105)',
          'rgb(254, 176, 25)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };
  
  // Handle refresh
  const handleRefresh = () => {
    // In a real app, this would fetch new data
    setLastRefreshed(new Date());
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Insights</h1>
            <p className="text-muted-foreground">
              Advanced analytics and market data for arbitrage opportunities
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Select value={timeframe} onValueChange={(value: "24h" | "7d" | "30d") => setTimeframe(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Spread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{arbitrageMetrics[arbitrageMetrics.length - 1].averageSpread.toFixed(2)}%</div>
                <Badge variant={arbitrageMetrics[arbitrageMetrics.length - 1].averageSpread > arbitrageMetrics[arbitrageMetrics.length - 2].averageSpread ? "default" : "secondary"}>
                  {arbitrageMetrics[arbitrageMetrics.length - 1].averageSpread > arbitrageMetrics[arbitrageMetrics.length - 2].averageSpread ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs((arbitrageMetrics[arbitrageMetrics.length - 1].averageSpread / arbitrageMetrics[arbitrageMetrics.length - 2].averageSpread - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Opportunities Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{arbitrageMetrics[arbitrageMetrics.length - 1].opportunityCount}</div>
                <Badge variant={arbitrageMetrics[arbitrageMetrics.length - 1].opportunityCount > arbitrageMetrics[arbitrageMetrics.length - 2].opportunityCount ? "default" : "secondary"}>
                  {arbitrageMetrics[arbitrageMetrics.length - 1].opportunityCount > arbitrageMetrics[arbitrageMetrics.length - 2].opportunityCount ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs((arbitrageMetrics[arbitrageMetrics.length - 1].opportunityCount / arbitrageMetrics[arbitrageMetrics.length - 2].opportunityCount - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${(arbitrageMetrics[arbitrageMetrics.length - 1].totalVolume / 1000000000).toFixed(2)}B</div>
                <Badge variant={arbitrageMetrics[arbitrageMetrics.length - 1].totalVolume > arbitrageMetrics[arbitrageMetrics.length - 2].totalVolume ? "default" : "secondary"}>
                  {arbitrageMetrics[arbitrageMetrics.length - 1].totalVolume > arbitrageMetrics[arbitrageMetrics.length - 2].totalVolume ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs((arbitrageMetrics[arbitrageMetrics.length - 1].totalVolume / arbitrageMetrics[arbitrageMetrics.length - 2].totalVolume - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {marketSentiment.bullish > 50 ? "Bullish" : marketSentiment.bearish > 50 ? "Bearish" : "Neutral"}
                </div>
                <Badge variant={marketSentiment.bullish > 50 ? "default" : marketSentiment.bearish > 50 ? "destructive" : "secondary"}>
                  {marketSentiment.bullish}% / {marketSentiment.bearish}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-3">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="exchanges">Exchange Analysis</TabsTrigger>
            <TabsTrigger value="opportunities">Top Opportunities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spread Trend</CardTitle>
                  <CardDescription>Average arbitrage spread over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <Line options={lineChartOptions} data={spreadChartData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Opportunity Count</CardTitle>
                  <CardDescription>Number of arbitrage opportunities detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <Bar options={barChartOptions} data={opportunityChartData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exchange Volume Distribution</CardTitle>
                  <CardDescription>Top 5 exchanges by 24h trading volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <Pie options={pieChartOptions} data={volumeChartData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Sentiment Analysis</CardTitle>
                  <CardDescription>Current market sentiment distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <Pie options={pieChartOptions} data={sentimentChartData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="exchanges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exchange Volume Comparison</CardTitle>
                <CardDescription>24h trading volume and change across major exchanges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exchangeVolumes.map((exchange) => (
                    <div key={exchange.exchange} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exchange.exchange}</div>
                        <div className="flex items-center gap-2">
                          <span>${(exchange.volume24h / 1000000000).toFixed(2)}B</span>
                          <Badge variant={exchange.change24h > 0 ? "default" : "destructive"} className="ml-2">
                            {exchange.change24h > 0 ? "+" : ""}{exchange.change24h.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={exchange.volume24h / 125000000} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exchange Reliability</CardTitle>
                  <CardDescription>Uptime and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Binance</div>
                        <div>99.8%</div>
                      </div>
                      <Progress value={99.8} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Coinbase</div>
                        <div>99.5%</div>
                      </div>
                      <Progress value={99.5} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Kraken</div>
                        <div>99.9%</div>
                      </div>
                      <Progress value={99.9} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">KuCoin</div>
                        <div>99.7%</div>
                      </div>
                      <Progress value={99.7} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">OKX</div>
                        <div>99.6%</div>
                      </div>
                      <Progress value={99.6} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fee Comparison</CardTitle>
                  <CardDescription>Trading fees across major exchanges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 text-xs sm:text-sm font-medium text-muted-foreground">
                      <div>Exchange</div>
                      <div>Maker Fee</div>
                      <div>Taker Fee</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">Binance</div>
                      <div>0.10%</div>
                      <div>0.10%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">Coinbase</div>
                      <div>0.40%</div>
                      <div>0.60%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">Kraken</div>
                      <div>0.16%</div>
                      <div>0.26%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">KuCoin</div>
                      <div>0.10%</div>
                      <div>0.10%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">OKX</div>
                      <div>0.08%</div>
                      <div>0.10%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">Bybit</div>
                      <div>0.10%</div>
                      <div>0.10%</div>
                    </div>
                    <div className="grid grid-cols-3 text-xs sm:text-sm">
                      <div className="font-medium">Huobi</div>
                      <div>0.20%</div>
                      <div>0.20%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Arbitrage Opportunities</CardTitle>
                <CardDescription>Highest spread opportunities across exchanges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topOpportunities.map((opportunity, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{opportunity.pair}</div>
                            <div className="text-sm text-muted-foreground">
                              {opportunity.fromExchange} → {opportunity.toExchange}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-crypto-green">{opportunity.spreadPercent.toFixed(2)}%</div>
                          <div className="text-sm text-muted-foreground">
                            ${(opportunity.volume24h / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <Progress value={opportunity.spreadPercent * 20} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Opportunity by Pair</CardTitle>
                  <CardDescription>Most profitable cryptocurrency pairs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">BTC/USDT</div>
                        <div>1.8% avg</div>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">ETH/USDT</div>
                        <div>1.6% avg</div>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">SOL/USDT</div>
                        <div>2.2% avg</div>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">XRP/USDT</div>
                        <div>2.5% avg</div>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">BNB/USDT</div>
                        <div>1.4% avg</div>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Opportunity by Exchange Pair</CardTitle>
                  <CardDescription>Most profitable exchange combinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Binance → Coinbase</div>
                        <div>1.8% avg</div>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">KuCoin → Kraken</div>
                        <div>1.6% avg</div>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Bybit → OKX</div>
                        <div>2.2% avg</div>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Huobi → Gate.io</div>
                        <div>2.5% avg</div>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Binance → KuCoin</div>
                        <div>1.4% avg</div>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
