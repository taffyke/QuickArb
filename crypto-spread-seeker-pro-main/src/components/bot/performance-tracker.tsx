
import { useEffect, useState } from "react";
import { 
  BarChart as BarChartIcon, 
  Calendar, 
  ChevronDown, 
  DollarSign, 
  Info, 
  Percent, 
  Sigma, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate mock performance data
const generatePerformanceData = () => {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(currentDate.getDate() - i);
    
    // Generate random profit with some trending
    const baseProfit = 100 + (Math.sin(i / 5) * 30);
    const profit = baseProfit + (Math.random() - 0.5) * 100;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: Math.round(profit),
      trades: Math.floor(Math.random() * 15) + 1,
      winRate: Math.round(50 + (Math.random() - 0.5) * 40),
    });
  }
  
  return data;
};

// Generate mock trade history
const generateTradeHistory = (count = 10) => {
  const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"];
  const exchanges = ["Binance", "Coinbase", "Kraken", "KuCoin", "Bybit"];
  const strategies = ["MA Crossover", "RSI Bounce", "Breakout", "Scalping"];
  
  return Array.from({ length: count }, (_, i) => {
    const isWin = Math.random() > 0.4;
    const entryPrice = 1000 + Math.random() * 50000;
    const percentChange = (Math.random() * 5) * (isWin ? 1 : -1);
    const exitPrice = entryPrice * (1 + percentChange / 100);
    const profit = exitPrice - entryPrice;
    
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 72));
    
    return {
      id: `trade-${i + 1}`,
      date: date.toLocaleString(),
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      type: Math.random() > 0.5 ? "Buy" : "Sell",
      exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      entryPrice: entryPrice.toFixed(2),
      exitPrice: exitPrice.toFixed(2),
      profit: profit.toFixed(2),
      percentChange: percentChange.toFixed(2),
      status: isWin ? "Win" : "Loss",
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function PerformanceTracker() {
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [tradeHistory, setTradeHistory] = useState(generateTradeHistory());
  const [timeframe, setTimeframe] = useState("30d");
  
  // Calculate summary metrics
  const totalProfit = performanceData.reduce((acc, item) => acc + item.profit, 0);
  const totalTrades = performanceData.reduce((acc, item) => acc + item.trades, 0);
  const avgWinRate = Math.round(
    performanceData.reduce((acc, item) => acc + item.winRate, 0) / performanceData.length
  );
  
  // Calculate best and worst trade
  const sortedByProfit = [...tradeHistory].sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));
  const bestTrade = sortedByProfit[0];
  const worstTrade = sortedByProfit[sortedByProfit.length - 1];
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Performance Metrics</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Total P&L</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold">${totalProfit}</div>
            <div className="text-xs text-green-500">
              +{(totalProfit / 10000 * 100).toFixed(2)}% Total Return
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Win Rate</span>
              <Percent className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold">{avgWinRate}%</div>
            <div className="text-xs text-muted-foreground">
              {Math.round(avgWinRate * totalTrades / 100)} / {totalTrades} Trades
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Avg. Trade</span>
              <Sigma className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold">${(totalProfit / totalTrades).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Per Completed Trade
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Best Day</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-lg font-bold">
              ${Math.max(...performanceData.map(d => d.profit))}
            </div>
            <div className="text-xs text-muted-foreground">
              {performanceData.reduce((max, item) => 
                item.profit > performanceData[max].profit ? performanceData.indexOf(item) : max, 0
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="profit" className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profit">Profit Chart</TabsTrigger>
            <TabsTrigger value="trades">Trade Count</TabsTrigger>
            <TabsTrigger value="winrate">Win Rate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profit" className="mt-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickMargin={10} 
                    tick={{ fontSize: 12 }}
                    minTickGap={15}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Profit']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trades" className="mt-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickMargin={10} 
                    tick={{ fontSize: 12 }}
                    minTickGap={15}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Trades']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="trades" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="winrate" className="mt-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickMargin={10} 
                    tick={{ fontSize: 12 }}
                    minTickGap={15}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Win Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="winrate" 
                    stroke="#0EA5E9" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Recent Trades</h3>
            <span className="text-xs text-muted-foreground">Last 10 trades</span>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Strategy</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeHistory.slice(0, 5).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>{new Date(trade.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{trade.pair}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell className="hidden md:table-cell">{trade.strategy}</TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(trade.profit) >= 0 ? "text-green-500" : "text-red-500"}>
                        ${parseFloat(trade.profit).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        trade.status === "Win" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {trade.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Best Trade</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pair</span>
                  <span className="text-sm font-medium">{bestTrade.pair}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Strategy</span>
                  <span className="text-sm font-medium">{bestTrade.strategy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit</span>
                  <span className="text-sm font-medium text-green-500">
                    ${parseFloat(bestTrade.profit).toLocaleString()} ({bestTrade.percentChange}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Trading Stats</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Win Streak</span>
                  <span className="text-sm font-medium">4 trades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Hold Time</span>
                  <span className="text-sm font-medium">3.5 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Risk-Reward</span>
                  <span className="text-sm font-medium">1:2.3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
