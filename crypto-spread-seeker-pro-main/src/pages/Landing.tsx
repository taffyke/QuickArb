import React from 'react';
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, useAnimation } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, type ButtonProps } from "../components/ui/button";
import { FuturisticLoadingAnimation } from "../components/ui/loading-animation";
import { Card, CardContent } from "../components/ui/card";
import { useSupabase } from "../contexts/supabase-context";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  LineChart,
  Lock,
  Shield,
  Shuffle,
  TrendingUp,
  Wallet,
  Zap,
  Info,
  Sparkles,
  LogIn
} from "lucide-react";

// ScrollToTop component to fix navigation issues
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.6 
    } 
  }
};

// MetaMask-inspired animation variants
const floatingAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [0, -10, 0], 
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

const glowingAnimation = {
  initial: { opacity: 0.5, scale: 0.95 },
  animate: { 
    opacity: [0.5, 1, 0.5], 
    scale: [0.95, 1, 0.95],
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

const pulseAnimation = {
  initial: { boxShadow: "0 0 0 0 rgba(58, 145, 136, 0)" },
  animate: { 
    boxShadow: ["0 0 0 0 rgba(58, 145, 136, 0)", "0 0 0 10px rgba(58, 145, 136, 0.3)", "0 0 0 20px rgba(58, 145, 136, 0)"], 
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeOut" 
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.5 
    } 
  }
};

const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.6 
    } 
  }
};

const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.6 
    } 
  }
};

// Enhanced animation variants for wysemeter-like scrolling
const popUp = {
  hidden: { scale: 0.8, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 60,
      delay: 0.1
    }
  }
};

const reveal = {
  hidden: { opacity: 0, y: 75 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, ease: "easeInOut" },
      opacity: { duration: 0.2 }
    }
  }
};

// The exchange logos for the scrolling marquee with reliable CDN URLs
const exchangeLogos = [
  { name: "Binance", logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
  { name: "Bybit", logo: "https://cryptologos.cc/logos/bybit-logo.png" },
  { name: "KuCoin", logo: "https://cryptologos.cc/logos/kucoin-token-kcs-logo.png" },
  { name: "OKX", logo: "https://cryptologos.cc/logos/okb-okb-logo.png" },
  { name: "Gate.io", logo: "https://cryptologos.cc/logos/gate-logo.png" },
  { name: "Coinbase", logo: "https://cryptologos.cc/logos/coinbase-logo.png" },
  { name: "Kraken", logo: "https://cryptologos.cc/logos/kraken-logo.png" },
  { name: "Bitfinex", logo: "https://cryptologos.cc/logos/bitfinex-logo.png" },
  { name: "Gemini", logo: "https://cryptologos.cc/logos/gemini-dollar-gusd-logo.png" },
  { name: "Bitget", logo: "https://cryptologos.cc/logos/bitget-logo.png" },
  { name: "Bitmart", logo: "https://cryptologos.cc/logos/bitmart-token-bmx-logo.png" },
  { name: "Poloniex", logo: "https://cryptologos.cc/logos/poloniex-logo.png" },
  { name: "MEXC", logo: "https://cryptologos.cc/logos/mexc-token-mxc-logo.png" },
  { name: "HTX", logo: "https://cryptologos.cc/logos/huobi-token-ht-logo.png" },
  { name: "Bitrue", logo: "https://cryptologos.cc/logos/bitrue-coin-btr-logo.png" },
  { name: "AscendEX", logo: "https://cryptologos.cc/logos/ascendex-logo.png" },
];

// Enhanced Animated scrolling marquee component
const InfiniteMarquee = ({ children, direction = "left", speed = 20, pauseOnHover = true }) => {
  const marqueeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative overflow-hidden w-full py-6 bg-card/30 border-y border-border/40 backdrop-blur-sm"
      ref={marqueeRef}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <motion.div 
        className={`flex gap-8`}
        animate={{
          x: direction === "left" 
            ? [0, -1920] 
            : [-1920, 0]
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: exchangeLogos.length * (speed / 10),
          ease: "linear",
          ...(!isHovered || !pauseOnHover ? {} : { duration: 100000 })
        }}
      >
        {children}
        {children} {/* Duplicate to ensure continuous flow */}
      </motion.div>
    </div>
  );
};

const CountUp = ({ target, duration = 2000 }: { target: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * target));
      
      if (progress < duration) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };
    
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isInView]);
  
  return <span ref={ref}>{count}</span>;
};

