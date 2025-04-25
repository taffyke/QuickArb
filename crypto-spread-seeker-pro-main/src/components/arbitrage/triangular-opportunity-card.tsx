import { TriangularOpportunity, NetworkInfo } from "@/contexts/crypto-context";
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
  ArrowLeftRight, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Network,
  Triangle,
  DollarSign,
  ChevronDown,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TriangularOpportunityCardProps = {
  opportunity: TriangularOpportunity;
  rank?: number;
  expanded?: boolean;
  investmentAmount?: number;
  profitEstimate?: {
    grossProfit: number;
    fees: number;
    netProfit: number;
    roi: number;
  };
  onExecute?: (opportunity: TriangularOpportunity) => void;
};

// Add price display to the UI where prices are shown for each pair in the path
const PriceDisplay = ({ 
  opportunity
}: { 
  opportunity: TriangularOpportunity 
}) => {
  const { firstPair, secondPair, thirdPair, firstPairPrice, secondPairPrice, thirdPairPrice } = opportunity;
  
  return (
    <div className="bg-muted/50 rounded-md p-2 mt-2">
      <h4 className="text-xs font-medium mb-1.5">Current Prices</h4>
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {firstPairPrice && (
          <div className="flex justify-between">
            <span>{firstPair}:</span>
            <span className="font-mono">${firstPairPrice.toFixed(2)}</span>
          </div>
        )}
        {secondPairPrice && (
          <div className="flex justify-between">
            <span>{secondPair}:</span>
            <span className="font-mono">{secondPairPrice.toFixed(5)}</span>
          </div>
        )}
        {thirdPairPrice && (
          <div className="flex justify-between">
            <span>{thirdPair}:</span>
            <span className="font-mono">${thirdPairPrice.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export function TriangularOpportunityCard({
  opportunity,
  rank,
  expanded = false,
  investmentAmount = 1000,
  profitEstimate,
  onExecute
}: TriangularOpportunityCardProps) {
  const {
    exchange,
    firstPair,
    secondPair,
    thirdPair,
    profitPercent,
    timestamp,
    path,
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
      // Prepare opportunity data for arbitrage bot with complete information
      const enhancedOpportunity = {
        ...opportunity,
        type: 'triangular',
        // Add legs format required by the arbitrage bot
        legs: [
          { pair: firstPair, action: 'buy', rate: 0 },
          { pair: secondPair, action: 'sell', rate: 0 },
          { pair: thirdPair, action: 'sell', rate: 0 }
        ],
        // Ensure all required properties exist
        timestamp: new Date(),
        profitEstimate: profitEstimate || {
          grossProfit: estimatedProfit || 0,
          fees: fees || 0,
          netProfit: netProfit || 0,
          roi: (netProfit / investmentAmount) * 100 || 0
        }
      };
      
      // Execute the trade with enhanced data
      onExecute(enhancedOpportunity as TriangularOpportunity);
    }
  };

  // Handle exchange link click to open exchange in new tab
  const handleExchangeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking exchange
    let url = '';
    
    // Map exchange names to their URLs
    switch(exchange) {
      case 'Binance':
        url = `https://www.binance.com/en/trade/${firstPair.split('/')[0]}_${firstPair.split('/')[1]}`;
        break;
      case 'Coinbase':
        url = `https://www.coinbase.com/advanced-trade/${firstPair.replace('/', '-')}`;
        break;
      case 'Kraken':
        url = `https://www.kraken.com/prices/${firstPair.split('/')[0].toLowerCase()}`;
        break;
      default:
        url = `https://${exchange.toLowerCase()}.com`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <Card 
      className={cn(
        "opportunity-card transition-all",
        expanded ? "col-span-2" : "", 
        rank && rank <= 3 ? "border-primary/20" : "",
        profitPercent >= 2 ? "bg-success/5 dark:bg-success/10" : ""
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
                    <p>Open {exchange} for trading</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Triangle className="inline h-3 w-3 mx-1 rotate-90" /> Triangular
            </CardTitle>
          </div>
          <Badge variant={profitPercent >= 1.5 ? "default" : "outline"} className="capitalize">
            {profitPercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <RefreshCcw className="mr-1.5 h-4 w-4 text-crypto-blue" />
            <span className="font-medium crypto-mono">{exchange}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTimeAgo(timestamp)}</span>
          </div>
        </div>

        {/* Add price display component */}
        {(opportunity.firstPairPrice || opportunity.secondPairPrice || opportunity.thirdPairPrice) && (
          <PriceDisplay opportunity={opportunity} />
        )}
        
        <div className="space-y-1.5">
          <div className="text-muted-foreground text-xs">Path</div>
          <div className="text-sm">
            {path}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">First Pair</div>
            <div className="font-medium crypto-mono">{firstPair}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Second Pair</div>
            <div className="font-medium crypto-mono">{secondPair}</div>
          </div>
          
          {expanded ? (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Third Pair</div>
                <div className="font-medium crypto-mono">{thirdPair}</div>
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
              
              {/* Profit calculation section based on investment amount */}
              {profitEstimate && (
                <div className="col-span-2 mt-2 bg-accent/50 p-2 rounded-md">
                  <div className="text-xs font-medium mb-1.5">Profit Estimate (${investmentAmount.toLocaleString()})</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Gross Profit:</span> 
                      <span className="float-right font-medium text-green-500">
                        ${profitEstimate.grossProfit.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fees:</span> 
                      <span className="float-right font-medium text-red-500">
                        ${profitEstimate.fees.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Profit:</span> 
                      <span className="float-right font-medium text-green-500">
                        ${profitEstimate.netProfit.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI:</span> 
                      <span className="float-right font-medium text-green-500">
                        {profitEstimate.roi.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
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
              
              {/* Trading direction information */}
              <div className="col-span-2 bg-background border rounded-md p-2 mt-1">
                <div className="text-xs font-medium mb-1.5">Trading Direction</div>
                <div className="text-xs text-muted-foreground">
                  1. Buy {firstPair.split('/')[0]} with {firstPair.split('/')[1]} <br />
                  2. Trade {secondPair.split('/')[0]} for {secondPair.split('/')[1]} <br />
                  3. Sell {thirdPair.split('/')[0]} for {thirdPair.split('/')[1]}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Third Pair</div>
                <div className="font-medium crypto-mono">{thirdPair}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs">Net Profit</div>
                <div className="font-medium crypto-mono text-crypto-green">${netProfit.toFixed(2)}</div>
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
