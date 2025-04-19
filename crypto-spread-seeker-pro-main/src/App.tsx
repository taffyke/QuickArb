import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { CryptoProvider } from "./contexts/crypto-context";
import { Layout } from "./components/layout/layout";
import Dashboard from "./pages/Dashboard";
import DirectArbitrage from "./pages/arbitrage/DirectArbitrage";
import TriangularArbitrage from "./pages/arbitrage/TriangularArbitrage";
import FuturesArbitrage from "./pages/arbitrage/FuturesArbitrage";
import StablecoinArbitrage from "./pages/arbitrage/StablecoinArbitrage";
import P2PArbitrage from "./pages/arbitrage/P2PArbitrage";
import ArbitrageBot from "./pages/ArbitrageBot";
import MarketAnalysis from "./pages/MarketAnalysis";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import Disclaimer from "./pages/legal/Disclaimer";
import TradingRules from "./pages/legal/TradingRules";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="crypto-arbitrage-theme">
      <CryptoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/arbitrage/direct" element={<DirectArbitrage />} />
                <Route path="/arbitrage/triangular" element={<TriangularArbitrage />} />
                <Route path="/arbitrage/futures" element={<FuturesArbitrage />} />
                <Route path="/arbitrage/stablecoin" element={<StablecoinArbitrage />} />
                <Route path="/arbitrage/p2p" element={<P2PArbitrage />} />
                <Route path="/arbitrage" element={<DirectArbitrage />} />
                <Route path="/arbitrage-bot" element={<ArbitrageBot />} />
                <Route path="/market-analysis" element={<MarketAnalysis />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/rules" element={<TradingRules />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CryptoProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
