import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthBgProps {
  children: ReactNode;
}

// Currency symbols to display in the background
const currencySymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC'];

export function AuthBg({ children }: AuthBgProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-primary/5"></div>
        
        {/* Price chart lines - mimicking trading charts */}
        {[...Array(5)].map((_, i) => {
          // Generate random points for a price chart line
          const points = [...Array(6)].map((_, j) => {
            const x = (j * 20) + (i * 5);
            const y = 40 + Math.random() * 20;
            return `${x},${y}`;
          }).join(' ');

          return (
            <motion.div
              key={`chart-${i}`}
              className="absolute"
              style={{
                top: `${20 + i * 15}%`,
                left: '5%',
                width: '90%',
                height: '40px',
                opacity: 0.3 + (i * 0.05),
              }}
              animate={{
                x: [0, -10, 0, 10, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                <polyline
                  points={points}
                  fill="none"
                  stroke="rgba(58, 255, 236, 0.4)"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>
          );
        })}

        {/* Floating currency symbols */}
        {currencySymbols.map((symbol, i) => (
          <motion.div
            key={`currency-${i}`}
            className="absolute font-mono text-xs font-bold text-primary/40"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 80}%`,
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              x: [0, Math.random() * 50 - 25],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {symbol}
          </motion.div>
        ))}
        
        {/* Exchange connection lines - representing arbitrage paths */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`connection-${i}`}
            className="absolute"
            style={{
              top: `${10 + Math.random() * 70}%`,
              left: `${Math.random() * 30}%`,
              width: `${30 + Math.random() * 40}%`,
              height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(58, 255, 236, ${0.3 + Math.random() * 0.2}), transparent)`,
              transformOrigin: 'left center',
              rotate: `${Math.random() * 20 - 10}deg`,
            }}
            animate={{
              opacity: [0, 0.7, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Arbitrage opportunity circles - pulsing nodes representing different exchanges */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`exchange-${i}`}
            className="absolute w-3 h-3 rounded-full bg-primary/30"
            style={{
              left: `${10 + (i * 20)}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
              boxShadow: [
                '0 0 0 0 rgba(58, 255, 236, 0)',
                '0 0 0 10px rgba(58, 255, 236, 0.1)',
                '0 0 0 0 rgba(58, 255, 236, 0)',
              ],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Blockchain-inspired grid */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-10">
            <defs>
              <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(58, 255, 236, 0.3)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(58, 255, 236, 0.1)" />
                <stop offset="50%" stopColor="rgba(58, 255, 236, 0.2)" />
                <stop offset="100%" stopColor="rgba(58, 255, 236, 0.1)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <rect width="100%" height="100%" fill="url(#grid-gradient)" style={{ mixBlendMode: 'overlay' }} />
          </svg>
        </div>

        {/* Price spread visualization - representing arbitrage opportunities */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-1/2 h-px"
          animate={{
            background: [
              'linear-gradient(90deg, rgba(58, 255, 236, 0.2), rgba(58, 255, 236, 0.6), rgba(58, 255, 236, 0.2))',
              'linear-gradient(90deg, rgba(58, 255, 236, 0.3), rgba(0, 100, 255, 0.6), rgba(58, 255, 236, 0.3))',
              'linear-gradient(90deg, rgba(58, 255, 236, 0.2), rgba(58, 255, 236, 0.6), rgba(58, 255, 236, 0.2))',
            ],
            height: ['1px', '2px', '1px'],
            width: ['40%', '60%', '40%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated arrows representing trades between exchanges */}
        {[...Array(6)].map((_, i) => {
          const startX = 20 + Math.random() * 20;
          const startY = 20 + Math.random() * 60;
          const endX = 60 + Math.random() * 20;
          const endY = 20 + Math.random() * 60;
          
          return (
            <motion.div
              key={`arrow-${i}`}
              className="absolute"
              style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            >
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <marker id={`arrowhead-${i}`} markerWidth="4" markerHeight="4" 
                    refX="2" refY="2" orient="auto">
                    <polygon points="0 0, 4 2, 0 4" fill="rgba(58, 255, 236, 0.6)" />
                  </marker>
                </defs>
                <path 
                  d={`M ${startX}% ${startY}% Q ${(startX + endX) / 2}% ${(startY + endY) / 2 - 15}%, ${endX}% ${endY}%`}
                  stroke="rgba(58, 255, 236, 0.4)"
                  strokeWidth="1"
                  fill="none"
                  markerEnd={`url(#arrowhead-${i})`}
                  strokeDasharray="4,2"
                />
              </svg>
            </motion.div>
          );
        })}
      </div>

      {/* Content */}
      <div className="z-10 w-full max-w-md relative backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
} 