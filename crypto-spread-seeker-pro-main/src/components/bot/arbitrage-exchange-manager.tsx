import { useState } from "react";
import { 
  Building, 
  Check, 
  Link, 
  LucideIcon, 
  Percent, 
  Plus, 
  RefreshCcw, 
  Shield, 
  Trash2, 
  Unlink, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Define exchange types and status
interface ExchangeInfo {
  id: string;
  name: string;
  logo: string;
  isConnected: boolean;
  isEnabled: boolean;
  apiKeyConfigured: boolean;
  apiSecretConfigured: boolean;
  supportedTypes: Array<"direct" | "triangular" | "futures" | "p2p" | "stablecoin">;
  fees: {
    maker: number;
    taker: number;
    withdrawal: number;
  };
  networks: string[];
  lastSync?: Date;
  status: "online" | "maintenance" | "issues" | "offline";
}

// Sample exchange data
const exchanges: ExchangeInfo[] = [
  {
    id: "binance",
    name: "Binance",
    logo: "/exchanges/binance.png",
    isConnected: true,
    isEnabled: true,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "triangular", "futures", "p2p", "stablecoin"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "Binance Smart Chain", "Solana", "Polygon", "Arbitrum"],
    lastSync: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    status: "online"
  },
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "/exchanges/coinbase.png",
    isConnected: true,
    isEnabled: true,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "p2p"],
    fees: {
      maker: 0.4,
      taker: 0.6,
      withdrawal: 0.0008
    },
    networks: ["Ethereum", "Solana", "Polygon", "Arbitrum"],
    lastSync: new Date(Date.now() - 8 * 60000), // 8 minutes ago
    status: "online"
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "/exchanges/kraken.png",
    isConnected: true,
    isEnabled: true,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.16,
      taker: 0.26,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "Polkadot", "Kusama"],
    lastSync: new Date(Date.now() - 12 * 60000), // 12 minutes ago
    status: "online"
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "/exchanges/kucoin.png",
    isConnected: true,
    isEnabled: false,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "triangular", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0004
    },
    networks: ["Ethereum", "KCC", "Polygon"],
    lastSync: new Date(Date.now() - 20 * 60000), // 20 minutes ago
    status: "online"
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "/exchanges/bybit.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0006
    },
    networks: ["Ethereum", "Arbitrum", "Optimism"],
    status: "offline"
  },
  {
    id: "okx",
    name: "OKX",
    logo: "/exchanges/okx.png",
    isConnected: true,
    isEnabled: true,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "futures", "p2p"],
    fees: {
      maker: 0.08,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "OKC", "Polygon"],
    lastSync: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    status: "maintenance"
  },
  {
    id: "huobi",
    name: "Huobi",
    logo: "/exchanges/huobi.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: true,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.2,
      taker: 0.2,
      withdrawal: 0.0004
    },
    networks: ["Ethereum", "HECO"],
    status: "issues"
  },
  {
    id: "gateio",
    name: "Gate.io",
    logo: "/exchanges/gateio.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "p2p"],
    fees: {
      maker: 0.2,
      taker: 0.2,
      withdrawal: 0.001
    },
    networks: ["Ethereum", "BSC"],
    status: "offline"
  }
];

