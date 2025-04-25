import { Bell, Search, User, Command, ArrowRight, Home, GitCompareArrows, Bot, LineChart, BarChart3, Settings, Wallet, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { DataModeSwitch } from "@/components/DataModeSwitch";
import { UserMenu } from "@/components/auth/UserMenu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Sample notification data for the sliding toast
const recentNotifications = [
  {
    id: 1,
    title: "New Arbitrage Opportunity",
    description: "BTC/USDT spread of 2.3% detected",
    time: "Just now"
  },
  {
    id: 2,
    title: "New Login Detected",
    description: "Login from Chicago, United States",
    time: "2 hours ago"
  },
  {
    id: 3,
    title: "System Update",
    description: "New features added to the scanner",
    time: "Yesterday"
  }
];

// Navigation items for search
const navigationItems = [
  {
    category: "Main",
    items: [
      { name: "Dashboard", icon: Home, href: "/dashboard" },
      { name: "Profile", icon: User, href: "/profile" },
      { name: "Notifications", icon: Bell, href: "/notifications" },
      { name: "Settings", icon: Settings, href: "/settings" },
    ]
  },
  {
    category: "Arbitrage",
    items: [
      { name: "Direct Arbitrage", icon: GitCompareArrows, href: "/arbitrage/direct" },
      { name: "Triangular Arbitrage", icon: GitCompareArrows, href: "/arbitrage/triangular" },
      { name: "Futures Arbitrage", icon: GitCompareArrows, href: "/arbitrage/futures" },
      { name: "Stablecoin Arbitrage", icon: GitCompareArrows, href: "/arbitrage/stablecoin" },
      { name: "P2P Arbitrage", icon: GitCompareArrows, href: "/arbitrage/p2p" },
      { name: "Arbitrage Bot", icon: Bot, href: "/arbitrage-bot" },
    ]
  },
  {
    category: "Analysis",
    items: [
      { name: "Market Analysis", icon: LineChart, href: "/market-analysis" },
      { name: "Market Insights", icon: BarChart3, href: "/market-insights" },
    ]
  },
  {
    category: "Account",
    items: [
      { name: "Billing & Subscription", icon: CreditCard, href: "/settings", state: { activeTab: "billing" } },
      { name: "API Keys", icon: Command, href: "/profile", state: { activeTab: "api-keys" } },
    ]
  }
];

type HeaderProps = {
  sidebarToggle: () => void;
};

export function Header({ sidebarToggle }: HeaderProps) {
  const navigate = useNavigate();
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Function to handle search and provide shortcuts
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      
      // Enhanced shortcut handling
      if (query.includes('arb') || query.includes('arbitrage')) {
        if (query.includes('direct')) {
          navigate('/arbitrage/direct');
        } else if (query.includes('triangular')) {
          navigate('/arbitrage/triangular');
        } else if (query.includes('futures')) {
          navigate('/arbitrage/futures');
        } else if (query.includes('p2p')) {
          navigate('/arbitrage/p2p');
        } else {
          navigate('/arbitrage/direct');
        }
      } else if (query.includes('dash')) {
        navigate('/dashboard');
      } else if (query.includes('profile')) {
        navigate('/profile');
      } else if (query.includes('set') || query.includes('config')) {
        navigate('/settings');
      } else if (query.includes('bot')) {
        navigate('/arbitrage-bot');
      } else if (query.includes('market') || query.includes('analysis')) {
        navigate('/market-analysis');
      } else if (query.includes('not') || query.includes('alert')) {
        navigate('/notifications');
      } else if (query.includes('bill') || query.includes('payment') || query.includes('subscription')) {
        navigate('/settings', { state: { activeTab: 'billing' } });
      }
    } else if (e.key === '/') {
      // Open search dialog on '/' key
      e.preventDefault();
      setSearchOpen(true);
    }
  };

  // Navigate to item when selected in command dialog
  const navigateToItem = (item: any) => {
    setSearchOpen(false);
    if (item.state) {
      navigate(item.href, { state: item.state });
    } else {
      navigate(item.href);
    }
  };

  // Navigate to settings with the billing tab active
  const navigateToSettingsBilling = () => {
    navigate('/settings', { state: { activeTab: 'billing' } });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search dialog on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Open search dialog on '/' key when not in an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show notification toast on mount and update it periodically
  useEffect(() => {
    // Show notification toast after a delay
    const showToastTimeout = setTimeout(() => {
      setShowNotificationToast(true);
    }, 1500);
    
    // Setup interval to cycle through notifications
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % recentNotifications.length);
    }, 5000);
    
    // Hide toast after some time
    const hideToastTimeout = setTimeout(() => {
      setShowNotificationToast(false);
    }, 20000);
    
    return () => {
      clearTimeout(showToastTimeout);
      clearTimeout(hideToastTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-2 sm:px-4 lg:px-6">
      <Button variant="outline" size="icon" className="mr-3 lg:hidden" onClick={sidebarToggle}>
        <Search className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="relative hidden sm:flex sm:w-full md:w-64 md:items-center max-w-xs">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search or type / to open menu..."
          className="w-full rounded-lg pl-8 text-sm sm:w-full md:w-64 lg:w-80"
          onKeyDown={handleSearch}
          onClick={() => setSearchOpen(true)}
          readOnly
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search for pages, features, or type a command..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          ref={searchInputRef}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigationItems.map((group) => (
            <CommandGroup key={group.category} heading={group.category}>
              {group.items.map((item) => (
                <CommandItem 
                  key={item.href} 
                  onSelect={() => navigateToItem(item)}
                  className="flex items-center"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.name}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Shortcuts">
            <CommandItem onSelect={() => navigate("/arbitrage/direct")}>
              <kbd className="mr-2 rounded bg-muted px-1.5 text-xs">arb</kbd>
              <span>Go to Arbitrage</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/dashboard")}>
              <kbd className="mr-2 rounded bg-muted px-1.5 text-xs">dash</kbd>
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/notifications")}>
              <kbd className="mr-2 rounded bg-muted px-1.5 text-xs">not</kbd>
              <span>Go to Notifications</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/settings")}>
              <kbd className="mr-2 rounded bg-muted px-1.5 text-xs">set</kbd>
              <span>Go to Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className="flex items-center gap-2">
        <DataModeSwitch />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/notifications">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    3
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <UserMenu />
      </div>

      {/* Notification toast */}
      {showNotificationToast && (
        <div className="absolute right-0 top-12 z-50 w-72 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="rounded-lg border bg-card p-4 shadow-lg">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium flex items-center">
                <Bell className="mr-1 h-3 w-3" />
                New Notification
              </span>
              <span className="text-xs text-muted-foreground">
                {recentNotifications[currentNotification].time}
              </span>
            </div>
            <p className="text-sm font-medium">{recentNotifications[currentNotification].title}</p>
            <p className="text-xs text-muted-foreground">
              {recentNotifications[currentNotification].description}
            </p>
            <div className="mt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => navigate('/notifications')}
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
