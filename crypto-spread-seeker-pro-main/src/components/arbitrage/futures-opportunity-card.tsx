import { FuturesOpportunity, NetworkInfo } from "@/contexts/crypto-context";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronsUpDown, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Hourglass, 
  LineChart,
  Network,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FuturesOpportunityCardProps = {
  opportunity: FuturesOpportunity;
  rank?: number;
  expanded?: boolean;
  onExecute?: (opportunity: FuturesOpportunity) => void;
};

export function FuturesOpportunityCard({
  opportunity,
  rank,
  expanded = false,
  onExecute
}: FuturesOpportunityCardProps) {
  const {
    exchange,
    pair,
    fundingRate,
    fundingInterval,
    spotPrice,
    futuresPrice,
    spreadPercent,
    timestamp,
    estimatedProfit,
    fees,
    netProfit,
    networks,
    bestNetwork
  } = opportunity;

  // Format timestamp
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Determine if premium or discount
  const isPremium = futuresPrice > spotPrice;
  const fundingRateDisplay = `${fundingRate > 0 ? '+' : ''}${(fundingRate * 100).toFixed(4)}%`;

  // Format network congestion indicator
  const getCongestionColor = (congestion: string) => {
    switch(congestion) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Handle exchange link click to open exchange in new tab
  const handleExchangeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking exchange
    let url = '';
    
    // Map exchange names to their URLs
    switch(exchange) {
      case 'Binance':
        url = `https://www.binance.com/en/futures/${pair.replace('/', '')}`;
        break;
      case 'Bybit':
        url = `https://www.bybit.com/trade/usdt/${pair.replace('/', '')}`;
        break;
      case 'OKX':
        url = `https://www.okx.com/trade-swap/${pair.replace('/', '-').toLowerCase()}-swap`;
        break;
      default:
        url = `https://${exchange.toLowerCase()}.com`;
    }
    
    window.open(url, '_blank');
  };

  // Handle execute button click
  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExecute) {
      onExecute(opportunity);
    }
  };

  return (
    <Card 
      className={cn(
        "opportunity-card transition-all",
        expanded ? "col-span-2" : "", 
        rank && rank <= 3 ? "border-primary/20" : "",
        Math.abs(spreadPercent) >= 0.5 || Math.abs(fundingRate) >= 0.001 ? "bg-success/5 dark:bg-success/10" : ""
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {rank && (
              <Badge 
                variant="outline" 
                className={cn(
                  "mr-2 h-6 w-6 rounded-full p-0 flex items-center justify-center",
                  rank <= 3 ? "bg-primary/10 text-primary border-primary/30" : ""
                )}
              >
                {rank}
              </Badge>
            )}
            <CardTitle className="text-sm font-medium">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span 
                      className="cursor-pointer hover:underline" 
                      onClick={handleExchangeClick}
                    >
                      {exchange}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open {exchange} for {pair}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ChevronsUpDown className="inline h-3 w-3 mx-1" /> Futures/Spot
            </CardTitle>
          </div>
          <Badge 
            variant={Math.abs(spreadPercent) >= 0.5 ? "default" : "outline"} 
            className={cn(
              "capitalize",
              isPremium ? "bg-crypto-blue/20 hover:bg-crypto-blue/30 text-crypto-blue" : 
                         "bg-crypto-yellow/20 hover:bg-crypto-yellow/30 text-crypto-yellow"
            )}
          >
            {isPremium ? "Premium" : "Discount"} {Math.abs(spreadPercent).toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <LineChart className="mr-1.5 h-4 w-4 text-crypto-blue" />
            <span className="font-medium crypto-mono">{pair}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Funding Rate</div>
            <div className={cn(
              "font-medium crypto-mono",
              fundingRate > 0 ? "text-crypto-green" : fundingRate < 0 ? "text-crypto-red" : ""
            )}>
              {fundingRateDisplay} / {fundingInterval}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Spot Price</div>
            <div className="font-medium crypto-mono">${spotPrice.toFixed(2)}</div>
          </div>
          
          {expanded ? (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Futures Price</div>
                <div className="font-medium crypto-mono">${futuresPrice.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Est. Profit</div>
                <div className="font-medium crypto-mono text-crypto-green">${estimatedProfit.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Fees</div>
                <div className="font-medium crypto-mono text-crypto-red">${fees.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Net Profit</div>
                <div className="font-medium crypto-mono text-crypto-green">${netProfit.toFixed(2)}</div>
              </div>
              
              {bestNetwork && (
                <div className="col-span-2 space-y-1 bg-muted/50 p-2 rounded-md mt-1">
                  <div className="text-xs font-medium flex items-center justify-between">
                    <span className="flex items-center">
                      <Network className="h-3.5 w-3.5 mr-1.5" /> 
                      Best Network: {bestNetwork.name}
                    </span>
                    <Badge variant="outline" className={getCongestionColor(bestNetwork.congestion)}>
                      {bestNetwork.congestion}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                    <div>Fee: ${bestNetwork.fee.toFixed(2)}</div>
                    <div>Time: ~{bestNetwork.estimatedTimeMinutes} min</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Futures Price</div>
                <div className="font-medium crypto-mono">${futuresPrice.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Next Funding</div>
                <div className="font-medium crypto-mono flex items-center">
                  <Hourglass className="mr-1 h-3.5 w-3.5" />
                  <span>3h 24m</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {expanded ? (
          <Button size="sm" className="w-full" onClick={handleExecute}>
            <DollarSign className="mr-2 h-4 w-4" />
            Execute
          </Button>
        ) : (
          <div className="flex justify-center w-full text-xs text-muted-foreground">
            <ChevronDown className="h-4 w-4 mr-1" />
            <span>Click for details</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
