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
  LogOut,
  Computer
} from "lucide-react";
import { ExchangeApiManager } from "@/components/profile/ExchangeApiManager";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useSupabase();
  const isDemo = window.localStorage.getItem('demo_bypass_token') === 'enabled';
  
  const handleSignOut = async () => {
    try {
      console.log('Sign-out initiated');
      if (isDemo) {
        // In demo mode, just clear the local storage token
        window.localStorage.removeItem('demo_bypass_token');
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
            <Tabs defaultValue="exchanges">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
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
                        <Input id="name" defaultValue={userData.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={userData.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={userData.name.toLowerCase().replace(/\s+/g, '')} />
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
                      <Input id="timezone" defaultValue="UTC+3:00 (Moscow, Istanbul)" />
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
                        <Button variant="outline" className="mt-2">Set Up 2FA</Button>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Session Management</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage your active sessions and devices
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="rounded-md border p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Computer className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Current Device</p>
                                <p className="text-xs text-muted-foreground">
                                  Last active: Just now
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
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
                      Manage your cryptocurrency exchange API keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExchangeApiManager userId={userData.userId} />
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

// Computer icon component
function Computer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="12" rx="2" ry="2" />
      <line x1="2" x2="22" y1="20" y2="20" />
    </svg>
  );
}
