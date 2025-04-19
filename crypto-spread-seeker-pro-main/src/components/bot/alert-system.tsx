
import { useState } from "react";
import { BellDot, BellOff, ChevronDown, Save, Plus, Trash2, Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type AlertType = "price" | "arbitrage" | "technical" | "volume";
type AlertCondition = "above" | "below" | "crosses_above" | "crosses_below" | "percent_change";
type AlertFrequency = "once" | "always" | "daily";
type NotificationChannel = "app" | "email" | "telegram" | "browser";

interface Alert {
  id: string;
  name: string;
  type: AlertType;
  asset: string;
  condition: AlertCondition;
  value: number;
  frequency: AlertFrequency;
  channels: NotificationChannel[];
  active: boolean;
  createdAt: Date;
}

// Sample data
const sampleAlerts: Alert[] = [
  {
    id: "1",
    name: "BTC Price Alert",
    type: "price",
    asset: "BTC/USDT",
    condition: "above",
    value: 40000,
    frequency: "once",
    channels: ["app", "email"],
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: "2",
    name: "ETH Volume Spike",
    type: "volume",
    asset: "ETH/USDT",
    condition: "percent_change",
    value: 25,
    frequency: "always",
    channels: ["app", "browser"],
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
  },
  {
    id: "3",
    name: "SOL RSI Oversold",
    type: "technical",
    asset: "SOL/USDT",
    condition: "below",
    value: 30,
    frequency: "always",
    channels: ["app", "telegram"],
    active: false,
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
  },
];

export function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // New alert form state
  const [newAlert, setNewAlert] = useState<Omit<Alert, "id" | "createdAt">>({
    name: "",
    type: "price",
    asset: "BTC/USDT",
    condition: "above",
    value: 0,
    frequency: "once",
    channels: ["app"],
    active: true,
  });
  
  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setNewAlert(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle channel toggle
  const handleChannelToggle = (channel: NotificationChannel) => {
    setNewAlert(prev => {
      const channels = [...prev.channels];
      if (channels.includes(channel)) {
        return { ...prev, channels: channels.filter(c => c !== channel) };
      } else {
        return { ...prev, channels: [...channels, channel] };
      }
    });
  };
  
  // Create new alert
  const handleCreateAlert = () => {
    const alert: Alert = {
      ...newAlert,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    
    setAlerts([alert, ...alerts]);
    setIsCreating(false);
    
    // Reset form
    setNewAlert({
      name: "",
      type: "price",
      asset: "BTC/USDT",
      condition: "above",
      value: 0,
      frequency: "once",
      channels: ["app"],
      active: true,
    });
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  // Toggle alert active status
  const toggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };
  
  // Delete alert
  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  // Format alert condition for display
  const formatCondition = (alert: Alert) => {
    switch (alert.condition) {
      case "above": return `above $${alert.value.toLocaleString()}`;
      case "below": return `below $${alert.value.toLocaleString()}`;
      case "crosses_above": return `crosses above $${alert.value.toLocaleString()}`;
      case "crosses_below": return `crosses below $${alert.value.toLocaleString()}`;
      case "percent_change": return `changes by ${alert.value}%`;
      default: return `${alert.condition} ${alert.value}`;
    }
  };
  
  return (
    <Card className="w-full overflow-hidden border-0 bg-gradient-to-b from-background to-background/80 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 border-b">
        <div>
          <CardTitle className="text-xl font-bold">Alert System</CardTitle>
          <CardDescription>Set up custom alerts for trading opportunities</CardDescription>
        </div>
        <Button 
          onClick={() => setIsCreating(!isCreating)} 
          size="sm"
          className="gap-1"
        >
          {isCreating ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isCreating ? "Cancel" : "New Alert"}
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-crypto-green/10 text-crypto-green rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Alert created successfully!</span>
          </div>
        )}
        
        {isCreating && (
          <Card className="mb-4 border-border/50 bg-card/30 overflow-hidden">
            <CardHeader className="py-3 px-4 bg-secondary/20">
              <CardTitle className="text-base">Create New Alert</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input 
                      id="alert-name" 
                      placeholder="My Custom Alert"
                      value={newAlert.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-type">Alert Type</Label>
                      <Select 
                        value={newAlert.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger id="alert-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price Alert</SelectItem>
                          <SelectItem value="arbitrage">Arbitrage Opportunity</SelectItem>
                          <SelectItem value="technical">Technical Indicator</SelectItem>
                          <SelectItem value="volume">Volume Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alert-asset">Asset</Label>
                      <Select 
                        value={newAlert.asset}
                        onValueChange={(value) => handleInputChange("asset", value)}
                      >
                        <SelectTrigger id="alert-asset">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                          <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                          <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-condition">Condition</Label>
                      <Select 
                        value={newAlert.condition}
                        onValueChange={(value) => handleInputChange("condition", value as AlertCondition)}
                      >
                        <SelectTrigger id="alert-condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="crosses_above">Crosses Above</SelectItem>
                          <SelectItem value="crosses_below">Crosses Below</SelectItem>
                          <SelectItem value="percent_change">Percent Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alert-value">Value</Label>
                      <Input 
                        id="alert-value" 
                        type="number"
                        value={newAlert.value}
                        onChange={(e) => handleInputChange("value", parseFloat(e.target.value))}
                        placeholder={newAlert.condition === "percent_change" ? "e.g., 5 for 5%" : "e.g., 40000"}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-frequency">Alert Frequency</Label>
                    <Select 
                      value={newAlert.frequency}
                      onValueChange={(value) => handleInputChange("frequency", value as AlertFrequency)}
                    >
                      <SelectTrigger id="alert-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="always">Always</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-app" 
                          checked={newAlert.channels.includes("app")}
                          onCheckedChange={() => handleChannelToggle("app")}
                        />
                        <Label htmlFor="channel-app" className="text-sm">In-App Notification</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-email" 
                          checked={newAlert.channels.includes("email")}
                          onCheckedChange={() => handleChannelToggle("email")}
                        />
                        <Label htmlFor="channel-email" className="text-sm">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-telegram" 
                          checked={newAlert.channels.includes("telegram")}
                          onCheckedChange={() => handleChannelToggle("telegram")}
                        />
                        <Label htmlFor="channel-telegram" className="text-sm">Telegram</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-browser" 
                          checked={newAlert.channels.includes("browser")}
                          onCheckedChange={() => handleChannelToggle("browser")}
                        />
                        <Label htmlFor="channel-browser" className="text-sm">Browser Notification</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={handleCreateAlert} className="w-full gap-2">
                      <Save className="h-4 w-4" />
                      Create Alert
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Your Alerts ({alerts.length})</h3>
            <Button variant="ghost" size="sm" className="text-xs h-8">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Settings
            </Button>
          </div>
          
          {alerts.length === 0 ? (
            <div className="p-6 text-center border rounded-md bg-card/30">
              <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">No Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">You haven't created any alerts yet</p>
              <Button size="sm" onClick={() => setIsCreating(true)}>Create Alert</Button>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {alerts.map((alert) => (
                <AccordionItem value={alert.id} key={alert.id} className="border-b border-border/50">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <div 
                          className={cn(
                            "h-3 w-3 rounded-full",
                            alert.active ? "bg-crypto-green" : "bg-muted-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.asset} {formatCondition(alert)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAlert(alert.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={alert.active ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 min-w-[80px]",
                          alert.active ? "bg-crypto-green" : ""
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAlertStatus(alert.id);
                        }}
                      >
                        {alert.active ? "Active" : "Inactive"}
                      </Button>
                      <AccordionTrigger className="py-0" />
                    </div>
                  </div>
                  <AccordionContent className="px-8 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Frequency</span>
                        <span className="font-medium">{alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Channels</span>
                        <span className="font-medium">{alert.channels.length}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{alert.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2 mt-1">
                        <BellDot className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Notifications will be sent to: {alert.channels.join(", ")}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
