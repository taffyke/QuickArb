import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Home,
  Menu,
  Settings,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "Arbitrage",
    icon: GitCompareArrows,
    href: "/arbitrage",
    subItems: [
      { title: "Direct", href: "/arbitrage/direct" },
      { title: "Triangular", href: "/arbitrage/triangular" },
      { title: "Futures", href: "/arbitrage/futures" },
      { title: "Stablecoin", href: "/arbitrage/stablecoin" },
      { title: "P2P", href: "/arbitrage/p2p" }
    ]
  },
  {
    title: "Arbitrage Bot",
    icon: Bot,
    href: "/arbitrage-bot",
  },
  {
    title: "Market Analysis",
    icon: AreaChart,
    href: "/market-analysis",
  },
  {
    title: "Profile",
    icon: UserCircle,
    href: "/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [expandedSubMenus, setExpandedSubMenus] = useState<{ [key: string]: boolean }>({
    "/arbitrage": true
  });

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleSubMenu = (href: string) => {
    setExpandedSubMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {expanded ? (
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">ArbitrageScanner</span>
          </div>
        ) : (
          <GitCompareArrows className="h-6 w-6 mx-auto text-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={toggleSidebar}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isCurrentPath = location.pathname === item.href || 
                                 (item.subItems && item.subItems.some(sub => location.pathname === sub.href));
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubMenuExpanded = expandedSubMenus[item.href];

            return (
              <li key={item.href}>
                {hasSubItems ? (
                  <div>
                    <Button
                      variant={isCurrentPath ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        !expanded && "justify-center p-2"
                      )}
                      onClick={() => toggleSubMenu(item.href)}
                    >
                      <item.icon className={cn("h-5 w-5", expanded && "mr-2")} />
                      {expanded && (
                        <span className="flex-1 text-left">{item.title}</span>
                      )}
                      {expanded && hasSubItems && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isSubMenuExpanded && "rotate-90"
                          )}
                        />
                      )}
                    </Button>
                    {expanded && isSubMenuExpanded && (
                      <ul className="ml-6 space-y-1 mt-1">
                        {item.subItems?.map((subItem) => (
                          <li key={subItem.href}>
                            <Link to={subItem.href}>
                              <Button
                                variant={location.pathname === subItem.href ? "secondary" : "ghost"}
                                className="w-full justify-start h-9"
                              >
                                {subItem.title}
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link to={item.href}>
                    <Button
                      variant={isCurrentPath ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        !expanded && "justify-center p-2"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", expanded && "mr-2")} />
                      {expanded && <span>{item.title}</span>}
                    </Button>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