export function ArbitrageExchangeManager() {
  const [connectedExchanges, setConnectedExchanges] = useState<ExchangeInfo[]>(exchanges);
  const [activeExchangeId, setActiveExchangeId] = useState<string | null>(null);
  const [isAddingExchange, setIsAddingExchange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("connected");
  
  // Format time ago for last sync
  const formatTimeAgo = (date?: Date) => {
    if (!date) return "Never";
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  // Toggle exchange enabled status
  const toggleExchangeEnabled = (id: string) => {
    setConnectedExchanges(prev => 
      prev.map(exchange => 
        exchange.id === id 
          ? { ...exchange, isEnabled: !exchange.isEnabled } 
          : exchange
      )
    );
  };
  
  // Simulate refresh exchange data
  const refreshExchange = (id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setConnectedExchanges(prev => 
        prev.map(exchange => 
          exchange.id === id 
            ? { ...exchange, lastSync: new Date() } 
            : exchange
        )
      );
      setIsLoading(false);
    }, 1000);
  };
  
  // Disconnect an exchange
  const disconnectExchange = (id: string) => {
    setConnectedExchanges(prev => 
      prev.map(exchange => 
        exchange.id === id 
          ? { ...exchange, isConnected: false, isEnabled: false } 
          : exchange
      )
    );
  };
  
  // Connect to an exchange
  const connectExchange = (id: string) => {
    // In a real app, this would open a dialog to enter API keys
    setConnectedExchanges(prev => 
      prev.map(exchange => 
        exchange.id === id 
          ? { 
              ...exchange, 
              isConnected: true, 
              apiKeyConfigured: true, 
              apiSecretConfigured: true,
              status: "online",
              lastSync: new Date()
            } 
          : exchange
      )
    );
  };
  
  // Get filtered exchanges based on active tab
  const filteredExchanges = connectedExchanges.filter(exchange => {
    if (activeTab === "connected") return exchange.isConnected;
    if (activeTab === "enabled") return exchange.isConnected && exchange.isEnabled;
    if (activeTab === "disconnected") return !exchange.isConnected;
    return true; // "all" tab
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connected" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <Dialog open={isAddingExchange} onOpenChange={setIsAddingExchange}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Exchange
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Exchange</DialogTitle>
                <DialogDescription>
                  Enter API credentials for the exchange you want to connect.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="exchange" className="text-right">Exchange</Label>
                  <div className="col-span-3">
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Select Exchange</option>
                      {connectedExchanges
                        .filter(e => !e.isConnected)
                        .map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">API Key</Label>
                  <Input id="apiKey" className="col-span-3" placeholder="Enter API Key" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiSecret" className="text-right">API Secret</Label>
                  <Input id="apiSecret" type="password" className="col-span-3" placeholder="Enter API Secret" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div></div>
                  <div className="flex items-center space-x-2 col-span-3">
                    <input type="checkbox" id="read-only" className="rounded border-gray-300" />
                    <Label htmlFor="read-only">Read-only access (recommended)</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingExchange(false)}>Cancel</Button>
                <Button>Connect Exchange</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredExchanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No exchanges found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "connected" && "You haven't connected any exchanges yet."}
                {activeTab === "enabled" && "You haven't enabled any exchanges yet."}
                {activeTab === "disconnected" && "All exchanges are connected."}
                {activeTab === "all" && "No exchanges found."}
              </p>
              <Button onClick={() => setIsAddingExchange(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exchange
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExchanges.map((exchange) => (
                <Card 
                  key={exchange.id}
                  className={cn(
                    exchange.status === "offline" && "opacity-60",
                    exchange.status === "issues" && "border-yellow-400",
                    exchange.status === "maintenance" && "border-blue-400"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {/* In a real app, this would be an actual logo */}
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{exchange.name}</CardTitle>
                          <CardDescription>
                            {exchange.isConnected ? (
                              <span className="flex items-center text-xs">
                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                Connected
                              </span>
                            ) : (
                              <span className="flex items-center text-xs">
                                <X className="h-3 w-3 mr-1 text-red-500" />
                                Disconnected
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={
                        exchange.status === "online" ? "default" :
                        exchange.status === "maintenance" ? "secondary" :
                        exchange.status === "issues" ? "outline" : 
                        "destructive"
                      }>
                        {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Enabled</span>
                        <Switch
                          checked={exchange.isEnabled && exchange.isConnected}
                          onCheckedChange={() => toggleExchangeEnabled(exchange.id)}
                          disabled={!exchange.isConnected}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span className="text-xs">{formatTimeAgo(exchange.lastSync)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">API Keys</span>
                        <div className="flex space-x-1 text-xs">
                          <Badge variant={exchange.apiKeyConfigured ? "default" : "destructive"} className="text-[10px]">
                            Key
                          </Badge>
                          <Badge variant={exchange.apiSecretConfigured ? "default" : "destructive"} className="text-[10px]">
                            Secret
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exchange.supportedTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    {exchange.isConnected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => disconnectExchange(exchange.id)}
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refreshExchange(exchange.id)}
                          disabled={isLoading}
                        >
                          <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                          Refresh
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        className="w-full"
                        onClick={() => connectExchange(exchange.id)}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {activeExchangeId && (
        <Dialog 
          open={!!activeExchangeId} 
          onOpenChange={(open) => !open && setActiveExchangeId(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Exchange</DialogTitle>
              <DialogDescription>
                Update your exchange connection settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Exchange settings form would go here */}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveExchangeId(null)}>Cancel</Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 