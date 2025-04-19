import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ArrowRightLeft, 
  BarChart4, 
  Bell, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Info, 
  Network, 
  Percent, 
  RefreshCcw, 
  Zap
} from "lucide-react";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Mock arbitrage opportunities
const mockOpportunities = [
  {
    id: "opp-1",
    type: "direct",
    fromExchange: "Binance",
    toExchange: "Kraken",
    pair: "BTC/USDT",
    spreadPercent: 0.87,
    volumeUSD: 24500000,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    networkOptions: [
      {
        name: "Ethereum",
        fee: 12.50,
        time: "15-20 min",
        congestion: "Medium"
      },
      {
        name: "BNB Chain",
        fee: 0.45,
        time: "5-10 min",
        congestion: "Low"
      }
    ],
    profitEstimate: {
      amount: 8.70,
      fees: 2.10,
      net: 6.60
    },
    fromPrice: 53240,
    toPrice: 53697
  },
  {
    id: "opp-2",
    type: "triangular",
    exchange: "KuCoin",
    legs: [
      { pair: "ETH/USDT", action: "buy", rate: 3250.50 },
      { pair: "ETH/BTC", action: "sell", rate: 0.059823 },
      { pair: "BTC/USDT", action: "sell", rate: 54420.30 }
    ],
    profitPercent: 0.63,
    volumeUSD: 18600000,
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    profitEstimate: {
      amount: 6.30,
      fees: 1.90,
      net: 4.40
    }
  },
  {
    id: "opp-3",
    type: "futures",
    exchange: "Binance",
    pair: "ETH/USDT",
    spotPrice: 3260.25,
    futuresPrice: 3292.80,
    spreadPercent: 1.05,
    fundingRate: 0.0012,
    fundingInterval: "8h",
    timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
    profitEstimate: {
      amount: 10.50,
      fees: 3.20,
      net: 7.30
    }
  }
];

// Types for the component props
type ArbitrageDashboardProps = {
  selectedOpportunity?: any;
  arbitrageType?: string;
};

