import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, RefreshCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Exchange volume heatmap colors
const getVolumeColor = (volume: number): string => {
  if (volume > 10000000000) return "bg-crypto-green opacity-90";
  if (volume > 5000000000) return "bg-crypto-green opacity-70";
  if (volume > 2000000000) return "bg-crypto-green opacity-50";
  if (volume > 1000000000) return "bg-crypto-blue opacity-70";
  if (volume > 500000000) return "bg-crypto-blue opacity-50";
  if (volume > 100000000) return "bg-crypto-yellow opacity-50";
  return "bg-crypto-red opacity-30";
};

// Exchange cell component
const ExchangeCell = ({ exchange, volume, change }: { 
  exchange: string;
  volume: number;
  change: number;
}) => {
  const formattedVolume = (volume / 1000000000).toFixed(1);
  
  return (
    <div className={cn(
      "rounded-md border border-border/30 p-2 transition-all hover:border-primary/50",
      getVolumeColor(volume)
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{exchange}</span>
        <Badge 
          variant={change >= 0 ? "outline" : "destructive"} 
          className="text-[10px] px-1 py-0 h-4"
        >
          {change >= 0 ? "+" : ""}{change}%
        </Badge>
      </div>
      <div className="text-lg font-bold">${formattedVolume}B</div>
    </div>
  );
};

// Real-time data simulation
const useRealTimeData = (initialData, updateInterval = 20000) => {
  const intervalRef = useRef(null);
  const dataRef = useRef(initialData);
  
  useEffect(() => {
    // Simulate data updates
    intervalRef.current = setInterval(() => {
      dataRef.current = dataRef.current.map(item => ({
        ...item,
        volume24h: item.volume24h * (1 + (Math.random() * 0.06 - 0.03)),
        change24h: item.change24h + (Math.random() * 2 - 1),
      }));
    }, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialData, updateInterval]);
  
  return dataRef;
};

export const ExchangeVolumeHeatmap = ({ exchangeVolumes, onRefresh }) => {
  const dataRef = useRealTimeData(exchangeVolumes);
  
  const refreshData = () => {
    onRefresh(dataRef.current);
  };
  
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Exchange Volume Heatmap</CardTitle>
          <CardDescription>Trading volume across major exchanges (24h)</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  Volume shown in billions USD. Green indicates higher volume, red indicates lower volume.
                  Data updates in real-time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm" onClick={refreshData} className="h-8 gap-1">
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {exchangeVolumes.map((item) => (
            <ExchangeCell 
              key={item.exchange}
              exchange={item.exchange}
              volume={item.volume24h}
              change={item.change24h}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
