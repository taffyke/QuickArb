import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Bot, 
  Bell,
  LineChart, 
  Plus, 
  Play, 
  Settings, 
  ShieldAlert,
  RefreshCcw,
  Zap,
  Network,
  Building,
  History
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Import our custom components
import { ArbitrageDashboard } from "@/components/bot/arbitrage-dashboard";
import { ArbitrageSignalHistory } from "@/components/bot/arbitrage-signal-history";
import { ArbitrageExchangeManager } from "@/components/bot/arbitrage-exchange-manager";
import { ArbitrageBotSettings } from "@/components/bot/arbitrage-bot-settings";

export default function ArbitrageBot() {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [arbitrageType, setArbitrageType] = useState<string>('');
  
  // Check for opportunities passed from other pages via localStorage
  useEffect(() => {
    const opportunityData = localStorage.getItem('selectedArbitrageOpportunity');
    if (opportunityData) {
      try {
        const parsedOpportunity = JSON.parse(opportunityData);
        setSelectedOpportunity(parsedOpportunity);
        
        // Determine the arbitrage type
        if (parsedOpportunity.fundingRate !== undefined) {
          setArbitrageType('futures');
        } else if (parsedOpportunity.legs !== undefined) {
          setArbitrageType('triangular');
        } else if (parsedOpportunity.p2pPlatform !== undefined) {
          setArbitrageType('p2p');
        } else if (parsedOpportunity.isPegged !== undefined) {
          setArbitrageType('stablecoin');
        } else {
          setArbitrageType('direct');
        }
        
        // Alert user about imported opportunity
        toast({
          title: "Opportunity Loaded",
          description: `${arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)} arbitrage opportunity ready for execution.`,
        });
        
        // Clear localStorage to prevent reloading on refresh
        localStorage.removeItem('selectedArbitrageOpportunity');
      } catch (error) {
        console.error("Error parsing opportunity data:", error);
      }
    }
  }, [toast]);
  
  const handleToggle = () => {
    setIsActive(!isActive);
    
    toast({
      title: isActive ? "Arbitrage Bot Stopped" : "Arbitrage Bot Started",
      description: `Bot has been ${isActive ? "stopped" : "started"} successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Arbitrage Bot</h1>
          <p className="text-muted-foreground">
            Automated arbitrage opportunity detection and trading signals
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="gap-2" 
                variant={isActive ? "destructive" : "default"}
              >
                {isActive ? (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Stop Bot
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Bot
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isActive ? "Stop the arbitrage bot?" : "Start the arbitrage bot?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isActive 
                    ? "This will stop the bot from monitoring arbitrage opportunities and generating signals. Any pending alerts will be canceled."
                    : "This will start the arbitrage detection bot. The bot will monitor exchanges for arbitrage opportunities based on your settings."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleToggle}
                  className={isActive ? "bg-destructive hover:bg-destructive/90" : ""}
                >
                  {isActive ? "Stop Bot" : "Start Bot"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </Button>
        </div>
      </div>
      
      {selectedOpportunity && (
        <Alert className="bg-success/10 border-success text-success">
          <Zap className="h-4 w-4" />
          <AlertTitle>Opportunity Loaded from {arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)} Arbitrage</AlertTitle>
          <AlertDescription>
            {arbitrageType === 'direct' && `${selectedOpportunity.fromExchange} → ${selectedOpportunity.toExchange} | ${selectedOpportunity.pair} | ${selectedOpportunity.spreadPercent.toFixed(2)}% spread`}
            {arbitrageType === 'futures' && `${selectedOpportunity.exchange} | ${selectedOpportunity.pair} | ${Math.abs(selectedOpportunity.spreadPercent).toFixed(2)}% ${selectedOpportunity.spreadPercent > 0 ? 'Premium' : 'Discount'}`}
            {arbitrageType === 'triangular' && `${selectedOpportunity.exchange} | ${selectedOpportunity.legs?.map((leg: any) => leg.pair).join(' → ')} | ${selectedOpportunity.profitPercent?.toFixed(2)}% profit`}
            {arbitrageType === 'p2p' && `${selectedOpportunity.p2pPlatform} → ${selectedOpportunity.exchange} | ${selectedOpportunity.pair} | ${selectedOpportunity.spreadPercent?.toFixed(2)}% spread`}
            {arbitrageType === 'stablecoin' && `${selectedOpportunity.fromCoin} → ${selectedOpportunity.toCoin} | ${selectedOpportunity.spreadPercent?.toFixed(2)}% spread`}
          </AlertDescription>
        </Alert>
      )}
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Arbitrage Risk Warning</AlertTitle>
        <AlertDescription>
          Cryptocurrency arbitrage involves risks including slippage, transfer delays, and market volatility. Always use proper risk management.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <Badge variant={isActive ? "default" : "outline"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Signal:</span>
                <span className="text-sm">10 mins ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Connected Exchanges:</span>
                <span>5/8</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Signals Today:</span>
                <span>23</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Successful Trades:</span>
                <span className="text-green-600">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Missed Opportunities:</span>
                <span className="text-yellow-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Today's Profit:</span>
                <span className="text-green-600 font-medium">$432.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Real-time Performance</CardTitle>
            <CardDescription>Arbitrage bot activity over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-16 w-16 mx-auto mb-2 opacity-20" />
                <p>Performance chart will appear here</p>
                <p className="text-sm">Tracks signals, executions, and profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="dashboard" className="mt-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Signal History
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Arbitrage Opportunities</CardTitle>
              <CardDescription>Live arbitrage opportunities detected by the bot</CardDescription>
            </CardHeader>
            <CardContent>
              <ArbitrageDashboard selectedOpportunity={selectedOpportunity} arbitrageType={arbitrageType} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Signal History</CardTitle>
              <CardDescription>Record of arbitrage signals detected by the bot</CardDescription>
            </CardHeader>
            <CardContent>
              <ArbitrageSignalHistory />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exchanges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Management</CardTitle>
              <CardDescription>Configure exchange connections for arbitrage scanning</CardDescription>
            </CardHeader>
            <CardContent>
              <ArbitrageExchangeManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Settings</CardTitle>
              <CardDescription>Configure arbitrage bot parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <ArbitrageBotSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-muted-foreground mt-4">
        <p>The arbitrage bot monitors price differences across exchanges and generates signals when profitable opportunities are detected.</p>
        <p>All trading is manual - you'll receive notifications when action is required.</p>
        <p>Data refreshes automatically every 15 seconds.</p>
      </div>
    </div>
  );
} 