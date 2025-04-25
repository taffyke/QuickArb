import { ArbitrageOpportunity, NetworkInfo } from "@/contexts/crypto-context";
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
  ArrowRight, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Network, 
  Shield, 
  TrendingUp,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ArbitrageOpportunityCardProps = {
  opportunity: ArbitrageOpportunity;
  rank?: number;
  expanded?: boolean;
  investmentAmount?: number;
  profitEstimate?: {
    gross: number;
    net: number;
    roi: number;
  };
  onExecute?: (opportunity: ArbitrageOpportunity) => void;
};

export function ArbitrageOpportunityCard({
  opportunity,
  rank,
  expanded = false,
  investmentAmount = 1000,
  profitEstimate,
  onExecute
}: ArbitrageOpportunityCardProps) {
  const {
    fromExchange,
    toExchange,
    pair,
    spreadAmount,
    spreadPercent,
    volume24h,
    timestamp,
    estimatedProfit,
    fees,
    netProfit,
    networks,
    bestNetwork,
    feeDetails,
    fromExchangePrice,
    toExchangePrice
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

  // Handle exchange link click to open exchange in new tab
  const handleExchangeClick = (exchange: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking exchange
    let url = '';
    
    // Map exchange names to their URLs
    switch(exchange) {
      case 'Binance':
        url = `https://www.binance.com/en/trade/${pair.replace('/', '_')}`;
        break;
      case 'Coinbase':
        url = `https://www.coinbase.com/advanced-trade/${pair.replace('/', '-')}`;
        break;
      case 'Kraken':
        url = `https://www.kraken.com/prices/${pair.split('/')[0].toLowerCase()}`;
        break;
      default:
        url = `https://${exchange.toLowerCase()}.com`;
    }
    
    window.open(url, '_blank');
  };

  // Format network congestion indicator
  const getCongestionColor = (congestion: string) => {
    switch(congestion) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
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
        spreadPercent >= 3 ? "bg-success/5 dark:bg-success/10" : ""
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
                      onClick={(e) => handleExchangeClick(fromExchange, e)}
                    >
                      {fromExchange}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open {fromExchange} for {pair}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <ArrowRight className="inline h-3 w-3 mx-1" />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span 
                      className="cursor-pointer hover:underline" 
                      onClick={(e) => handleExchangeClick(toExchange, e)}
                    >
                      {toExchange}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open {toExchange} for {pair}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </div>
          <Badge variant={spreadPercent >= 3 ? "default" : "outline"} className="capitalize">
            {spreadPercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <TrendingUp className="mr-1.5 h-4 w-4 text-crypto-blue" />
            <span className="font-medium crypto-mono">{pair}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">{fromExchange} Price</div>
            <div className="font-medium crypto-mono">${fromExchangePrice?.toFixed(2) || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">{toExchange} Price</div>
            <div className="font-medium crypto-mono">${toExchangePrice?.toFixed(2) || '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Spread</div>
            <div className="font-medium crypto-mono">${spreadAmount.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">24h Volume</div>
            <div className="font-medium crypto-mono">${(volume24h / 1000000).toFixed(1)}M</div>
          </div>
          
          {profitEstimate && (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Your Profit</div>
                <div className="font-medium crypto-mono text-crypto-green">
                  ${profitEstimate.net.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">ROI</div>
                <div className="font-medium crypto-mono text-crypto-blue">
                  {profitEstimate.roi.toFixed(2)}%
                </div>
              </div>
            </>
          )}
          
          {expanded && (
            <>
              {!profitEstimate && (
                <>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Est. Profit</div>
                    <div className="font-medium crypto-mono text-crypto-green">${estimatedProfit.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Total Fees</div>
                    <div className="font-medium crypto-mono text-crypto-red">${fees.toFixed(2)}</div>
                  </div>
                </>
              )}
              
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
              
              {feeDetails && (
                <div className="col-span-2 mt-1">
                  <div className="text-muted-foreground text-xs mb-1">Fee Breakdown</div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                    <div>Exchange: ${feeDetails.exchangeFees.toFixed(2)}</div>
                    <div>Network: ${feeDetails.networkFees.toFixed(2)}</div>
                    <div>Other: ${feeDetails.otherFees.toFixed(2)}</div>
                  </div>
                </div>
              )}
              
              <div className="col-span-2 space-y-1 mt-1">
                <div className="text-muted-foreground text-xs">Net Profit</div>
                <div className="font-medium crypto-mono text-crypto-green">${netProfit.toFixed(2)}</div>
              </div>
              
              {investmentAmount && investmentAmount > 0 && (
                <div className="col-span-2 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3 inline mr-1" />
                  Based on ${investmentAmount.toLocaleString()} investment
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span className="flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Verified 
          </span>
          {!expanded && (
            <Button variant="ghost" size="icon" className="w-5 h-5 p-0">
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
          {expanded && (
            <Button variant="ghost" size="icon" className="w-5 h-5 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
