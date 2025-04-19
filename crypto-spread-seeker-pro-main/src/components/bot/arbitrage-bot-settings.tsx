import { useState } from "react";
import { 
  Bell, 
  Settings, 
  Sliders, 
  DollarSign, 
  PercentIcon,
  Network,
  Clock,
  Send,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function ArbitrageBotSettings() {
  // General settings
  const [minimumSpread, setMinimumSpread] = useState(1.0);
  const [minimumProfit, setMinimumProfit] = useState(10);
  const [maxInvestmentAmount, setMaxInvestmentAmount] = useState(1000);
  const [refreshInterval, setRefreshInterval] = useState(15);
  
  // Network settings
  const [maxNetworkFee, setMaxNetworkFee] = useState(5);
  const [avoidHighCongestion, setAvoidHighCongestion] = useState(true);
  const [maxWaitTime, setMaxWaitTime] = useState(10);
  const [preferredNetworks, setPreferredNetworks] = useState<string[]>(["Ethereum", "Binance Smart Chain", "Solana"]);

  // Alert settings
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [minSpreadAlert, setMinSpreadAlert] = useState(2.5);
  
  // Exchange settings
  const [enabledExchanges, setEnabledExchanges] = useState<string[]>([
    "Binance", "Coinbase", "Kraken", "KuCoin", "Bybit"
  ]);
  const [enabledTypes, setEnabledTypes] = useState<string[]>([
    "direct", "triangular", "futures", "p2p"
  ]);

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real application, this would save settings to a backend or local storage
    console.log("Settings saved");
    // Show a toast notification
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="networks">Networks</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
        <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic bot behavior and thresholds</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minimum Spread (%)</Label>
                <span className="text-sm font-mono">{minimumSpread.toFixed(1)}%</span>
              </div>
              <Slider
                value={[minimumSpread]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(value) => setMinimumSpread(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Only detect arbitrage opportunities with spread greater than this percentage
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Profit ($)</Label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={minimumProfit}
                  onChange={(e) => setMinimumProfit(Number(e.target.value))}
                  className="max-w-[100px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum expected profit to qualify as an opportunity
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Maximum Investment Amount ($)</Label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={maxInvestmentAmount}
                  onChange={(e) => setMaxInvestmentAmount(Number(e.target.value))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount to use for each arbitrage opportunity
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Refresh Interval (seconds)</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="max-w-[100px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                How frequently to scan for new opportunities (in seconds)
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="auto-execute" />
              <Label htmlFor="auto-execute" className="text-sm">
                Auto-execute trades (warning: trades will happen without confirmation)
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="networks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Network Settings</CardTitle>
            <CardDescription>Configure blockchain network preferences</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Maximum Network Fee ($)</Label>
                <span className="text-sm font-mono">${maxNetworkFee.toFixed(2)}</span>
              </div>
              <Slider
                value={[maxNetworkFee]}
                min={0.5}
                max={20}
                step={0.5}
                onValueChange={(value) => setMaxNetworkFee(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Skip opportunities with network fees higher than this amount
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Maximum Wait Time (minutes)</Label>
                <span className="text-sm font-mono">{maxWaitTime} min</span>
              </div>
              <Slider
                value={[maxWaitTime]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setMaxWaitTime(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Skip opportunities that require longer transfer times
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={avoidHighCongestion}
                onCheckedChange={setAvoidHighCongestion}
              />
              <Label>Avoid high network congestion</Label>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Preferred Networks</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Ethereum", "Binance Smart Chain", "Solana", "Polygon",
                  "Arbitrum", "Optimism", "Avalanche", "Tron"
                ].map((network) => (
                  <div key={network} className="flex items-center space-x-2">
                    <Checkbox
                      id={`network-${network}`}
                      checked={preferredNetworks.includes(network)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreferredNetworks([...preferredNetworks, network]);
                        } else {
                          setPreferredNetworks(
                            preferredNetworks.filter(n => n !== network)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`network-${network}`} className="text-sm">
                      {network}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="alerts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
            <CardDescription>Configure how you receive bot notifications</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
                <Label>Push Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
                <Label>Email Alerts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={telegramNotifications}
                  onCheckedChange={setTelegramNotifications}
                />
                <Label>Telegram Notifications</Label>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minimum Spread for Alerts (%)</Label>
                <span className="text-sm font-mono">{minSpreadAlert.toFixed(1)}%</span>
              </div>
              <Slider
                value={[minSpreadAlert]}
                min={0.5}
                max={10}
                step={0.5}
                onValueChange={(value) => setMinSpreadAlert(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Only send alerts for opportunities with spread greater than this percentage
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label>Telegram Bot Token (optional)</Label>
              <Input placeholder="Enter your Telegram bot token" />
              <p className="text-xs text-muted-foreground">
                Required for Telegram notifications
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Telegram Chat ID (optional)</Label>
              <Input placeholder="Enter your Telegram chat ID" />
              <p className="text-xs text-muted-foreground">
                Required for Telegram notifications
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="exchanges" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Exchange Settings</CardTitle>
            <CardDescription>Manage connected exchanges and arbitrage types</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Enabled Arbitrage Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {id: "direct", label: "Direct Arbitrage"},
                  {id: "triangular", label: "Triangular Arbitrage"},
                  {id: "futures", label: "Futures Arbitrage"},
                  {id: "p2p", label: "P2P Arbitrage"}
                ].map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={enabledTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEnabledTypes([...enabledTypes, type.id]);
                        } else {
                          setEnabledTypes(
                            enabledTypes.filter(t => t !== type.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`type-${type.id}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Enabled Exchanges</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Binance", "Coinbase", "Kraken", "KuCoin", "Bybit",
                  "OKX", "Huobi", "Gate.io", "BitMEX", "FTX"
                ].map((exchange) => (
                  <div key={exchange} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exchange-${exchange}`}
                      checked={enabledExchanges.includes(exchange)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEnabledExchanges([...enabledExchanges, exchange]);
                        } else {
                          setEnabledExchanges(
                            enabledExchanges.filter(e => e !== exchange)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`exchange-${exchange}`} className="text-sm">
                      {exchange}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Configure API Keys
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                We use read-only API keys for price checking only, no trading permissions required
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <div className="flex justify-end mt-6 space-x-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </Tabs>
  );
} 