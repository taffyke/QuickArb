import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  // Handle sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      // Try to restore sidebar state from localStorage
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState) {
        setSidebarOpen(savedState === "true");
      }
    }
  }, [isMobile]);
  
  // Persist sidebar state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarOpen", String(sidebarOpen));
    }
  }, [sidebarOpen, isMobile]);
  
  // Load and apply theme from localStorage on mount
  useEffect(() => {
    // Force dark theme to match arbitragescanner.io
    setTheme("dark");
  }, [setTheme]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      <div className="flex flex-1 w-full overflow-hidden">
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block transition-all duration-300 h-screen`}>
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarToggle={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-background to-background/80">
            <Outlet />
          </main>
        </div>
      </div>
      
      <footer className="border-t bg-background py-6 px-6 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} QuickArb
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/disclaimer" className="hover:text-primary transition-colors">
                Risk Disclaimer
              </Link>
              <Link to="/rules" className="hover:text-primary transition-colors">
                Trading Rules
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="flex items-center">
                Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> for crypto traders
              </span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-xs text-center text-muted-foreground max-w-3xl mx-auto">
            <p>
              Trading cryptocurrencies involves risk. This application is provided for informational purposes only
              and does not constitute investment advice. Always conduct your own research and consider consulting 
              a professional financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
