import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/contexts/supabase-context";
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
  ChevronRight,
  LogOut
} from "lucide-react";
import { ExchangeApiManager } from "@/components/profile/ExchangeApiManager";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useSupabase();
  const isDemo = localStorage.getItem('demo_bypass_token') === 'enabled';
  
  const handleSignOut = async () => {
    try {
      console.log('Sign-out initiated');
      if (isDemo) {
        // In demo mode, just clear the local storage token
        localStorage.removeItem('demo_bypass_token');
        console.log('Demo token removed');
        navigate('/');
      } else {
        // Real sign out
        await signOut();
        console.log('User signed out');
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // User data with fallbacks to demo data
  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Demo User",
    email: user?.email || "demo@example.com",
    plan: "Pro",
    joined: "April 2024",
    lastLogin: "2 hours ago",
    avatarUrl: user?.user_metadata?.avatar_url || "",
    notificationsEnabled: true,
    twoFactorEnabled: false,
    savedExchanges: ["Binance", "Coinbase", "KuCoin"],
    userId: user?.id || "demo-user"
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
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
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>{isDemo ? 'Exit Demo Mode' : 'Sign Out'}</span>
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
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{userData.name}</CardTitle>
                  <CardDescription className="text-sm">{userData.email}</CardDescription>
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                    <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-medium">
                      {userData.plan} Plan
                    </Badge>
                    {isDemo && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">
                        Demo Mode
                      </Badge>
                    )}
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
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
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
                    <CardTitle>Exchange API Keys</CardTitle>
                    <CardDescription>
                      Manage your exchange API keys for automated trading and arbitrage detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ExchangeApiManager userId={userData.userId} />
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
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Trading Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Confirm Trades</h3>
                            <p className="text-sm text-muted-foreground">
                              Show confirmation dialog before executing trades
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium">Default Trading Amount</h3>
                            <p className="text-sm text-muted-foreground">Pre-filled amount in trading forms</p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="1000" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Test Mode</h3>
                            <p className="text-sm text-muted-foreground">
                              Simulate trades without using real funds
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                    <Button>Save Preferences</Button>
                      <Button variant="outline">Reset to Defaults</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how and when you receive alerts and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Price Alerts</h4>
                            <p className="text-sm text-muted-foreground">
                              Notify when coins reach target prices
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Arbitrage Opportunities</h4>
                            <p className="text-sm text-muted-foreground">
                              Notify when profit opportunity is detected
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Security Alerts</h4>
                            <p className="text-sm text-muted-foreground">
                              Login attempts and security-related notifications
                            </p>
                          </div>
                          <Switch defaultChecked />
                            </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">News Alerts</h4>
                            <p className="text-sm text-muted-foreground">
                              Major news related to your watchlist
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Delivery Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch defaultChecked />
                            </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Desktop Notifications</h4>
                            <p className="text-sm text-muted-foreground">
                              Show notifications in browser or desktop app
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Settings</h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-medium">Min. Profit Threshold</h4>
                            <p className="text-sm text-muted-foreground">
                              Only notify for arbitrage above this percent
                            </p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="2.0" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-medium">Alert Frequency</h4>
                      <p className="text-sm text-muted-foreground">
                              How often to receive similar notifications
                            </p>
                          </div>
                          <div className="w-full sm:w-[180px]">
                            <Input value="Real-time" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button>Save Notification Settings</Button>
                      <Button variant="outline">Reset</Button>
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
