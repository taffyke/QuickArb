import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Bitcoin, 
  Globe, 
  Moon, 
  PaintBucket, 
  RefreshCw, 
  Save, 
  Sun, 
  Terminal, 
  Wallet,
  CreditCard,
  CheckCircle2,
  DollarSign,
  X
} from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const location = useLocation();
  
  // Check for activeTab in location state
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    
    // Also listen for custom event to change tabs
    const handleSetTab = (event: CustomEvent) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('set-settings-tab' as any, handleSetTab as EventListener);
    
    return () => {
      window.removeEventListener('set-settings-tab' as any, handleSetTab as EventListener);
    };
  }, [location]);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "en",
    currency: "USD",
    refreshInterval: "30",
    dataDisplay: "grid",
    notifications: {
      priceAlerts: true,
      arbitrageOpportunities: true,
      securityAlerts: true,
      newsAlerts: false,
      emailNotifications: true,
      desktopNotifications: true,
    },
    exchanges: {
      binance: true,
      coinbase: true,
      kraken: true,
      kucoin: true,
      huobi: false,
      bybit: true,
      okx: false,
    },
    trading: {
      confirmTrades: true,
      maxSlippage: "1.0",
      defaultInvestmentAmount: "1000",
      testModeEnabled: true,
    },
    advanced: {
      showDeveloperTools: false,
      apiTimeout: "30000",
      dataExpiration: "5",
      debugMode: false,
    }
  });

  // Handle setting changes
  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateSingleSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Card className="lg:h-fit border-border/50 bg-card/50">
            <CardHeader className="p-4">
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 w-full h-auto bg-transparent gap-1 p-2 text-xs sm:text-sm">
                <TabsTrigger 
                  value="general" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <PaintBucket className="h-4 w-4 mr-2" />
                  <span>Appearance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="exchanges" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Bitcoin className="h-4 w-4 mr-2" />
                  <span>Exchanges</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="trading" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>Trading</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  <span>Advanced</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Billing</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </Tabs>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => updateSingleSetting("language", value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value) => updateSingleSetting("currency", value)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="BTC">BTC (₿)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">Data Refresh Interval (seconds)</Label>
                    <Input 
                      id="refreshInterval" 
                      type="number" 
                      value={settings.refreshInterval}
                      onChange={(e) => updateSingleSetting("refreshInterval", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataDisplay">Data Display Format</Label>
                    <Select 
                      value={settings.dataDisplay} 
                      onValueChange={(value) => updateSingleSetting("dataDisplay", value)}
                    >
                      <SelectTrigger id="dataDisplay">
                        <SelectValue placeholder="Select display format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="compact">Compact View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto Refresh Data</h3>
                    <p className="text-sm text-muted-foreground">Automatically refresh market data</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="UTC+3:00">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC+0:00">UTC+0:00 (London)</SelectItem>
                      <SelectItem value="UTC+1:00">UTC+1:00 (Berlin, Paris)</SelectItem>
                      <SelectItem value="UTC+2:00">UTC+2:00 (Athens, Cairo)</SelectItem>
                      <SelectItem value="UTC+3:00">UTC+3:00 (Moscow, Istanbul)</SelectItem>
                      <SelectItem value="UTC+8:00">UTC+8:00 (Beijing, Singapore)</SelectItem>
                      <SelectItem value="UTC-5:00">UTC-5:00 (New York)</SelectItem>
                      <SelectItem value="UTC-8:00">UTC-8:00 (Los Angeles)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer ${settings.theme === 'light' ? 'border-primary bg-primary/10' : 'border-border/50'}`}
                      onClick={() => updateSingleSetting("theme", "light")}
                    >
                      <div className="rounded-full bg-white border border-gray-200 p-3 mb-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                      </div>
                      <span className="font-medium">Light</span>
                    </div>
                    
                    <div 
                      className={`flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer ${settings.theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border/50'}`}
                      onClick={() => updateSingleSetting("theme", "dark")}
                    >
                      <div className="rounded-full bg-gray-900 border border-gray-700 p-3 mb-2">
                        <Moon className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-medium">Dark</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Accent Color</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer border-2 border-blue-600"></div>
                    <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-pink-500 cursor-pointer"></div>
                    <div className="h-8 w-8 rounded-full bg-cyan-500 cursor-pointer"></div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Compact Mode</h3>
                      <p className="text-sm text-muted-foreground">Use a more condensed layout</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Animations</h3>
                      <p className="text-sm text-muted-foreground">Enable UI animations</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">High Contrast</h3>
                      <p className="text-sm text-muted-foreground">Increase contrast for better accessibility</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Application Notification Settings</CardTitle>
                <CardDescription>
                  Configure system-wide notification preferences and delivery methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alert Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Price Alerts</h3>
                        <p className="text-sm text-muted-foreground">Get notified of significant price changes</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.priceAlerts} 
                        onCheckedChange={(checked) => updateSettings("notifications", "priceAlerts", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Arbitrage Opportunities</h3>
                        <p className="text-sm text-muted-foreground">Get notified of new arbitrage opportunities</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.arbitrageOpportunities} 
                        onCheckedChange={(checked) => updateSettings("notifications", "arbitrageOpportunities", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Security Alerts</h3>
                        <p className="text-sm text-muted-foreground">Get notified of security events (login attempts, etc.)</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.securityAlerts} 
                        onCheckedChange={(checked) => updateSettings("notifications", "securityAlerts", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">News Alerts</h3>
                        <p className="text-sm text-muted-foreground">Get notified of crypto market news</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.newsAlerts} 
                        onCheckedChange={(checked) => updateSettings("notifications", "newsAlerts", checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Notification Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Send notifications to your email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.emailNotifications} 
                        onCheckedChange={(checked) => updateSettings("notifications", "emailNotifications", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Desktop Notifications</h3>
                        <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.desktopNotifications} 
                        onCheckedChange={(checked) => updateSettings("notifications", "desktopNotifications", checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select defaultValue="real-time">
                      <SelectTrigger id="notification-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real-time">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exchanges">
            <Card>
              <CardHeader>
                <CardTitle>Exchange Connections</CardTitle>
                <CardDescription>
                  Manage your linked cryptocurrency exchanges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Binance</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.binance} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "binance", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Coinbase</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.coinbase} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "coinbase", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Kraken</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.kraken} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "kraken", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">KuCoin</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.kucoin} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "kucoin", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Huobi</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.huobi} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "huobi", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bybit</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.bybit} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "bybit", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">OKX</h3>
                      <p className="text-sm text-muted-foreground">Include in arbitrage calculation</p>
                    </div>
                    <Switch 
                      checked={settings.exchanges.okx} 
                      onCheckedChange={(checked) => updateSettings("exchanges", "okx", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <Button variant="outline" className="w-full">
                    Connect New Exchange
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trading">
            <Card>
              <CardHeader>
                <CardTitle>Trading Settings</CardTitle>
                <CardDescription>
                  Configure your trading preferences and limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxSlippage">Maximum Slippage (%)</Label>
                      <Input 
                        id="maxSlippage" 
                        type="number" 
                        value={settings.trading.maxSlippage}
                        onChange={(e) => updateSettings("trading", "maxSlippage", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultInvestment">Default Investment Amount</Label>
                      <Input 
                        id="defaultInvestment" 
                        type="number" 
                        value={settings.trading.defaultInvestmentAmount}
                        onChange={(e) => updateSettings("trading", "defaultInvestmentAmount", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Confirm Trades</h3>
                      <p className="text-sm text-muted-foreground">Always ask for confirmation before executing</p>
                    </div>
                    <Switch 
                      checked={settings.trading.confirmTrades}
                      onCheckedChange={(checked) => updateSettings("trading", "confirmTrades", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Test Mode</h3>
                      <p className="text-sm text-muted-foreground">Run in simulation without real trades</p>
                    </div>
                    <Switch 
                      checked={settings.trading.testModeEnabled}
                      onCheckedChange={(checked) => updateSettings("trading", "testModeEnabled", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Advanced Trading Features</h3>
                      <p className="text-sm text-muted-foreground">Enable complex order types and settings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Pro Feature</Badge>
                      <Switch checked={false} disabled />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Smart Routing</h3>
                      <p className="text-sm text-muted-foreground">Optimize trade execution path</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Pro Feature</Badge>
                      <Switch checked={false} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure technical and developer settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiTimeout">API Timeout (ms)</Label>
                      <Input 
                        id="apiTimeout" 
                        value={settings.advanced.apiTimeout}
                        onChange={(e) => updateSettings("advanced", "apiTimeout", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dataExpiration">Data Expiration (minutes)</Label>
                      <Input 
                        id="dataExpiration" 
                        value={settings.advanced.dataExpiration}
                        onChange={(e) => updateSettings("advanced", "dataExpiration", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Developer Tools</h3>
                      <p className="text-sm text-muted-foreground">Enable developer options and tools</p>
                    </div>
                    <Switch 
                      checked={settings.advanced.showDeveloperTools} 
                      onCheckedChange={(checked) => updateSettings("advanced", "showDeveloperTools", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Debug Mode</h3>
                      <p className="text-sm text-muted-foreground">Enable verbose logging and debug information</p>
                    </div>
                    <Switch 
                      checked={settings.advanced.debugMode} 
                      onCheckedChange={(checked) => updateSettings("advanced", "debugMode", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Export All Settings</Button>
                    <Button variant="outline" className="w-full">Import Settings</Button>
                    <Button variant="destructive" className="w-full">Reset to Default</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Upgrade your account to access premium arbitrage features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="text-lg font-bold mb-1">Free</div>
                    <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    <div className="flex-grow space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Basic arbitrage scanner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">5 major exchanges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Standard alerts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Real-time data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Advanced analytics</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Current Plan</Button>
                  </div>
                  
                  {/* Pro Plan */}
                  <div className="border border-blue-500 rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">Popular</div>
                    <div className="text-lg font-bold mb-1">Pro</div>
                    <div className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    <div className="flex-grow space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced arbitrage scanner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">30+ exchanges (CEX & DEX)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real-time alerts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced analytics & reporting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
                  </div>
                  
                  {/* Enterprise Plan */}
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="text-lg font-bold mb-1">Enterprise</div>
                    <div className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    <div className="flex-grow space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">All Pro features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Unlimited exchanges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Custom trading signals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">API access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Dedicated account manager</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <input type="radio" id="payment-card" name="payment" className="radio" defaultChecked />
                        <Label htmlFor="payment-card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Credit/Debit Card
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <input type="radio" id="payment-crypto" name="payment" className="radio" />
                        <Label htmlFor="payment-crypto" className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4" /> Cryptocurrency
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="payment-paypal" name="payment" className="radio" />
                        <Label htmlFor="payment-paypal" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" /> PayPal
                        </Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Billing Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" placeholder="John Smith" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" placeholder="123 Main St" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="New York" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select>
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="eu">European Union</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal">Postal Code</Label>
                          <Input id="postal" placeholder="10001" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button className="w-full sm:w-auto">Update Billing Information</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
