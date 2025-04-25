import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loadingVariant?: "default" | "crypto" | "arbitrage" | "futuristic" | "holographic";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    asChild = false, 
    isLoading = false, 
    loadingText = "Loading...", 
    loadingVariant = "futuristic",
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Loading animation dot variants - classic style
    const loadingDotVariants = {
      initial: { y: 0, opacity: 0.5 },
      animate: (i: number) => ({
        y: [0, -5, 0],
        opacity: [0.5, 1, 0.5],
        transition: {
          y: {
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut",
            delay: i * 0.1
          },
          opacity: {
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut",
            delay: i * 0.1
          }
        }
      })
    };
    
    // Crypto-themed loading animation variant - price chart movement
    const cryptoPulseVariants = {
      initial: { scale: 1, opacity: 0.8 },
      animate: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      }
    };
    
    // Arbitrage-themed loading animation - showing exchange price difference
    const arbitrageLineVariants = {
      initial: { pathLength: 0, pathOffset: 0 },
      animate: { 
        pathLength: 1,
        pathOffset: [0, 1],
        transition: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "linear" 
        }
      }
    };
    
    // Candle stick chart for crypto loading
    const candleStickVariants = {
      initial: { scaleY: 0 },
      animate: (i: number) => ({
        scaleY: [0, 1],
        transition: {
          duration: 0.4,
          delay: i * 0.1,
          repeat: Infinity,
          repeatType: "reverse" as const
        }
      })
    };
    
    // Exchange price difference animation
    const exchangePriceVariants = {
      initial: { y: 0 },
      animate: (i: number) => ({
        y: i % 2 === 0 ? [0, -8, 0] : [0, 8, 0],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2
        }
      })
    };
    
    // New futuristic animation variants - digital data flow
    const futuristicBarVariants = {
      initial: { scaleX: 0, opacity: 0 },
      animate: (i: number) => ({
        scaleX: [0, 1, 0],
        opacity: [0, 1, 0],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.07
        }
      })
    };
    
    // New holographic effect animation
    const holographicVariants = {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        filter: [
          'hue-rotate(0deg) brightness(1)',
          'hue-rotate(90deg) brightness(1.2)',
          'hue-rotate(180deg) brightness(1)',
          'hue-rotate(270deg) brightness(0.8)',
          'hue-rotate(360deg) brightness(1)'
        ],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }
      }
    };
    
    // Digital glitch effect
    const glitchVariants = {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 3, -2, 0],
        transition: {
          duration: 0.3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror" as const,
          times: [0, 0.2, 0.4, 0.6, 1]
        }
      }
    };
    
    const renderLoadingIndicator = () => {
      switch (loadingVariant) {
        case "futuristic":
          return (
            <div className="flex items-center justify-center">
              {loadingText && (
                <motion.span 
                  className="mr-3 font-mono text-sm tracking-wider font-semibold text-primary"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {loadingText}
                </motion.span>
              )}
              
              {/* Futuristic circular loading animation */}
              <div className="relative h-6 w-6 mx-2">
                {/* Glowing backdrop */}
                <motion.div 
                  className="absolute rounded-full bg-primary/10"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'blur(3px)',
                  }}
                  animate={{ 
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Center dot */}
                <motion.div 
                  className="absolute bg-primary z-10"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 5px var(--primary)'
                  }}
                  animate={{ 
                    scale: [0.8, 1.2, 0.8], 
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Outer ring with glow */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '1.5px solid transparent',
                    borderTopColor: 'var(--primary)',
                    borderRightColor: 'var(--primary)',
                    opacity: 0.3,
                    boxSizing: 'border-box'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                
                {/* Inner ring - spinning in opposite direction */}
                <motion.div 
                  className="absolute"
                  style={{
                    width: '70%',
                    height: '70%',
                    top: '15%',
                    left: '15%',
                    borderRadius: '50%',
                    border: '1px solid transparent',
                    borderLeftColor: 'var(--primary)',
                    borderBottomColor: 'var(--primary)',
                    opacity: 0.6,
                    boxSizing: 'border-box'
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
              </div>
            </div>
          );
          
        case "holographic":
          return (
            <div className="flex items-center justify-center">
              {loadingText && (
                <motion.span 
                  className="mr-3 font-bold"
                  variants={glitchVariants}
                  initial="initial"
                  animate="animate"
                >
                  {loadingText}
                </motion.span>
              )}
              
              <div className="relative h-6 w-16">
                {/* Holographic 3D cube */}
                <motion.div 
                  className="absolute inset-0"
                  variants={holographicVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      className="absolute w-6 h-6 border-2 border-primary/70 rotate-45"
                      animate={{ 
                        rotate: [45, 225, 45], 
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <motion.div 
                      className="absolute w-6 h-6 border-2 border-primary/90"
                      animate={{ 
                        rotate: [0, 180, 360, 180, 0],
                        scale: [1, 0.8, 1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <motion.div 
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ 
                        scale: [0.8, 1.5, 0.8],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
                
                {/* Scanning line effect */}
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0.7 }}
                >
                  <motion.div
                    className="h-[1px] w-full bg-primary/80"
                    animate={{ 
                      y: [0, 24, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </div>
          );
          
        case "crypto":
          return (
            <div className="flex items-center justify-center gap-1">
              {loadingText && <span>{loadingText}</span>}
              
              <div className="relative h-6 flex items-end ml-3 gap-[2px]">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-current rounded-t-sm"
                    style={{ 
                      height: '100%', 
                      transformOrigin: 'bottom',
                      opacity: 0.7 + ((i % 4) * 0.1)
                    }}
                    initial="initial"
                    animate="animate"
                    custom={i}
                    variants={candleStickVariants}
                  />
                ))}
              </div>
              
              <motion.div 
                className="absolute inset-0 bg-primary/5 backdrop-blur-sm"
                initial="initial"
                animate="animate"
                variants={cryptoPulseVariants}
              >
                <svg 
                  className="w-full h-full opacity-20" 
                  preserveAspectRatio="none" 
                  viewBox="0 0 100 30"
                >
                  <motion.path
                    d="M0,15 Q25,5 50,20 T100,10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: [0, 1],
                      pathOffset: [0, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "linear" 
                    }}
                  />
                </svg>
              </motion.div>
            </div>
          );
          
        case "arbitrage":
          return (
            <div className="flex items-center justify-center gap-1">
              {loadingText && <span className="mr-2">{loadingText}</span>}
              
              <div className="relative h-6 w-16 flex items-center justify-between">
                {/* Exchange price difference visualization */}
                {[0, 1, 2].map((i) => (
                  <div key={i} className="relative flex flex-col items-center">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold"
                      initial="initial"
                      animate="animate"
                      custom={i}
                      variants={exchangePriceVariants}
                    >
                      {String.fromCharCode(65 + i)} {/* A, B, C */}
                    </motion.div>
                    
                    {/* Price value */}
                    <motion.div 
                      className="text-[8px] mt-1 font-mono"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                    >
                      ${(1000 + (i * 10)).toFixed(2)}
                    </motion.div>
                  </div>
                ))}
                
                {/* Arbitrage connection lines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-70"
                  viewBox="0 0 60 24"
                  style={{ top: '-3px' }}
                >
                  <motion.path
                    d="M10,6 C20,14 40,0 50,6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                    fill="none"
                    variants={arbitrageLineVariants}
                    initial="initial"
                    animate="animate"
                  />
                </svg>
              </div>
            </div>
          );
          
        default:
          return (
            <div className="flex items-center justify-center gap-1">
              {loadingText && <span>{loadingText}</span>}
              <div className="flex gap-1 ml-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-current"
                    initial="initial"
                    animate="animate"
                    custom={i}
                    variants={loadingDotVariants}
                  />
                ))}
              </div>
            </div>
          );
      }
    };
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && "relative overflow-hidden",
          isLoading && "cursor-not-allowed",
          loadingVariant === "holographic" && isLoading && "backdrop-blur-sm",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? renderLoadingIndicator() : children}
      </Comp>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton }; 