// Enhanced Section component with scroll-triggered animations
const AnimatedSection = ({ children, className = "", animation = "fadeIn" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  
  const getAnimationVariant = () => {
    switch(animation) {
      case "fadeIn": return fadeIn;
      case "popUp": return popUp;
      case "reveal": return reveal;
      case "scaleUp": return scaleUp;
      case "slideInLeft": return slideInLeft;
      case "slideInRight": return slideInRight;
      default: return fadeIn;
    }
  };
  
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getAnimationVariant()}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Enhanced animation variants for MetaMask-like scrolling effects
const logoFloatAnimation = {
  initial: { y: 0, rotateZ: 0 },
  animate: { 
    y: [0, -8, 0],
    rotateZ: [0, -2, 0, 2, 0],
    transition: { 
      duration: 5, 
      repeat: Infinity, 
      ease: "easeInOut", 
      times: [0, 0.25, 0.5, 0.75, 1] 
    } 
  }
};

const metamaskParallaxEffect = {
  initial: { y: 0 },
  animate: (scrollY) => ({
    y: scrollY * -0.2,
    transition: { type: "spring", stiffness: 50, damping: 30 }
  })
};

// Loading Animation Component
const LoadingAnimation = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border-4 border-transparent border-l-primary/70 border-r-primary/70"
          animate={{ rotate: -180 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-[35%] rounded-full bg-primary"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p 
        className="mt-4 text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
};

// Enhanced LoadingButton with animation
const EnhancedLoadingButton = ({ 
  children, 
  isLoading = false, 
  loadingText = "Scanning exchanges for opportunities...", 
  variant = "default", 
  size = "default", 
  ...props 
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
} & Omit<ButtonProps, "variant" | "size" | "children">) => {
  return (
    <Button 
      variant={variant} 
      size={size} 
      {...props} 
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <FuturisticLoadingAnimation 
            text={loadingText}
            size={size === "sm" ? "sm" : size === "lg" ? "md" : "sm"}
            className="py-1"
          />
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Exchange Logo component with proper fallback
const ExchangeLogo = ({ name, logo }: { name: string; logo: string }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Default fallback images as base64 to ensure they're always available
  const defaultLogoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYTkxODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xNiAxMmwtNi0zdjZsNi0zeiIvPjwvc3ZnPg==";
  
  return (
    <div className="h-12 w-12 mb-2 flex items-center justify-center bg-white/10 p-1 rounded-md overflow-hidden relative">
      {/* Fallback that shows when image fails to load */}
      {!imageLoaded || imageError ? (
        <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center absolute">
          <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
        </div>
      ) : null}
      
      <img 
        src={logo}
        alt={`${name} logo`} 
        className={`max-h-10 max-w-10 object-contain relative z-10 ${imageError ? 'hidden' : ''}`}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          setImageError(true);
          // Try with default logo when the primary URL fails
          if (e.currentTarget.src !== defaultLogoBase64) {
            e.currentTarget.src = defaultLogoBase64;
            setImageError(false);
          }
        }}
      />
    </div>
  );
};

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const springConfig = { stiffness: 100, damping: 20, restDelta: 0.001 };
  const scaleSpring = useSpring(1, springConfig);
  const navigate = useNavigate();
  const { signInWithGoogle } = useSupabase();
  
  // MetaMask-inspired hover effect for buttons
  const [buttonHovered, setButtonHovered] = useState(false);
  
  // Scroll position for parallax effects
  const [scrollY, setScrollY] = useState(0);
  
  // Mouse position for interactive animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Preload exchange logos
  useEffect(() => {
    // Preload all exchange logos to ensure they're in the browser cache
    exchangeLogos.forEach(exchange => {
      const img = new Image();
      img.src = exchange.logo;
    });
  }, []);
  
  // Handle login
  const handleLogin = () => {
    navigate('/login');
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Track mouse movement for interactive animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Modified Link component with scroll-to-top behavior that always redirects to login first
  const CustomLink = ({ to, children, className = "" }) => {
    return (
      <Link 
        to="/login"
        className={className}
        onClick={() => {
          // Scroll to top immediately when link is clicked
          window.scrollTo(0, 0);
          // Store the intended destination in localStorage
          if (to !== "/login") {
            localStorage.setItem('intendedDestination', to);
          }
        }}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <ScrollToTop />
      
      {/* Background Gradient Orbs - MetaMask Inspired */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/10 to-primary/30 blur-[100px]"
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          custom={0}
        />
        <motion.div 
          className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-gradient-to-r from-blue-500/10 to-blue-500/30 blur-[80px]"
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          custom={1}
        />
        <motion.div 
          className="absolute top-[40%] right-[20%] w-[180px] h-[180px] rounded-full bg-gradient-to-r from-purple-500/10 to-purple-500/30 blur-[70px]"
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          custom={2}
        />
      </div>
      
      {/* Hero Section with MetaMask-inspired animations */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0" style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}>
          {/* Theme-adaptive gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br dark:from-blue-900/40 dark:via-gray-900/70 dark:to-purple-900/40 light:from-blue-200/30 light:via-gray-100/60 light:to-purple-200/30"></div>
          
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
          
          {/* Futuristic Digital Network Animation - Theme Adaptive */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Network Nodes */}
            {[...Array(15)].map((_, i) => {
              const size = 8 + Math.random() * 12;
              return (
                <motion.div
                  key={`node-${i}`}
                  className="absolute rounded-full backdrop-blur-sm border border-primary/30 dark:bg-primary/10 light:bg-primary/5 dark:shadow-primary/20 light:shadow-primary/10"
                  style={{
                    width: size,
                    height: size,
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                    boxShadow: "0 0 15px var(--primary)",
                  }}
                  initial={{ opacity: 0.2 + Math.random() * 0.3 }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                />
              );
            })}
            
            {/* Digital Circuit Lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="circuitGradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(58, 255, 236, 0.1)" />
                  <stop offset="50%" stopColor="rgba(58, 255, 236, 0.3)" />
                  <stop offset="100%" stopColor="rgba(58, 255, 236, 0.1)" />
                </linearGradient>
                <linearGradient id="circuitGradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(58, 145, 136, 0.05)" />
                  <stop offset="50%" stopColor="rgba(58, 145, 136, 0.2)" />
                  <stop offset="100%" stopColor="rgba(58, 145, 136, 0.05)" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Circuit Lines */}
              {[...Array(6)].map((_, i) => {
                const yPos = 15 + i * 15;
                return (
                  <g key={`circuit-h-${i}`}>
                    <motion.path
                      d={`M -100 ${yPos} 
                          L ${20 + Math.random() * 20}% ${yPos} 
                          Q ${30 + Math.random() * 10}% ${yPos + (Math.random() > 0.5 ? 10 : -10)} ${50 + Math.random() * 20}% ${yPos}
                          L 110% ${yPos}`}
                      stroke="url(#circuitGradient-dark)"
                      className="dark:block hidden"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="3,3"
                      initial={{ strokeOpacity: 0.1 }}
                      animate={{ 
                        strokeOpacity: [0.1, 0.4, 0.1],
                        pathOffset: [0, 1],
                      }}
                      transition={{ 
                        duration: 8 + Math.random() * 12,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                      }}
                    />
                    <motion.path
                      d={`M -100 ${yPos} 
                          L ${20 + Math.random() * 20}% ${yPos} 
                          Q ${30 + Math.random() * 10}% ${yPos + (Math.random() > 0.5 ? 10 : -10)} ${50 + Math.random() * 20}% ${yPos}
                          L 110% ${yPos}`}
                      stroke="url(#circuitGradient-light)"
                      className="light:block hidden"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="3,3"
                      initial={{ strokeOpacity: 0.1 }}
                      animate={{ 
                        strokeOpacity: [0.05, 0.2, 0.05],
                        pathOffset: [0, 1],
                      }}
                      transition={{ 
                        duration: 8 + Math.random() * 12,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                      }}
                    />
                  </g>
                );
              })}
              
              {/* Vertical Circuit Lines - dark theme */}
              {[...Array(6)].map((_, i) => {
                const xPos = 15 + i * 15;
                return (
                  <g key={`circuit-v-${i}`}>
                    <motion.path
                      d={`M ${xPos} -50
                          L ${xPos} ${20 + Math.random() * 20}%
                          Q ${xPos + (Math.random() > 0.5 ? 10 : -10)} ${30 + Math.random() * 10}% ${xPos} ${50 + Math.random() * 20}%
                          L ${xPos} 110%`}
                      stroke="url(#circuitGradient-dark)"
                      className="dark:block hidden"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="3,3"
                      initial={{ strokeOpacity: 0.1 }}
                      animate={{ 
                        strokeOpacity: [0.1, 0.3, 0.1],
                        pathOffset: [0, 1],
                      }}
                      transition={{ 
                        duration: 10 + Math.random() * 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                      }}
                    />
                    <motion.path
                      d={`M ${xPos} -50
                          L ${xPos} ${20 + Math.random() * 20}%
                          Q ${xPos + (Math.random() > 0.5 ? 10 : -10)} ${30 + Math.random() * 10}% ${xPos} ${50 + Math.random() * 20}%
                          L ${xPos} 110%`}
                      stroke="url(#circuitGradient-light)"
                      className="light:block hidden"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="3,3"
                      initial={{ strokeOpacity: 0.05 }}
                      animate={{ 
                        strokeOpacity: [0.05, 0.15, 0.05],
                        pathOffset: [0, 1],
                      }}
                      transition={{ 
                        duration: 10 + Math.random() * 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                      }}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Data Pulses */}
            {[...Array(10)].map((_, i) => {
              const isVertical = Math.random() > 0.5;
              const position = Math.random() * 80 + 10;
              const startDelay = Math.random() * 5;
              
              return (
                <motion.div
                  key={`pulse-${i}`}
                  className="absolute rounded-full dark:bg-primary/80 light:bg-primary/40"
                  style={{
                    width: isVertical ? 4 : 20,
                    height: isVertical ? 20 : 4,
                    left: isVertical ? `${position}%` : 0,
                    top: isVertical ? 0 : `${position}%`,
                    filter: "blur(1px)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    x: isVertical ? 0 : ['0%', '100%'],
                    y: isVertical ? ['0%', '100%'] : 0,
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: startDelay,
                    repeatDelay: Math.random() * 5 + 3
                  }}
                />
              );
            })}
            
            {/* Floating Hexagonal Elements */}
            {[...Array(8)].map((_, i) => {
              const size = 40 + Math.random() * 60;
              return (
                <motion.div
                  key={`hex-${i}`}
                  className="absolute dark:opacity-20 light:opacity-5"
                  style={{
                    width: size,
                    height: size,
                    left: `${Math.random() * 80}%`,
                    top: `${Math.random() * 80}%`,
                  }}
                  initial={{ opacity: 0.05, rotateZ: Math.random() * 90 }}
                  animate={{
                    y: [0, -20, 0, 20, 0],
                    x: [0, 15, 0, -15, 0],
                    rotateZ: [
                      Math.random() * 90, 
                      Math.random() * 90 + 180
                    ],
                  }}
                  transition={{
                    duration: 20 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="dark:opacity-100 light:opacity-60">
                    <polygon 
                      points="50,3 100,28 100,72 50,97 0,72 0,28" 
                      fill="none" 
                      strokeWidth="2"
                      className="dark:stroke-primary/70 light:stroke-primary/40" 
                    />
                    <polygon 
                      points="50,15 85,35 85,65 50,85 15,65 15,35" 
                      fill="none" 
                      strokeWidth="1"
                      className="dark:stroke-primary/40 light:stroke-primary/20" 
                    />
                  </svg>
                </motion.div>
              );
            })}
          </div>
          
          {/* Glowing orbs background */}
          <div className="absolute inset-0">
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
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-30 dark:opacity-30 light:opacity-15">
              <defs>
                <pattern id="grid-pattern-dark" width="40" height="40" patternUnits="userSpaceOnUse" className="dark:block hidden">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(58, 255, 236, 0.3)" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid-pattern-light" width="40" height="40" patternUnits="userSpaceOnUse" className="light:block hidden">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(58, 145, 136, 0.2)" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="grid-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%" className="dark:block hidden">
                  <stop offset="0%" stopColor="rgba(58, 255, 236, 0.1)" />
                  <stop offset="50%" stopColor="rgba(58, 255, 236, 0.3)" />
                  <stop offset="100%" stopColor="rgba(58, 255, 236, 0.1)" />
                </linearGradient>
                <linearGradient id="grid-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%" className="light:block hidden">
                  <stop offset="0%" stopColor="rgba(58, 145, 136, 0.05)" />
                  <stop offset="50%" stopColor="rgba(58, 145, 136, 0.2)" />
                  <stop offset="100%" stopColor="rgba(58, 145, 136, 0.05)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-dark)" className="dark:block hidden" />
              <rect width="100%" height="100%" fill="url(#grid-pattern-light)" className="light:block hidden" />
              <rect width="100%" height="100%" fill="url(#grid-gradient-dark)" style={{ mixBlendMode: 'overlay' }} className="dark:block hidden" />
              <rect width="100%" height="100%" fill="url(#grid-gradient-light)" style={{ mixBlendMode: 'overlay' }} className="light:block hidden" />
            </svg>
          </div>

          {/* Digital holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-blue-900/10"></div>
        </div>
        
        {/* Futuristic overlay elements */}
        <div className="absolute inset-0 z-1">
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
            QuickArb
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-center max-w-3xl mx-auto mb-10 text-muted-foreground"
            variants={fadeIn}
          >
            Discover, analyze, and capitalize on price differences across crypto exchanges. 
            Your all-in-one arbitrage solution.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeIn}
          >
            <motion.div
              initial="initial"
              whileHover="animate"
              onHoverStart={() => setButtonHovered(true)}
              onHoverEnd={() => setButtonHovered(false)}
            >
              <Button 
                size="lg" 
                asChild 
                className="font-medium relative overflow-hidden group"
              >
                <CustomLink to="/dashboard">
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: buttonHovered ? 0.2 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  <motion.span 
                    className="absolute inset-0 rounded-md pointer-events-none"
                    variants={pulseAnimation}
                  />
                </CustomLink>
              </Button>
            </motion.div>
            
            <Button size="lg" variant="outline" asChild className="backdrop-blur-sm">
              <CustomLink to="/arbitrage/direct">
                Explore Arbitrage
              </CustomLink>
            </Button>
          </motion.div>
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
      
      {/* Image Section with Info - Inspired by Wysemeter */}
      <AnimatedSection className="py-24 relative overflow-hidden" animation="popUp">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Maximize Your <span className="text-primary">Profits</span> With Data-Driven Arbitrage
              </h2>
              <p className="text-lg mb-8 text-muted-foreground">
                Our advanced algorithms continuously monitor price discrepancies across multiple exchanges, 
                identifying profitable arbitrage opportunities in real-time. With QuickArb, 
                you'll never miss a trading opportunity again.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time market data across 25+ exchanges",
                  "AI-powered opportunity detection",
                  "Automated trading with custom risk parameters",
                  "Comprehensive performance analytics"
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-1 rounded-full bg-primary/20 mt-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="relative"
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
            >
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 opacity-70 blur-xl"></div>
              <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-border/40">
                <img 
                  src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Crypto Trading Dashboard"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x600/1f1f23/3a9188?text=Arbitrage+Platform';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className="text-lg font-bold text-primary">+23.4%</div>
                      </div>
                      <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Trades</div>
                        <div className="text-lg font-bold">1,240</div>
                      </div>
                      <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Avg. Spread</div>
                        <div className="text-lg font-bold">1.8%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Features Section */}
      <AnimatedSection className="py-20 bg-muted/20" animation="reveal">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All-in-one toolkit for identifying and capitalizing on crypto market inefficiencies
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                title: "Direct Arbitrage",
                description: "Instantly identify and act on price differences between exchanges",
                icon: <Shuffle className="h-10 w-10 text-primary" />,
                link: "/arbitrage/direct"
              },
              {
                title: "Triangular Arbitrage",
                description: "Capitalize on price discrepancies between three different assets",
                icon: <LineChart className="h-10 w-10 text-primary" />,
                link: "/arbitrage/triangular"
              },
              {
                title: "Futures Arbitrage",
                description: "Exploit price differences between spot and futures markets",
                icon: <TrendingUp className="h-10 w-10 text-primary" />,
                link: "/arbitrage/futures"
              },
              {
                title: "Stablecoin Arbitrage",
                description: "Leverage price variations between different stablecoins",
                icon: <CreditCard className="h-10 w-10 text-primary" />,
                link: "/arbitrage/stablecoin"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleUp}>
                <Card className="h-full hover:shadow-lg transition-all border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <CustomLink 
                      to={feature.link}
                      className="inline-flex items-center text-primary hover:text-primary/80"
                    >
                      Learn more <ChevronRight className="ml-1 h-4 w-4" />
                    </CustomLink>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Stats Section */}
      <AnimatedSection className="py-20 bg-gradient-to-b from-background to-muted/20" animation="popUp">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trading Stats</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform helps traders identify and capitalize on market inefficiencies 
              across multiple exchanges
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                value: 15,
                label: "Exchanges Supported",
                suffix: "+",
                description: "Connect to major exchanges worldwide"
              },
              {
                value: 30,
                label: "Average Profit Potential",
                suffix: "%",
                description: "Monthly ROI with strategic arbitrage"
              },
              {
                value: 2500,
                label: "Trading Pairs Monitored",
                suffix: "+",
                description: "Constantly scanning for opportunities"
              },
              {
                value: 15000,
                label: "Arbitrage Opportunities",
                suffix: "+",
                description: "Identified daily across markets"
              }
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-sm"
                variants={scaleUp}
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  <CountUp target={stat.value} />
                  {stat.suffix}
                </div>
                <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                <p className="text-muted-foreground">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Exchange Support Scrolling Marquee - Fixed with direct URLs */}
      <AnimatedSection className="py-12 bg-muted/10">
        <div className="container mx-auto px-4 mb-8">
          <motion.div
            className="text-center mb-8"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Exchanges</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with the world's leading cryptocurrency exchanges
            </p>
          </motion.div>
        </div>
        
        {/* First row - left to right */}
        <InfiniteMarquee direction="left" speed={30}>
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
                <ExchangeLogo name={exchange.name} logo={exchange.logo} />
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
                <ExchangeLogo name={exchange.name} logo={exchange.logo} />
                <span className="font-semibold text-center">{exchange.name}</span>
              </div>
            </motion.div>
          ))}
        </InfiniteMarquee>
      </AnimatedSection>
      
      {/* CTA Section */}
      <section className="relative mt-12 md:mt-24 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/70 via-muted to-background"></div>
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
                Ready to start trading smarter?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of traders who are already maximizing their profits with our platform
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8"
                  asChild
                >
                  <CustomLink to="/app">
                    Get Started
                  </CustomLink>
                </Button>
                <EnhancedLoadingButton
                  size="default"
                  className="w-full sm:w-auto text-base"
                  variant="outline"
                  isLoading={true}
                  loadingText="Scanning exchanges..."
                >
                  Live Scanner
                </EnhancedLoadingButton>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* Features Grid */}
      <AnimatedSection className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique advantages for crypto arbitrage traders
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                title: "Real-time Analysis",
                description: "Instant price comparison across multiple exchanges",
                icon: <Zap className="h-6 w-6 text-primary" />
              },
              {
                title: "Advanced Algorithms",
                description: "Proprietary algorithms to identify profitable opportunities",
                icon: <BarChart3 className="h-6 w-6 text-primary" />
              },
              {
                title: "Secure Trading",
                description: "End-to-end encryption for your API keys and transactions",
                icon: <Lock className="h-6 w-6 text-primary" />
              },
              {
                title: "Global Access",
                description: "Trade across international exchanges from one platform",
                icon: <Globe className="h-6 w-6 text-primary" />
              },
              {
                title: "Wallet Integration",
                description: "Seamlessly connect your existing crypto wallets",
                icon: <Wallet className="h-6 w-6 text-primary" />
              },
              {
                title: "Risk Management",
                description: "Built-in tools to assess and mitigate trading risks",
                icon: <Shield className="h-6 w-6 text-primary" />
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex gap-4 p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-sm"
                variants={scaleUp}
              >
                <div className="mt-1">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Testimonials */}
      <AnimatedSection className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Traders Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied traders using our platform
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                quote: "This platform has completely transformed my arbitrage trading strategy. The real-time alerts and intuitive interface make it easy to capitalize on opportunities instantly.",
                name: "Alex Thompson",
                title: "Professional Crypto Trader"
              },
              {
                quote: "I've tried several arbitrage tools, but QuickArb is in a league of its own. The multi-exchange integration and security features give me peace of mind.",
                name: "Sarah Chen",
                title: "Portfolio Manager"
              },
              {
                quote: "The ROI I've seen since using this platform has exceeded all my expectations. The triangular arbitrage feature alone has been a game-changer for my trading strategy.",
                name: "Michael Rodriguez",
                title: "Full-time Crypto Investor"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="p-6 rounded-lg bg-card/60 border border-border/40 backdrop-blur-sm"
                variants={scaleUp}
              >
                <div className="mb-4 text-primary">"</div>
                <p className="italic mb-6 text-muted-foreground">{testimonial.quote}</p>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Final CTA */}
      <AnimatedSection className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Begin Your Arbitrage Journey Today</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take advantage of market inefficiencies and maximize your trading profits with
              our comprehensive arbitrage platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="font-medium">
                <CustomLink to="/dashboard">
                  Start Trading Now <ArrowRight className="ml-2 h-4 w-4" />
                </CustomLink>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleLogin}
                className="flex items-center justify-center"
              >
                Login <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Landing; 