export function ArbitrageDashboard({ selectedOpportunity, arbitrageType }: ArbitrageDashboardProps) {
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [isLoading, setIsLoading] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("1000");
  const [selectedRoute, setSelectedRoute] = useState("best");
  const [executionProgress, setExecutionProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState("");
  const { toast } = useToast();
  
  // Combine mock opportunities with the selected opportunity if it exists
  const allOpportunities = selectedOpportunity 
    ? [{ 
        id: "selected-opp",
        type: arbitrageType || "direct",
        ...selectedOpportunity,
        timestamp: new Date(),
      }, ...opportunities] 
    : opportunities;
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Opportunities Updated",
        description: "Found 3 arbitrage opportunities.",
      });
    }, 1000);
  };
  
  const handleExecuteTrade = (opportunity: any) => {
    setShowExecuteDialog(true);
  };
  
  const simulateExecution = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionStatus("Connecting to exchanges...");
    
    // Get the selected opportunity (first one if available)
    const opportunity = allOpportunities && allOpportunities.length > 0 ? allOpportunities[0] : null;
    const opportunityType = opportunity?.type || arbitrageType || "direct";
    
    // Custom execution flow based on arbitrage type
    const executeBasedOnType = () => {
      // Common initial steps
      setTimeout(() => {
        setExecutionProgress(10);
        setExecutionStatus("Checking balances...");
        
        setTimeout(() => {
          setExecutionProgress(20);
          setExecutionStatus("Validating market conditions...");
          
          setTimeout(() => {
            setExecutionProgress(30);
            
            // Type-specific execution paths
            if (opportunityType === "triangular") {
              executeTriangularArbitrage();
            } else if (opportunityType === "stablecoin") {
              executeStablecoinArbitrage();
            } else if (opportunityType === "p2p") {
              executeP2PArbitrage();
            } else if (opportunityType === "futures") {
              executeFuturesArbitrage();
            } else {
              executeDirectArbitrage();
            }
          }, 800);
        }, 800);
      }, 800);
    };
    
    // Triangular arbitrage execution simulation
    const executeTriangularArbitrage = () => {
      setExecutionStatus("Preparing triangular path execution...");
      
      setTimeout(() => {
        setExecutionProgress(40);
        setExecutionStatus(`Executing first trade: ${opportunity?.legs?.[0]?.pair}...`);
        
        setTimeout(() => {
          setExecutionProgress(60);
          setExecutionStatus(`Executing second trade: ${opportunity?.legs?.[1]?.pair}...`);
          
          setTimeout(() => {
            setExecutionProgress(80);
            setExecutionStatus(`Executing final trade: ${opportunity?.legs?.[2]?.pair}...`);
            
            setTimeout(() => {
              setExecutionProgress(100);
              setExecutionStatus("Triangular arbitrage completed successfully!");
              
              // Calculate profit based on the triangular opportunity
              const profit = parseFloat(selectedAmount) * (opportunity?.profitPercent || 0) / 100;
              
              // Reset and show notification
              setTimeout(() => {
                setIsExecuting(false);
                setShowExecuteDialog(false);
                
                toast({
                  title: "Triangular Arbitrage Executed",
                  description: `Completed with profit of $${profit.toFixed(2)}.`,
                });
              }, 1000);
            }, 800);
          }, 1200);
        }, 1000);
      }, 1000);
    };
    
    // Stablecoin arbitrage execution simulation
    const executeStablecoinArbitrage = () => {
      setExecutionStatus("Preparing stablecoin conversion...");
      
      setTimeout(() => {
        setExecutionProgress(40);
        setExecutionStatus(`Acquiring ${opportunity?.fromCoin || 'stablecoin'}...`);
        
        setTimeout(() => {
          setExecutionProgress(60);
          setExecutionStatus(`Transferring to destination exchange...`);
          
          setTimeout(() => {
            setExecutionProgress(80);
            setExecutionStatus(`Converting to ${opportunity?.toCoin || 'target stablecoin'}...`);
            
            setTimeout(() => {
              setExecutionProgress(100);
              setExecutionStatus("Stablecoin arbitrage completed successfully!");
              
              // Calculate profit based on the stablecoin opportunity
              const profit = parseFloat(selectedAmount) * (opportunity?.spreadPercent || 0) / 100;
              
              // Reset and show notification
              setTimeout(() => {
                setIsExecuting(false);
                setShowExecuteDialog(false);
                
                toast({
                  title: "Stablecoin Arbitrage Executed",
                  description: `Completed with profit of $${profit.toFixed(2)}.`,
                });
              }, 1000);
            }, 800);
          }, 1200);
        }, 1000);
      }, 1000);
    };
    
    // P2P arbitrage execution simulation
    const executeP2PArbitrage = () => {
      setExecutionStatus("Preparing P2P transaction...");
      
      setTimeout(() => {
        setExecutionProgress(40);
        setExecutionStatus(`Contacting P2P seller...`);
        
        setTimeout(() => {
          setExecutionProgress(60);
          setExecutionStatus(`Executing P2P purchase via ${opportunity?.paymentMethod || 'payment method'}...`);
          
          setTimeout(() => {
            setExecutionProgress(80);
            setExecutionStatus(`Selling on ${opportunity?.exchange || 'exchange'}...`);
            
            setTimeout(() => {
              setExecutionProgress(100);
              setExecutionStatus("P2P arbitrage completed successfully!");
              
              // Calculate profit based on the P2P opportunity
              const profit = parseFloat(selectedAmount) * (opportunity?.spreadPercent || 0) / 100;
              
              // Reset and show notification
              setTimeout(() => {
                setIsExecuting(false);
                setShowExecuteDialog(false);
                
                toast({
                  title: "P2P Arbitrage Executed",
                  description: `Completed with profit of $${profit.toFixed(2)}.`,
                });
              }, 1000);
            }, 1500);
          }, 1500);
        }, 1200);
      }, 1000);
    };
    
    // Futures arbitrage execution simulation
    const executeFuturesArbitrage = () => {
      setExecutionStatus("Preparing futures-spot arbitrage...");
      
      setTimeout(() => {
        setExecutionProgress(40);
        setExecutionStatus(`Opening ${opportunity?.spreadPercent > 0 ? 'long' : 'short'} futures position...`);
        
        setTimeout(() => {
          setExecutionProgress(60);
          setExecutionStatus(`Executing spot ${opportunity?.spreadPercent > 0 ? 'sell' : 'buy'} order...`);
          
          setTimeout(() => {
            setExecutionProgress(80);
            setExecutionStatus(`Monitoring position...`);
            
            setTimeout(() => {
              setExecutionProgress(100);
              setExecutionStatus("Futures arbitrage position established!");
              
              // Calculate profit based on the futures opportunity
              const profit = parseFloat(selectedAmount) * Math.abs(opportunity?.spreadPercent || 0) / 100;
              
              // Reset and show notification
              setTimeout(() => {
                setIsExecuting(false);
                setShowExecuteDialog(false);
                
                toast({
                  title: "Futures Arbitrage Executed",
                  description: `Position opened with expected profit of $${profit.toFixed(2)}.`,
                });
              }, 1000);
            }, 800);
          }, 1000);
        }, 1200);
      }, 1000);
    };
    
    // Direct arbitrage execution simulation
    const executeDirectArbitrage = () => {
      setExecutionStatus("Calculating optimal route...");
      
      setTimeout(() => {
        setExecutionProgress(45);
        setExecutionStatus("Preparing transaction...");
        
        setTimeout(() => {
          setExecutionProgress(60);
          setExecutionStatus(`Buying ${opportunity?.pair?.split('/')[0] || 'asset'} on ${opportunity?.fromExchange || 'source exchange'}...`);
          
          setTimeout(() => {
            setExecutionProgress(75);
            setExecutionStatus("Transferring assets...");
            
            setTimeout(() => {
              setExecutionProgress(90);
              setExecutionStatus(`Selling on ${opportunity?.toExchange || 'destination exchange'}...`);
              
              setTimeout(() => {
                setExecutionProgress(100);
                setExecutionStatus("Trade completed successfully!");
                
                // Calculate profit based on direct opportunity
                const profit = parseFloat(selectedAmount) * (opportunity?.spreadPercent || 0) / 100;
                
                // Reset and show notification
                setTimeout(() => {
                  setIsExecuting(false);
                  setShowExecuteDialog(false);
                  
                  toast({
                    title: "Direct Arbitrage Executed",
                    description: `Completed with profit of $${profit.toFixed(2)}.`,
                  });
                }, 1000);
              }, 800);
            }, 1200);
          }, 1500);
        }, 1000);
      }, 800);
    };
    
    // Start execution flow
    executeBasedOnType();
  };
  
  const getOpportunityCard = (opportunity: any, isHighlighted: boolean = false) => {
    return (
      <Card 
        key={opportunity.id} 
        className={`p-4 transition-all ${isHighlighted ? 'border-primary/50 bg-primary/5' : ''}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge className="mb-2">
              {opportunity.type === "direct" && "Direct Arbitrage"}
              {opportunity.type === "triangular" && "Triangular Arbitrage"}
              {opportunity.type === "futures" && "Futures Arbitrage"}
              {opportunity.type === "p2p" && "P2P Arbitrage"}
              {opportunity.type === "stablecoin" && "Stablecoin Arbitrage"}
            </Badge>
            <div className="text-sm font-medium">
              {opportunity.type === "direct" && (
                <span className="flex items-center">
                  {opportunity.fromExchange} 
                  <ArrowRight className="h-3.5 w-3.5 mx-1" /> 
                  {opportunity.toExchange}
                </span>
              )}
              {opportunity.type === "triangular" && (
                <span>{opportunity.exchange} (3-pair cycle)</span>
              )}
              {opportunity.type === "futures" && (
                <span>{opportunity.exchange} (Futures-Spot)</span>
              )}
              {opportunity.type === "p2p" && (
                <span>
                  {opportunity.p2pPlatform} 
                  <ArrowRight className="h-3.5 w-3.5 mx-1" /> 
                  {opportunity.exchange}
                </span>
              )}
              {opportunity.type === "stablecoin" && (
                <span>
                  {opportunity.fromCoin} 
                  <ArrowRight className="h-3.5 w-3.5 mx-1" /> 
                  {opportunity.toCoin}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {opportunity.timestamp && (
                <span>
                  {Math.floor((Date.now() - new Date(opportunity.timestamp).getTime()) / 60000)}m ago
                </span>
              )}
            </div>
            <span className="text-lg font-semibold text-green-500 flex items-center mt-1">
              <Percent className="h-4 w-4 mr-1" />
              {opportunity.type === "direct" && opportunity.spreadPercent.toFixed(2)}
              {opportunity.type === "triangular" && opportunity.profitPercent?.toFixed(2)}
              {opportunity.type === "futures" && Math.abs(opportunity.spreadPercent).toFixed(2)}
              {opportunity.type === "p2p" && opportunity.spreadPercent?.toFixed(2)}
              {opportunity.type === "stablecoin" && opportunity.spreadPercent?.toFixed(2)}
              %
            </span>
          </div>
        </div>
        
        <div className="mb-3 text-sm">
          {opportunity.type === "direct" && (
            <div className="flex items-center font-mono">
              <span>{opportunity.pair}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-muted-foreground">
                ${opportunity.fromPrice?.toFixed(2)} → ${opportunity.toPrice?.toFixed(2)}
              </span>
            </div>
          )}
          
          {opportunity.type === "triangular" && (
            <div className="font-mono text-xs">
              {opportunity.legs?.map((leg: any, index: number) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />}
                  {leg.pair} ({leg.action})
                </span>
              ))}
            </div>
          )}
          
          {opportunity.type === "futures" && (
            <div className="flex items-center font-mono">
              <span>{opportunity.pair}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-muted-foreground">
                Spot: ${opportunity.spotPrice?.toFixed(2)} | Futures: ${opportunity.futuresPrice?.toFixed(2)}
              </span>
            </div>
          )}
          
          {opportunity.type === "p2p" && (
            <div className="flex items-center font-mono">
              <span>{opportunity.pair}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-muted-foreground">
                P2P price: ${opportunity.p2pPrice?.toFixed(2)} | Exchange: ${opportunity.exchangePrice?.toFixed(2)}
              </span>
            </div>
          )}
          
          {opportunity.type === "stablecoin" && (
            <div className="flex items-center font-mono">
              <span>{opportunity.fromCoin}/{opportunity.toCoin}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-muted-foreground">
                Rate: {opportunity.rate?.toFixed(6)}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
          <div>
            <div className="text-muted-foreground">Est. Profit ($1000)</div>
            <div className="font-medium text-green-500">${(10 * (opportunity.spreadPercent || opportunity.profitPercent || 0)).toFixed(2)}</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">
              {opportunity.type === "futures" ? "Funding" : "Volume (24h)"}
            </div>
            <div className="font-medium">
              {opportunity.type === "futures" 
                ? `${(opportunity.fundingRate * 100).toFixed(4)}% / ${opportunity.fundingInterval}` 
                : opportunity.volumeUSD 
                  ? `$${(opportunity.volumeUSD / 1000000).toFixed(1)}M`
                  : "N/A"
              }
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Network</div>
            <div className="font-medium flex items-center">
              {opportunity.networkOptions && opportunity.networkOptions[0]?.name || "Various"}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-3 w-3 ml-1 cursor-help text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent className="w-60">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Network Options</h4>
                    {opportunity.networkOptions ? (
                      opportunity.networkOptions.map((network: any, index: number) => (
                        <div key={index} className="text-xs grid grid-cols-2 gap-1">
                          <span>{network.name}</span>
                          <span>Fee: ${network.fee.toFixed(2)}</span>
                          <span>Time: {network.time}</span>
                          <span>Congestion: {network.congestion}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs">Network details not available</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              if (opportunity.type === "direct") {
                window.open(`https://${opportunity.fromExchange.toLowerCase()}.com`, '_blank');
              } else if (opportunity.type === "futures" || opportunity.type === "triangular") {
                window.open(`https://${opportunity.exchange.toLowerCase()}.com`, '_blank');
              } else if (opportunity.type === "p2p") {
                window.open(`https://${opportunity.p2pPlatform.toLowerCase()}.com`, '_blank');
              }
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View
          </Button>
          
          <Button 
            size="sm" 
            className="flex-1" 
            onClick={() => handleExecuteTrade(opportunity)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Execute
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {allOpportunities.length} opportunities
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>
      </div>
      
      {allOpportunities.length === 0 ? (
        <EmptyPlaceholder
          title="No opportunities found"
          description="Try refreshing or adjusting your settings to find arbitrage opportunities."
          icon={BarChart4}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allOpportunities.map((opportunity, index) => (
            getOpportunityCard(opportunity, opportunity.id === "selected-opp")
          ))}
        </div>
      )}

      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Execute Arbitrage Trade</DialogTitle>
            <DialogDescription>
              Configure trade settings and execute this arbitrage opportunity.
            </DialogDescription>
          </DialogHeader>
          
          {isExecuting ? (
            <div className="space-y-4 py-4">
              <div className="text-center mb-4">
                <div className="text-lg font-medium mb-2">{executionStatus}</div>
                <Progress value={executionProgress} className="h-2" />
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Please do not close this window during execution.</p>
                <p>The bot is executing trades across exchanges and networks to capture the arbitrage opportunity.</p>
              </div>
            </div>
          ) : (
            <>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Investment Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Estimated profit: ${(parseFloat(selectedAmount) * 0.008).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Route Selection</Label>
                    <RadioGroup defaultValue="best" value={selectedRoute} onValueChange={setSelectedRoute}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="best" id="best" />
                        <Label htmlFor="best">Best Balance (Recommended)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fastest" id="fastest" />
                        <Label htmlFor="fastest">Fastest (Higher fees)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cheapest" id="cheapest" />
                        <Label htmlFor="cheapest">Cheapest (Slower)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Execution Settings</Label>
                    <div className="rounded-md border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Slippage Tolerance</span>
                        <span className="text-sm">0.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Max Execution Time</span>
                        <span className="text-sm">2 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-cancel if spread below</span>
                        <span className="text-sm">0.3%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={simulateExecution}>
                  <Zap className="h-4 w-4 mr-2" />
                  Execute Trade
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 