import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { CryptoProvider } from "./contexts/crypto-context";
import { AppSettingsProvider } from "./contexts/app-settings-context";
import { NotificationsProvider } from "./contexts/notifications-manager";
import { SupabaseProvider } from "./contexts/supabase-context";
import { AuthGuard } from "./components/auth/AuthGuard";
import { Layout } from "./components/layout/layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DirectArbitrage from "./pages/arbitrage/DirectArbitrage";
import TriangularArbitrage from "./pages/arbitrage/TriangularArbitrage";
import FuturesArbitrage from "./pages/arbitrage/FuturesArbitrage";
import StablecoinArbitrage from "./pages/arbitrage/StablecoinArbitrage";
import P2PArbitrage from "./pages/arbitrage/P2PArbitrage";
import ArbitrageBot from "./pages/ArbitrageBot";
import MarketAnalysis from "./pages/MarketAnalysis";
import News from "./pages/News";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import Disclaimer from "./pages/legal/Disclaimer";
import TradingRules from "./pages/legal/TradingRules";
import Contact from "./pages/Contact";
import AuthCallback from "./routes/auth/callback";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoadingButton } from "./components/ui/loading-button";
import FuturisticLoadingAnimation from "./components/ui/loading-animation";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitiallyNavigated, setHasInitiallyNavigated] = useState(false);
  const [isPageRefresh, setIsPageRefresh] = useState(true);
  
  useEffect(() => {
    // Check if user has a previous session
    const hasSession = localStorage.getItem('userSession') === 'active';
    setIsAuthenticated(hasSession);
    
    // Detect if this is a page refresh or direct navigation
    const navigationTypePerformance = window.performance && 
      window.performance.navigation && 
      window.performance.navigation.type === 1;
      
    const navigationTypeEntry = performance.getEntriesByType && 
      performance.getEntriesByType("navigation").length > 0 && 
      performance.getEntriesByType("navigation")[0].type === "reload";
    
    // Set whether this is a page refresh
    const isRefresh = navigationTypePerformance || navigationTypeEntry;
    setIsPageRefresh(isRefresh);
    
    // Check if currently in the app (not on landing page)
    const currentPath = window.location.pathname;
    const isInApp = currentPath !== "/" && hasSession;
    
    // Skip loading screen if authenticated user is refreshing within the app
    if (hasSession && isRefresh && isInApp) {
      setIsLoading(false);
      setHasInitiallyNavigated(true);
    } else {
      // Simulate app initialization time only for first load or unauthenticated users
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasInitiallyNavigated(true);
    }, 3000); // Increased slightly to show the full animation
    
    return () => clearTimeout(timer);
    }
  }, []);
  
  // Listen for navigation events to set the flag
  useEffect(() => {
    const handleNavigationEvent = () => {
      setIsPageRefresh(false);
    };
    
    window.addEventListener('popstate', handleNavigationEvent);
    return () => window.removeEventListener('popstate', handleNavigationEvent);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="crypto-arbitrage-theme">
        <SupabaseProvider>
          <AppSettingsProvider>
            <NotificationsProvider>
              <CryptoProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  {isLoading ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                      <div className="flex flex-col items-center max-w-md w-full px-4">
                        <motion.div
                          className="relative h-20 w-20 mb-6"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-primary opacity-75 blur-lg"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div 
                            className="relative h-full w-full rounded-full bg-card flex items-center justify-center border-2 border-primary/50"
                            animate={{ 
                              rotate: [0, 10, 0, -10, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <span className="text-primary text-2xl font-bold">CSS</span>
                          </motion.div>
                        </motion.div>
                        
                        <motion.h2
                          className="text-xl font-bold mb-6 text-foreground"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Crypto Spread Seeker Pro
                          </span>
                        </motion.h2>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="mb-6"
                        >
                          <FuturisticLoadingAnimation 
                            text="Initializing" 
                            size="lg"
                          />
                        </motion.div>
                        
                        <motion.p
                          className="text-sm text-muted-foreground text-center max-w-xs"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          Connecting to exchanges and preparing your arbitrage dashboard
                        </motion.p>
                      </div>
                    </div>
                  ) : (
                    <BrowserRouter>
                      <Routes>
                        {/* Landing page route - only shown on page refresh or first visit */}
                        <Route 
                          path="/" 
                          element={
                            isAuthenticated && !isPageRefresh ? 
                              <Navigate to="/dashboard" replace /> : 
                              <Landing />
                          } 
                        />
                        
                        {/* Protected routes */}
                        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/arbitrage/direct" element={<DirectArbitrage />} />
                          <Route path="/arbitrage/triangular" element={<TriangularArbitrage />} />
                          <Route path="/arbitrage/futures" element={<FuturesArbitrage />} />
                          <Route path="/arbitrage/stablecoin" element={<StablecoinArbitrage />} />
                          <Route path="/arbitrage/p2p" element={<P2PArbitrage />} />
                          <Route path="/arbitrage" element={<DirectArbitrage />} />
                          <Route path="/arbitrage-bot" element={<ArbitrageBot />} />
                          <Route path="/market-analysis" element={<MarketAnalysis />} />
                          <Route path="/news" element={<News />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/disclaimer" element={<Disclaimer />} />
                          <Route path="/rules" element={<TradingRules />} />
                          <Route path="/contact" element={<Contact />} />
                        </Route>
                        
                        {/* Auth callback route */}
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        
                        {/* Catch-all routes - direct to dashboard when already authenticated */}
                        <Route 
                          path="*" 
                          element={
                            isAuthenticated ? 
                              <Navigate to="/dashboard" replace /> : 
                              <Navigate to="/" replace />
                          } 
                        />
                      </Routes>
                    </BrowserRouter>
                  )}
                </TooltipProvider>
              </CryptoProvider>
            </NotificationsProvider>
          </AppSettingsProvider>
        </SupabaseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Track user session on login
export const setUserLoggedIn = () => {
  localStorage.setItem('userSession', 'active');
};

// Clear user session on logout
export const setUserLoggedOut = () => {
  localStorage.removeItem('userSession');
};

export default App; 