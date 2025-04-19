import { useState, useEffect } from "react";
import { ExchangeVolume, Exchange } from "@/contexts/crypto-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, PieChart as PieChartIcon, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exchanges as exchangesConfig } from "@/constants/exchanges";

type ExchangeVolumeChartProps = {
  data: ExchangeVolume[];
  className?: string;
};

// Type for chart data items
interface ChartDataItem {
  id: string;
  name: string; // Using string instead of Exchange since we need to include "Others"
  value: number;
  color: string;
  logo: string;
}

// Custom colors for pie chart segments
const COLORS = [
  "#1a73e8", "#4285f4", "#5e97f6", "#7baaf7", "#a4c2f9", "#c6dafc", 
  "#34a853", "#57bb8a", "#7dcea0", "#a1e1b7", "#c6f4ce", 
  "#ea4335", "#eb675b", "#f18981", "#f7ada7", "#fcd2cf",
  "#fbbc04", "#fcc934", "#fdd663", "#fee48f", "#fff2bf",
  "#9334e6", "#a35fec", "#b38af2", "#c3b3f7", "#d4d2fc"
];

// Get the list of valid exchange names
const validExchangeNames = exchangesConfig.map(ex => ex.name) as Exchange[];

export function ExchangeVolumeChart({ data, className }: ExchangeVolumeChartProps) {
  const [chartMetric, setChartMetric] = useState<"volume24h" | "change24h" | "pairCount">("volume24h");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [displayCount, setDisplayCount] = useState<number>(15);
  const [normalizedData, setNormalizedData] = useState<ExchangeVolume[]>(data);
  
  // Ensure data includes all exchanges from the constants
  useEffect(() => {
    // Create a map of current data by exchange name
    const dataMap = data.reduce((acc, item) => {
      acc[item.exchange] = item;
      return acc;
    }, {} as Record<string, ExchangeVolume>);
    
    // Add any missing exchanges with default values
    const enhancedData = [...data];
    
    // Only add exchanges that are in our valid Exchange type
    exchangesConfig.forEach(exchange => {
      // Check if the exchange name is a valid Exchange type
      if (validExchangeNames.includes(exchange.name as Exchange) && !dataMap[exchange.name as Exchange]) {
        enhancedData.push({
          exchange: exchange.name as Exchange,
          volume24h: 0,
          change24h: 0,
          pairCount: 0,
        });
      }
    });
    
    setNormalizedData(enhancedData);
  }, [data]);
  
  // Sort data by the selected metric
  const sortedData = [...normalizedData]
    .sort((a, b) => 
      chartMetric === "change24h" 
        ? b[chartMetric] - a[chartMetric] 
        : b[chartMetric] - a[chartMetric]
    );

  // Get top N exchanges by display count
  const topExchanges = sortedData.slice(0, displayCount);

  // Calculate "Others" category if there are more exchanges than what we're displaying
  const otherExchanges = sortedData.slice(displayCount);
  
  // Format data for the chart
  const chartData: ChartDataItem[] = topExchanges.map((item, index) => {
    // Find the corresponding exchange for logo
    const exchangeInfo = exchangesConfig.find(ex => ex.name === item.exchange) || {
      id: item.exchange.toLowerCase(),
      name: item.exchange,
      logo: ""
    };
    
    return {
      id: exchangeInfo.id,
      name: item.exchange,
      value: chartMetric === "volume24h" 
        ? item.volume24h / 1000000 // Convert to millions
        : chartMetric === "change24h"
        ? item.change24h
        : item.pairCount,
      color: COLORS[index % COLORS.length],
      logo: exchangeInfo.logo
    };
  });

  // Add "Others" category to pie chart if needed
  if (chartType === "pie" && otherExchanges.length > 0) {
    const otherValue = otherExchanges.reduce((total, item) => 
      total + (chartMetric === "volume24h" 
        ? item.volume24h / 1000000 
        : chartMetric === "change24h"
        ? item.change24h
        : item.pairCount), 0);
        
    chartData.push({
      id: "others",
      name: "Others", // This is a string, not an Exchange type
      value: otherValue,
      color: "#9e9e9e",
      logo: ""
    });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-sm text-sm">
          <div className="flex items-center gap-2 mb-1">
            {data.logo && (
              <div className="w-4 h-4 flex items-center justify-center overflow-hidden rounded-sm bg-card">
                <img 
                  src={data.logo} 
                  alt={data.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="font-medium">{data.name}</p>
          </div>
          <p className="crypto-mono">
            {chartMetric === "volume24h" 
              ? `$${data.value?.toFixed(1)}M` 
              : chartMetric === "change24h"
              ? `${data.value?.toFixed(2)}%`
              : data.value?.toString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const getYAxisLabel = () => {
    switch (chartMetric) {
      case "volume24h":
        return "Volume (Millions USD)";
      case "change24h":
        return "24h Change (%)";
      case "pairCount":
        return "Number of Pairs";
      default:
        return "";
    }
  };

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 'auto']}
              tickFormatter={(value) => 
                chartMetric === "volume24h" 
                  ? `$${value}M` 
                  : chartMetric === "change24h"
                  ? `${value}%`
                  : value.toString()
              }
            />
            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              barSize={20}
              fillOpacity={0.8}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className={cn("col-span-2", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chartType === "bar" ? (
              <BarChart3 className="h-5 w-5 text-primary" />
            ) : (
              <PieChartIcon className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-sm font-medium">Exchange Comparison</CardTitle>
          </div>
          <div className="flex gap-2">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as "bar" | "pie")}>
              <TabsList className="h-8">
                <TabsTrigger value="bar" className="px-2 h-7">
                  <BarChart3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="pie" className="px-2 h-7">
                  <PieChartIcon className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select 
              value={chartMetric} 
              onValueChange={(value) => setChartMetric(value as any)}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume24h">24h Volume</SelectItem>
                <SelectItem value="change24h">24h Change %</SelectItem>
                <SelectItem value="pairCount">Pair Count</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={displayCount.toString()} 
              onValueChange={(value) => setDisplayCount(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="15">Top 15</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="25">Top 25</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          {chartType === "bar" ? "Top" : ""} {displayCount} exchanges by {chartMetric === "volume24h" 
            ? "24-hour trading volume" 
            : chartMetric === "change24h"
            ? "24-hour change percentage"
            : "supported trading pairs"}
          {otherExchanges.length > 0 && chartType === "pie" && ` (+ ${otherExchanges.length} more grouped as "Others")`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="h-[320px] w-full">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}
