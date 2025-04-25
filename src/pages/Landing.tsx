import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Info, ArrowRight, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomLink } from "@/components/CustomLink";
import { AnimatedSection } from "@/components/AnimatedSection";
import { staggerContainer, fadeIn, logoFloatAnimation } from "@/lib/animations";
import { loadExchangeLogos, ExchangeLogo } from "@/lib/exchangeLogos";
import FuturisticLoadingAnimation from "@/components/ui/loading-animation";
import { EnhancedLoadingButton } from "@/components/ui/loading-button";
import InfiniteMarquee from "@/components/ui/infinite-marquee";

// The exchange logos for the scrolling marquee
const exchangeLogos = [
  { name: "Binance", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/binance.png" },
  { name: "Bybit", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bybit.png" },
  { name: "KuCoin", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kucoin.png" },
  { name: "OKX", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/okx.png" },
  { name: "Gate.io", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gate.png" },
  { name: "Coinbase", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/coinbase.png" },
  { name: "Kraken", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kraken.png" },
  { name: "Bitfinex", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitfinex.png" },
  { name: "Gemini", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gemini.png" },
  { name: "Bitget", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitget.png" },
  { name: "Bitmart", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitmart.png" },
  { name: "Poloniex", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/poloniex.png" },
  { name: "MEXC", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/mexc.png" },
  { name: "HTX", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/htx.png" },
  { name: "Bitrue", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitrue.png" },
  { name: "AscendEX", logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/ascendex.png" },
];

export default function Landing() {
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [exchangeLogos, setExchangeLogos] = useState<ExchangeLogo[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);
  
  // Exchange names to load
  const exchangeNames = [
    "Binance", "Bybit", "KuCoin", "OKX", "Gate.io", "Coinbase", 
    "Kraken", "Bitfinex", "Gemini", "Bitget", "Bitmart", "Poloniex", "MEXC"
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(1 - scrollY / 500, 0);
      setHeroOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Load exchange logos
  useEffect(() => {
    const fetchExchangeLogos = async () => {
      setIsLoadingExchanges(true);
      try {
        const logos = await loadExchangeLogos(exchangeNames);
        setExchangeLogos(logos);
      } catch (error) {
        console.error("Failed to load exchange logos:", error);
      } finally {
        setIsLoadingExchanges(false);
      }
    };
    
    fetchExchangeLogos();
  }, []);

  return (
    <>
      {/* Hero Section with MetaMask-inspired animations */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0" style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}>
          {/* Dynamic particle background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900/70 to-purple-900/40"></div>
          
          {/* Matrix-like falling digital particles */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-10 bg-gradient-to-b from-primary/80 to-transparent"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  opacity: 0.4 + Math.random() * 0.6
                }}
                animate={{
                  y: ['0vh', '100vh'],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 7,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
          
          {/* NEW: Login-style futuristic loading animations scattered across background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 140 + Math.random() * 100,
                  height: 140 + Math.random() * 100,
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                  opacity: 0.1 + Math.random() * 0.15,
                  pointerEvents: 'none'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 + Math.random() * 0.15 }}
                transition={{ duration: 3, delay: i * 0.8 }}
              >
                {/* Outer pulsing ring with gradient */}
                <motion.div 
                  className="absolute rounded-full border-4 border-transparent"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    background: `conic-gradient(from ${i * 90}deg, rgba(58, 255, 236, 0.5), rgba(100, 100, 255, 0.5), rgba(58, 255, 236, 0.1), rgba(58, 255, 236, 0.5))`
                  }}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                
                {/* Secondary outer ring with dash effect */}
                <motion.div 
                  className="absolute rounded-full border-dashed border-4 border-primary/20"
                  style={{ 
                    width: '80%', 
                    height: '80%',
                    top: '10%',
                    left: '10%'
                  }}
                  animate={{ 
                    rotate: -360,
                  }}
                  transition={{ 
                    rotate: { duration: 15 + i * 3, repeat: Infinity, ease: "linear" },
                  }}
                />
                
                {/* Core pulsing element */}
                <motion.div 
                  className="absolute rounded-full bg-primary/10"
                  style={{ 
                    width: '40%', 
                    height: '40%',
                    top: '30%',
                    left: '30%'
                  }}
                  animate={{ 
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 2 + i,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Glowing orbs background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full blur-xl ${
                  i % 3 === 0 
                    ? 'bg-gradient-to-r from-primary/30 to-blue-500/10' 
                    : i % 3 === 1 
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/10' 
                      : 'bg-gradient-to-r from-purple-500/30 to-primary/10'
                }`}
                style={{
                  width: 150 + Math.random() * 200,
                  height: 150 + Math.random() * 200,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.1 + Math.random() * 0.2
                }}
                animate={{
                  x: [0, 50, 0, -50, 0],
                  y: [0, 30, 0, -30, 0],
                  scale: [1, 1.2, 1, 0.8, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Advanced 3D Grid Effect */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-30">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(58, 255, 236, 0.3)" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(58, 255, 236, 0.1)" />
                  <stop offset="50%" stopColor="rgba(58, 255, 236, 0.3)" />
                  <stop offset="100%" stopColor="rgba(58, 255, 236, 0.1)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              <rect width="100%" height="100%" fill="url(#grid-gradient)" style={{ mixBlendMode: 'overlay' }} />
            </svg>
          </div>

          {/* Digital holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-blue-900/10"></div>
          
          {/* NEW: Digital glitch effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Horizontal glitch lines */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[1px] w-screen bg-primary/70"
                style={{ 
                  top: `${10 + (i * 10)}%`,
                  left: 0,
                  opacity: 0
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  x: ['-100%', '100%'],
                  scaleY: [1, i % 2 === 0 ? 3 : 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 5 + (i * 4),
                  ease: "easeInOut",
                  delay: i * 2
                }}
              />
            ))}
            
            {/* Digital noise blocks */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/10"
                style={{ 
                  width: 40 + (i * 20),
                  height: 10 + (i * 5),
                  opacity: 0
                }}
                initial={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 0.3, 0],
                  x: [0, Math.random() > 0.5 ? 50 : -50],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  repeatDelay: 7 + (i * 3),
                  ease: "steps(3)",
                  delay: i * 1.5
                }}
              />
            ))}
            
            {/* Scanner line effect */}
            <motion.div
              className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent"
              initial={{ top: '0%', opacity: 0 }}
              animate={{ 
                top: ['0%', '100%'],
                opacity: [0, 0.7, 0.7, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatDelay: 15,
                ease: "linear",
                times: [0, 0.05, 0.95, 1]
              }}
            />
          </div>
        </div>
        
        {/* Futuristic overlay elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/70"></div>
          
          {/* Digital grid */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-20">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(58, 255, 236, 0.3)" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(58, 255, 236, 0.5)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Glowing lines */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              animate={{ 
                x: ['-100%', '100%'],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <motion.div
              className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
              animate={{ 
                x: ['100%', '-100%'],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          {/* Floating crypto symbols */}
          <div className="absolute inset-0 overflow-hidden">
            {['₿', 'Ξ', '₮', 'Ł', '₳', 'Ð'].map((symbol, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl font-bold text-primary/20"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + ((i % 3) * 30)}%`,
                }}
                animate={{
                  y: [0, -20, 0, 20, 0],
                  opacity: [0.1, 0.3, 0.1],
                  rotateZ: [0, 10, 0, -10, 0]
                }}
                transition={{
                  duration: 10 + (i * 2),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/80"
                style={{ 
                  width: 1 + (i % 4),
                  height: 1 + (i % 4),
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: '0 0 4px rgba(58, 255, 236, 0.8)'
                }}
                animate={{ 
                  y: [0, -100],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3 + (Math.random() * 5),
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>
        
        <motion.div 
          className="container mx-auto px-4 py-20 md:py-32 relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            className="mb-8 flex justify-center"
            initial="initial"
            animate="animate"
            variants={logoFloatAnimation}
          >
            <div className="relative h-24 w-24 mb-4">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-primary opacity-75 blur-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="relative h-full w-full rounded-full bg-card flex items-center justify-center border-2 border-primary/50"
              >
                <span className="text-primary text-2xl font-bold">CSS</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            variants={fadeIn}
          >
            <span className="relative inline-block">
              {/* Background glow effect */}
              <span className="absolute -inset-1 blur-xl bg-gradient-to-r from-primary/30 via-blue-500/20 to-purple-500/30 opacity-70 rounded-lg"></span>
              
              {/* Text overlay with 3D lighting effect */}
              <span className="relative inline-block px-6 py-2 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 border border-primary/20 shadow-lg">
                Crypto Spread Seeker Pro
              </span>
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-12 text-muted-foreground"
            variants={fadeIn}
          >
            Discover and capitalize on arbitrage opportunities across 15+ crypto exchanges with our powerful, secure AI-driven platform
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={fadeIn}
          >
            <Button size="lg" asChild className="font-medium">
              <CustomLink to="/dashboard">
                <Sparkles className="mr-2 h-5 w-5" /> Start Trading
              </CustomLink>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <CustomLink to="/features">
                <Info className="mr-2 h-5 w-5" /> Learn More
              </CustomLink>
            </Button>
          </motion.div>

          {/* ... rest of the hero section ... */}
        </motion.div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 text-center pb-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="text-primary/60">Scroll to explore</div>
          <div className="w-6 h-10 border-2 border-primary/40 rounded-full mx-auto mt-2 relative">
            <motion.div 
              className="w-1.5 h-1.5 bg-primary rounded-full absolute left-1/2 top-1.5 -translate-x-1/2"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <AnimatedSection className="py-20 bg-muted/20" animation="reveal">
        {/* ... existing features section ... */}
      </AnimatedSection>
      
      {/* Maximize Profits Section */}
      <AnimatedSection className="py-20 bg-gradient-to-b from-background to-muted/20" animation="fadeIn">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn} className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Maximize Your Profits</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our intelligent algorithm continuously scans all major exchanges to identify the most profitable arbitrage opportunities in real-time.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Identify price discrepancies across 15+ exchanges</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Execute trades with minimal risk and maximum return</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Smart fee calculation ensures profitable transactions</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Automated execution for time-sensitive opportunities</span>
                </li>
              </ul>
              <Button size="lg" asChild>
                <CustomLink to="/arbitrage/strategies">
                  Explore Strategies <ArrowRight className="ml-2 h-4 w-4" />
                </CustomLink>
              </Button>
            </motion.div>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                }
              }}
              className="order-1 md:order-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-xl blur-lg"></div>
                <img 
                  src="/images/maximize-profits.svg" 
                  alt="Maximize crypto arbitrage profits" 
                  className="relative z-10 w-full rounded-lg shadow-xl border border-primary/10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Stats Section */}
      <AnimatedSection className="py-20 bg-gradient-to-b from-background to-muted/20" animation="popUp">
        {/* ... existing stats section ... */}
      </AnimatedSection>
      
      {/* Exchanges Section */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-primary/5 to-background/20 relative overflow-hidden" animation="fadeIn">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Exchanges</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect seamlessly with leading cryptocurrency exchanges to maximize your arbitrage opportunities
            </p>
          </motion.div>
          
          {isLoadingExchanges ? (
            <div className="flex justify-center py-12">
              <FuturisticLoadingAnimation text="Loading Exchanges" size="lg" />
            </div>
          ) : (
            <>
              {/* First row - left to right */}
              <InfiniteMarquee direction="left" speed={30} pauseOnHover={true}>
                {exchangeLogos.map((exchange, index) => (
                  <motion.div 
                    key={`left-${index}`} 
                    className="bg-card/60 border border-border/40 p-4 rounded-lg flex items-center justify-center h-24 min-w-[180px] backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                      borderColor: "rgba(58, 145, 136, 0.5)"
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 mb-2 flex items-center justify-center bg-white/10 p-1 rounded-md overflow-hidden">
                        <img 
                          src={exchange.logo} 
                          alt={`${exchange.name} logo`} 
                          className="max-h-10 max-w-10 object-contain"
                          onError={(e) => {
                            // Fallback to exchange initial in a styled circle
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallbackEl = parent.querySelector('.logo-fallback') as HTMLElement;
                              if (fallbackEl) {
                                fallbackEl.style.display = 'flex';
                                // Set the initial letter
                                const initialEl = fallbackEl.querySelector('.logo-initial') as HTMLElement;
                                if (initialEl) {
                                  initialEl.innerText = exchange.name.charAt(0);
                                }
                              }
                            }
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-primary/40 hidden items-center justify-center logo-fallback">
                          <span className="text-white font-bold text-lg logo-initial"></span>
                        </div>
                      </div>
                      <span className="font-semibold text-center">{exchange.name}</span>
                    </div>
                  </motion.div>
                ))}
              </InfiniteMarquee>
              
              {/* Second row - right to left, slightly slower */}
              <InfiniteMarquee direction="right" speed={40} pauseOnHover={false}>
                {[...exchangeLogos].reverse().map((exchange, index) => (
                  <motion.div 
                    key={`right-${index}`} 
                    className="bg-card/60 border border-border/40 p-4 rounded-lg flex items-center justify-center h-24 min-w-[180px] backdrop-blur-sm"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                      borderColor: "rgba(58, 145, 136, 0.5)"
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 mb-2 flex items-center justify-center bg-white/10 p-1 rounded-md overflow-hidden">
                        <img 
                          src={exchange.logo} 
                          alt={`${exchange.name} logo`} 
                          className="max-h-10 max-w-10 object-contain"
                          onError={(e) => {
                            // Fallback to exchange initial in a styled circle
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallbackEl = parent.querySelector('.logo-fallback') as HTMLElement;
                              if (fallbackEl) {
                                fallbackEl.style.display = 'flex';
                                // Set the initial letter
                                const initialEl = fallbackEl.querySelector('.logo-initial') as HTMLElement;
                                if (initialEl) {
                                  initialEl.innerText = exchange.name.charAt(0);
                                }
                              }
                            }
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-primary/40 hidden items-center justify-center logo-fallback">
                          <span className="text-white font-bold text-lg logo-initial"></span>
                        </div>
                      </div>
                      <span className="font-semibold text-center">{exchange.name}</span>
                    </div>
                  </motion.div>
                ))}
              </InfiniteMarquee>
            </>
          )}
        </div>
      </AnimatedSection>
      
      {/* ... rest of the landing page ... */}
    </>
  );
}
