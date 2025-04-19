import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar, 
  Check, 
  ChevronsUpDown, 
  Copy, 
  Edit, 
  Eye, 
  EyeOff, 
  Key, 
  LifeBuoy, 
  Lock, 
  Mail, 
  Search, 
  Shield, 
  User, 
  UserCog, 
  Wallet, 
  RefreshCw, 
  Clock,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exchangeNames, exchanges, getExchangeByName } from "@/constants/exchanges";

export default function Profile() {
  const navigate = useNavigate();
  
  // Mock user data
  const userData = {
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "Pro",
    joined: "April 2024",
    lastLogin: "2 hours ago",
    avatarUrl: "",
    notificationsEnabled: true,
    twoFactorEnabled: false,
    savedExchanges: ["Binance", "Coinbase", "KuCoin"],
    apiKeys: [
      { id: "api1", exchange: "Binance", label: "Main Account", lastUsed: "Today" },
      { id: "api2", exchange: "Coinbase", label: "Trading Bot", lastUsed: "Yesterday" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-background/50 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            
            <div className="flex flex-row gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              <Button variant="destructive" size="sm" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Info Card */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 border-2 border-primary/70 mb-3">
                    <AvatarImage src={userData.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">AJ</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{userData.name}</CardTitle>
                  <CardDescription className="text-sm">{userData.email}</CardDescription>
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                    <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-medium">
                      {userData.plan} Plan
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {userData.joined}
                    </span>
                  </div>
                </div>
                
                <div className="w-full p-2 rounded-lg bg-muted/40 text-xs">
                  <p className="font-medium text-foreground/80 text-center">Last login: {userData.lastLogin}</p>
                </div>
              </CardHeader>
            </Card>
          </div>
      
          {/* Tabs Section */}
          <div className="flex-1">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="flex w-full h-auto mb-4 bg-muted/50 p-1 overflow-x-auto">
                <TabsTrigger value="profile" className="flex-1">
                  <User className="h-4 w-4 mr-2" />
                  <span>Personal Info</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-1">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="api-keys" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  <span>API Keys</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex-1">
                  <UserCog className="h-4 w-4 mr-2" />
                  <span>Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Tab Content */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={userData.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={userData.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value="ajohnson" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Enter your phone number" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" placeholder="Tell us about yourself..." />
                      <p className="text-xs text-muted-foreground">
                        This will be displayed on your public profile
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" value="UTC+3:00 (Moscow, Istanbul)" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-3">
                      <Button>Save Changes</Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Protect your account with additional security layers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div></div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <Button>Update Password</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch checked={userData.twoFactorEnabled} />
                      </div>
                      {!userData.twoFactorEnabled && (
                        <Button variant="outline" className="gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Set Up 2FA</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api-keys">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage your exchange API keys for automated trading
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {userData.apiKeys.map((key) => {
                        const exchangeInfo = getExchangeByName(key.exchange);
                        return (
                          <div key={key.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg bg-card border border-border/50 gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                {exchangeInfo?.logo && (
                                  <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm bg-card">
                                    <img 
                                      src={exchangeInfo.logo} 
                                      alt={key.exchange} 
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <h4 className="font-medium">{key.exchange}</h4>
                                <Badge variant="outline">{key.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Last used: {key.lastUsed}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Add New API Key</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exchange">Exchange</Label>
                          <Select>
                            <SelectTrigger id="exchange">
                              <SelectValue placeholder="Select Exchange" />
                            </SelectTrigger>
                            <SelectContent>
                              {exchangeNames.map((exchange) => {
                                const exchangeInfo = getExchangeByName(exchange);
                                return (
                                  <SelectItem key={exchange} value={exchange}>
                                    <div className="flex items-center gap-2">
                                      {exchangeInfo?.logo && (
                                        <div className="w-4 h-4 flex items-center justify-center overflow-hidden rounded-sm">
                                          <img 
                                            src={exchangeInfo.logo} 
                                            alt={exchange} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              // Fallback if image fails to load
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      )}
                                      {exchange}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="key-label">Label</Label>
                          <Input id="key-label" placeholder="e.g. Trading Bot, Main Account" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <Input id="api-key" placeholder="Enter your API key" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="api-secret">API Secret</Label>
                          <Input id="api-secret" type="password" placeholder="Enter your API secret" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="read-only" />
                        <Label htmlFor="read-only">Read-only access (recommended)</Label>
                      </div>
                      <Button>Add API Key</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>User Preferences</CardTitle>
                    <CardDescription>
                      Customize your trading and application experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Display Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Default Currency</h3>
                            <p className="text-sm text-muted-foreground">Set your preferred currency</p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="USD" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Date Format</h3>
                            <p className="text-sm text-muted-foreground">Choose how dates are displayed</p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="MM/DD/YYYY" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Default View</h3>
                            <p className="text-sm text-muted-foreground">Set your default landing page</p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="Dashboard" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Recent alerts and important information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                      {/* Notification 1 */}
                      <div className="p-4 hover:bg-accent/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                              <h4 className="font-medium text-sm">New Arbitrage Opportunity</h4>
                              <span className="text-xs text-muted-foreground flex items-center mt-1 sm:mt-0 sm:ml-2">
                                <Clock className="h-3 w-3 mr-1 inline-block" />
                                Just now
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              BTC/USDT spread of 2.3% detected between Binance and Kraken
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Notification 2 */}
                      <div className="p-4 hover:bg-accent/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                              <h4 className="font-medium text-sm">New Login Detected</h4>
                              <span className="text-xs text-muted-foreground flex items-center mt-1 sm:mt-0 sm:ml-2">
                                <Clock className="h-3 w-3 mr-1 inline-block" />
                                2 hours ago
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              New login from Chicago, United States
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-2">
                      <p className="text-sm text-muted-foreground">
                        Showing recent notifications
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/notifications')}
                        className="flex items-center gap-1 w-full sm:w-auto"
                      >
                        <Bell className="h-4 w-4" />
                        View all notifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
