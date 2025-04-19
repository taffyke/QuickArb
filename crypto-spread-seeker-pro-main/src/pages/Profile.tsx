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
  Clock 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  // This component uses Tabs from shadcn/ui
  const [activeTab, setActiveTab] = useState("profile");
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
        
        <div className="flex flex-col xs:flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <Card className="bg-card/50 border-border/50 lg:h-fit lg:sticky top-6">
            <CardHeader className="p-4 flex flex-row lg:flex-col gap-4 items-center lg:items-start">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={userData.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">AJ</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userData.name}</CardTitle>
                <CardDescription>{userData.email}</CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20">
                    {userData.plan} Plan
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {userData.joined}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 w-full h-auto bg-transparent gap-1 p-2 text-xs sm:text-sm">
                <TabsTrigger 
                  value="profile" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Personal Info</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="api-keys" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Key className="h-4 w-4 mr-2" />
                  <span>API Keys</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  <span>Preferences</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start px-3 py-2 h-9"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </Tabs>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="flex flex-col xs:flex-row gap-2">
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
                    <Switch 
                      checked={userData.twoFactorEnabled} 
                    />
                  </div>
                  {!userData.twoFactorEnabled && (
                    <Button variant="outline" className="gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Set Up 2FA</span>
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
                      <div>
                        <h4 className="font-medium">Current Session</h4>
                        <p className="text-sm text-muted-foreground">Windows Chrome • {userData.lastLogin}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
                      <div>
                        <h4 className="font-medium">Mobile App</h4>
                        <p className="text-sm text-muted-foreground">iOS • Yesterday</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Revoke
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full">Sign Out All Devices</Button>
                  </div>
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
                  {userData.apiKeys.map((key) => (
                    <div key={key.id} className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
                      <div>
                        <div className="flex items-center gap-2">
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
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Add New API Key</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exchange">Exchange</Label>
                      <Input id="exchange" placeholder="Select Exchange" />
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
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Default Currency</h3>
                        <p className="text-sm text-muted-foreground">Set your preferred currency</p>
                      </div>
                      <div className="w-[180px]">
                        <Input value="USD" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Date Format</h3>
                        <p className="text-sm text-muted-foreground">Choose how dates are displayed</p>
                      </div>
                      <div className="w-[180px]">
                        <Input value="MM/DD/YYYY" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Default View</h3>
                        <p className="text-sm text-muted-foreground">Set your default landing page</p>
                      </div>
                      <div className="w-[180px]">
                        <Input value="Dashboard" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Public Profile</h3>
                        <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                      </div>
                      <Switch checked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Profit/Loss</h3>
                        <p className="text-sm text-muted-foreground">Display your earnings on public profile</p>
                      </div>
                      <Switch checked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Activity Status</h3>
                        <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>
                  Manage your subscription plan and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Pro Plan</h3>
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Your subscription renews on May 18, 2025</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Upgrade Plan</Button>
                    <Button variant="outline" size="sm">Manage Subscription</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Payment Methods</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">•••• •••• •••• 4242</h3>
                        <p className="text-sm text-muted-foreground">Expires 05/2026</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">Default</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Add Payment Method</span>
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Billing History</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
                      <div>
                        <h4 className="font-medium">Pro Plan - Monthly</h4>
                        <p className="text-sm text-muted-foreground">April 18, 2025</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">$49.99</Badge>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
                      <div>
                        <h4 className="font-medium">Pro Plan - Monthly</h4>
                        <p className="text-sm text-muted-foreground">March 18, 2025</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">$49.99</Badge>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg divide-y">
                    {/* Notification 1 */}
                    <div className="p-4 hover:bg-accent/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                          <RefreshCw className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">New Arbitrage Opportunity</h4>
                            <span className="text-xs text-muted-foreground flex items-center ml-2">
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
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">New Login Detected</h4>
                            <span className="text-xs text-muted-foreground flex items-center ml-2">
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
                    
                    {/* Notification 3 */}
                    <div className="p-4 hover:bg-accent/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">System Update</h4>
                            <span className="text-xs text-muted-foreground flex items-center ml-2">
                              <Clock className="h-3 w-3 mr-1 inline-block" />
                              Yesterday
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            New features added to the arbitrage scanner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      Showing recent notifications
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/notifications')}
                      className="flex items-center gap-1"
                    >
                      <Bell className="h-4 w-4" />
                      View all notifications
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <h3 className="font-medium mb-3">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage how you receive notifications in the <Link to="/settings" className="text-primary hover:underline">Settings</Link> page.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/settings', { state: { activeTab: 'notifications' } })}
                        className="w-full"
                      >
                        Configure notifications
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/notifications')}
                        className="w-full"
                      >
                        View all notifications
                      </Button>
                    </div>
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
