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

// Add a dedicated price display component for better visibility
const PriceDisplay = ({ 
  opportunity
}: { 
  opportunity: FuturesOpportunity 
}) => {
  const { spotPrice, futuresPrice, spreadPercent, pair } = opportunity;
  const isPremium = futuresPrice > spotPrice;
  
  return (
    <div className="bg-muted/50 rounded-md p-2 mt-2">
      <h4 className="text-xs font-medium mb-1.5">Current Prices</h4>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="flex justify-between">
          <span>Spot Price:</span>
          <span className="font-mono">${spotPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Futures Price:</span>
          <span className="font-mono">${futuresPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span>Spread:</span>
          <span className={cn(
            "font-mono",
            isPremium ? "text-crypto-blue" : "text-crypto-yellow"
          )}>
            {isPremium ? "+" : "-"}${Math.abs(futuresPrice - spotPrice).toFixed(2)} ({Math.abs(spreadPercent).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
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
      case 'Bitget':
        url = `https://www.bitget.com/en/futures/${pair.replace('/', '')}USDT`;
        break;
      case 'KuCoin':
        url = `https://www.kucoin.com/futures/trade/${pair.replace('/', '-')}`;
        break;
      case 'Gate.io':
        url = `https://www.gate.io/futures_trade/${pair.replace('/', '_')}`;
        break;
      case 'Bitfinex':
        url = `https://trading.bitfinex.com/t/${pair.replace('/', '')}:USD`;
        break;
      case 'Gemini':
        url = `https://exchange.gemini.com/trade/${pair.replace('/', '')}`;
        break;
      case 'Coinbase':
        url = `https://pro.coinbase.com/trade/${pair.replace('/', '-')}`;
        break;
      case 'Kraken':
        url = `https://futures.kraken.com/futures/PI_${pair.split('/')[0]}USD`;
        break;
      case 'Poloniex':
        url = `https://poloniex.com/futures/FUTURES_${pair.replace('/', '_')}`;
        break;
      case 'AscendEX':
        url = `https://ascendex.com/en/futures/trade/${pair.replace('/', '-')}`;
        break;
      case 'Bittrue':
        url = `https://www.bitrue.com/trade/${pair.replace('/', '_').toLowerCase()}`;
        break;
      case 'HTX':
        url = `https://www.htx.com/en-us/futures/exchange/${pair.replace('/', '')}`;
        break;
      case 'MEXC':
        url = `https://www.mexc.com/futures/exchange/${pair.replace('/', '_')}`;
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
            <ChevronsUpDown className="mr-1.5 h-4 w-4 text-crypto-blue" />
            <span className="font-medium">{pair}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        {/* Add Price Display component */}
        <PriceDisplay opportunity={opportunity} />
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Funding Rate:</div>
          <div className={cn(
            "font-medium",
            fundingRate > 0 ? "text-crypto-blue" : "text-crypto-yellow"
          )}>
            {fundingRateDisplay} per {fundingInterval}
          </div>
        </div>
        
        {expanded && (
          <div className="mt-3 space-y-3">
            <div className="bg-muted/40 p-2 rounded-md text-xs space-y-2">
              <div className="font-medium">Strategy Details</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-muted-foreground">Spot Price:</div>
                <div className="font-mono text-right">${spotPrice.toFixed(2)}</div>
                
                <div className="text-muted-foreground">Futures Price:</div>
                <div className="font-mono text-right">${futuresPrice.toFixed(2)}</div>
                
                <div className="text-muted-foreground">Spread:</div>
                <div className="font-mono text-right">${Math.abs(futuresPrice - spotPrice).toFixed(2)}</div>
                
                <div className="text-muted-foreground">Net Profit (est.):</div>
                <div className="font-mono text-right">${netProfit.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Network Transfer:</div>
              {bestNetwork && (
                <div className="flex items-center">
                  <Network className="mr-1 h-3.5 w-3.5 text-primary" />
                  <span className="mr-1">{bestNetwork.name}</span>
                  <span className={cn(
                    "text-xs",
                    getCongestionColor(bestNetwork.congestion)
                  )}>
                    ({bestNetwork.congestion} congestion)
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleExecute} 
              className="w-full gap-1"
              variant="default"
              size="sm"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Execute Trade
            </Button>
          </div>
        )}
      </CardContent>
      {!expanded && (
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            <span className="font-medium">Est. profit: ${netProfit.toFixed(2)}</span>
          </div>
          <Button 
            onClick={handleExecute} 
            className="ml-auto gap-1" 
            size="sm"
            variant="outline"
          >
            Execute <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
