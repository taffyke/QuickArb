import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  LineChart,
  BarChart4,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Info,
  AlertCircle,
  Percent,
  RefreshCw
} from "lucide-react";

// Mock data - in a real app, this would come from an API
const marketOverviewData = {
  totalVolume24h: 128.4, // in billions
  totalMarketCap: 2.35, // in trillions
  btcDominance: 51.3, // percentage
  ethDominance: 18.4, // percentage
  activeMarkets: 912,
  avgSpread: 1.34, // percentage
  arbitrageOppCount: 248,
  topArbitrageSpread: 5.12, // percentage
  volatility24h: 2.8, // percentage
  fearGreedIndex: 65, // 0-100 scale
  trendingCoins: [
    { symbol: "BTC", name: "Bitcoin", price: 67842.31, change24h: 2.4 },
    { symbol: "ETH", name: "Ethereum", price: 3422.15, change24h: 1.2 },
    { symbol: "SOL", name: "Solana", price: 129.87, change24h: 4.7 },
    { symbol: "BNB", name: "Binance Coin", price: 568.32, change24h: -0.8 },
    { symbol: "XRP", name: "XRP", price: 0.5231, change24h: -1.5 }
  ],
  exchangeStats: [
    { name: "Binance", volume24h: 28.5, marketShare: 22.2, change24h: 1.8 },
    { name: "Coinbase", volume24h: 9.2, marketShare: 7.2, change24h: -0.5 },
    { name: "OKX", volume24h: 7.8, marketShare: 6.1, change24h: 3.2 },
    { name: "Bybit", volume24h: 6.3, marketShare: 4.9, change24h: 5.4 },
    { name: "Kraken", volume24h: 4.2, marketShare: 3.3, change24h: 0.9 }
  ]
};

// Types for the component props
interface MarketAnalysisHubProps {
  lastUpdated: Date;
}

export function MarketAnalysisHub({ lastUpdated }: MarketAnalysisHubProps) {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [marketData, setMarketData] = useState(marketOverviewData);
  
  return (
    <div className="space-y-6">
      {/* Market Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="text-2xl font-bold">${marketData.totalVolume24h}B</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="text-2xl font-bold">${marketData.totalMarketCap}T</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">BTC Dominance</div>
                <div className="text-base font-bold">{marketData.btcDominance}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">ETH Dominance</div>
                <div className="text-base font-bold">{marketData.ethDominance}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              Arbitrage Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Avg. Spread</div>
                <div className="text-2xl font-bold">{marketData.avgSpread}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Opportunities</div>
                <div className="text-2xl font-bold">{marketData.arbitrageOppCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Top Spread</div>
                <div className="text-base font-bold text-crypto-green">{marketData.topArbitrageSpread}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active Markets</div>
                <div className="text-base font-bold">{marketData.activeMarkets}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <BarChart4 className="h-4 w-4 mr-2 text-primary" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">Fear & Greed Index</div>
              <div className="relative w-full h-4 bg-secondary/50 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ 
                    width: `${marketData.fearGreedIndex}%`,
                    background: `linear-gradient(90deg, 
                      ${marketData.fearGreedIndex < 25 ? 'rgb(239, 68, 68)' : 
                      marketData.fearGreedIndex < 45 ? 'rgb(234, 179, 8)' : 
                      marketData.fearGreedIndex < 55 ? 'rgb(234, 179, 8)' : 
                      marketData.fearGreedIndex < 75 ? 'rgb(34, 197, 94)' : 'rgb(34, 197, 94)'}
                    )`
                  }}
                />
              </div>
              <div className="w-full flex justify-between text-xs text-muted-foreground">
                <span>Extreme Fear</span>
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
                <span>Extreme Greed</span>
              </div>
              
              <div className="mt-3 text-lg font-bold">
                {marketData.fearGreedIndex < 25 ? 'Extreme Fear' : 
                 marketData.fearGreedIndex < 45 ? 'Fear' : 
                 marketData.fearGreedIndex < 55 ? 'Neutral' : 
                 marketData.fearGreedIndex < 75 ? 'Greed' : 'Extreme Greed'}
                 <span className="ml-2 text-sm font-normal text-muted-foreground">({marketData.fearGreedIndex})</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Percent className="h-4 w-4 mr-2 text-primary" />
              24h Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">24h Volatility</div>
                <div className="text-2xl font-bold">{marketData.volatility24h}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Arbitrage Vol.</div>
                <div className="text-2xl font-bold">${(marketData.totalVolume24h * 0.08).toFixed(1)}B</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">BTC 24h</div>
                <div className="flex items-center text-base font-bold text-crypto-green">
                  <ArrowUpIcon className="h-3.5 w-3.5 mr-0.5" />
                  {marketData.trendingCoins[0].change24h}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">ETH 24h</div>
                <div className="flex items-center text-base font-bold text-crypto-green">
                  <ArrowUpIcon className="h-3.5 w-3.5 mr-0.5" />
                  {marketData.trendingCoins[1].change24h}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Middle section with tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Arbitrage Opportunity Distribution
              </CardTitle>
              <Select defaultValue="24h" onValueChange={(value) => setTimeframe(value as "24h" | "7d" | "30d")}>
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Arbitrage spread distribution chart will render here</p>
                <p className="text-xs text-muted-foreground mt-1">Showing data across CEX and DEX exchanges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Trending Coins
            </CardTitle>
            <CardDescription>Top cryptocurrencies by price action</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6">
              <div className="grid grid-cols-3 py-2 text-xs text-muted-foreground border-b">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
              </div>
            </div>
            <div className="space-y-1 pt-1">
              {marketData.trendingCoins.map((coin) => (
                <div 
                  key={coin.symbol} 
                  className="grid grid-cols-3 py-2 px-6 hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="font-medium">{coin.symbol}</div>
                  </div>
                  <div className="text-right font-mono">
                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-right ${coin.change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Exchange ranking section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">Top Exchanges by 24h Volume</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-3 font-medium">Rank</th>
                  <th className="text-left py-3 font-medium">Exchange</th>
                  <th className="text-right py-3 font-medium">24h Volume</th>
                  <th className="text-right py-3 font-medium">Market Share</th>
                  <th className="text-right py-3 font-medium">Change (24h)</th>
                  <th className="text-right py-3 font-medium">Arb. Opportunities</th>
                </tr>
              </thead>
              <tbody>
                {marketData.exchangeStats.map((exchange, index) => (
                  <tr key={exchange.name} className="border-b hover:bg-muted/30">
                    <td className="py-3 text-left">{index + 1}</td>
                    <td className="py-3 text-left font-medium">{exchange.name}</td>
                    <td className="py-3 text-right">${exchange.volume24h.toFixed(1)}B</td>
                    <td className="py-3 text-right">{exchange.marketShare.toFixed(1)}%</td>
                    <td className={`py-3 text-right ${exchange.change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {exchange.change24h >= 0 ? '+' : ''}{exchange.change24h}%
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className="bg-primary/10 text-primary font-mono">
                        {Math.floor(Math.random() * 40) + 10}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 