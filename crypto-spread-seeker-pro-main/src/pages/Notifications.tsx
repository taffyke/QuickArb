import { Bell, Check, Clock, RefreshCcw, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Mock notification data
const notifications = [
  {
    id: 1,
    type: "arbitrage",
    title: "New Arbitrage Opportunity",
    description: "BTC/USDT spread of 2.3% detected between Binance and Kraken",
    time: "Just now",
    read: false,
    action: "/arbitrage/direct"
  },
  {
    id: 2,
    type: "security",
    title: "New Login Detected",
    description: "New login from Chicago, United States",
    time: "2 hours ago",
    read: false,
    action: "/settings/security"
  },
  {
    id: 3,
    type: "system",
    title: "System Update",
    description: "New features added to the arbitrage scanner",
    time: "Yesterday",
    read: true,
    action: "/arbitrage/direct"
  },
  {
    id: 4,
    type: "arbitrage",
    title: "Triangular Arbitrage Alert",
    description: "BTC → ETH → USDT → BTC opportunity with 1.8% profit",
    time: "2 days ago",
    read: true,
    action: "/arbitrage/triangular"
  },
  {
    id: 5,
    type: "system",
    title: "Account Verification",
    description: "Your account has been successfully verified",
    time: "3 days ago",
    read: true,
    action: "/profile"
  },
  {
    id: 6,
    type: "arbitrage",
    title: "Futures Arbitrage Alert",
    description: "ETH futures premium of 1.5% detected on Binance",
    time: "1 week ago",
    read: true,
    action: "/arbitrage/futures"
  }
];

export default function Notifications() {
  const [notificationsData, setNotificationsData] = useState(notifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notificationsData.filter(n => !n.read).length;
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotificationsData(notificationsData.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  // Mark single notification as read
  const markAsRead = (id: number) => {
    setNotificationsData(notificationsData.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notificationsData.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important alerts and information
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge className="ml-2 bg-primary/20 text-primary" variant="secondary">
                {notificationsData.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary" variant="default">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {activeTab === "all" ? "All Notifications" :
                 activeTab === "unread" ? "Unread Notifications" :
                 `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications`}
              </CardTitle>
              <CardDescription>
                {activeTab === "all" ? "View all your notifications" :
                 activeTab === "unread" ? "Notifications you haven't read yet" :
                 `Notifications related to ${activeTab}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No notifications</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You don't have any {activeTab !== "all" ? activeTab + " " : ""}notifications at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="group">
                      <Link 
                        to={notification.action}
                        className="block"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`
                          flex items-start p-3 rounded-lg -mx-3 hover:bg-accent/50 
                          transition-colors relative ${!notification.read ? 'bg-accent/30' : ''}
                        `}>
                          {!notification.read && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                          )}
                          
                          <div className="flex-shrink-0 mr-4">
                            {notification.type === 'arbitrage' && (
                              <div className="h-9 w-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                <RefreshCcw className="h-5 w-5" />
                              </div>
                            )}
                            {notification.type === 'security' && (
                              <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            {notification.type === 'system' && (
                              <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Bell className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground flex items-center ml-2">
                                <Clock className="h-3 w-3 mr-1 inline-block" />
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Customize how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-arbitrage">Arbitrage Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify about new arbitrage opportunities</p>
                    </div>
                    <Switch id="notify-arbitrage" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-security">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify about login attempts and security events</p>
                    </div>
                    <Switch id="notify-security" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-system">System Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify about platform updates and changes</p>
                    </div>
                    <Switch id="notify-system" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel-app">In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications in the application</p>
                    </div>
                    <Switch id="channel-app" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel-email">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to your email</p>
                    </div>
                    <Switch id="channel-email" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="channel-browser">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                    </div>
                    <Switch id="channel-browser" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-arbitrage">Minimum Arbitrage %</Label>
                  <Input 
                    id="min-arbitrage" 
                    type="number" 
                    placeholder="1.0" 
                    defaultValue="0.5"
                  />
                  <p className="text-xs text-muted-foreground">Only notify for arbitrage opportunities above this percentage</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="quiet-hours-start" 
                      type="time" 
                      defaultValue="22:00"
                      className="w-full"
                    />
                    <span>to</span>
                    <Input 
                      id="quiet-hours-end" 
                      type="time" 
                      defaultValue="07:00"
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Don't send notifications during these hours</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 