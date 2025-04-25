import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingAnimationProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FuturisticLoadingAnimation: React.FC<LoadingAnimationProps> = ({
  text = "Loading...",
  size = 'md',
  className = '',
}) => {
  // Calculate dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm': return { width: 80, height: 30, fontSize: 10 };
      case 'lg': return { width: 160, height: 60, fontSize: 16 };
      default: return { width: 120, height: 45, fontSize: 12 };
    }
  };
  
  const { width, height, fontSize } = getDimensions();
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {text && (
        <motion.div 
          className="mb-3 font-mono tracking-wider font-semibold text-primary"
          style={{ fontSize }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.div>
      )}
      
      <div 
        className="relative bg-gray-900/80 border border-primary/30 rounded-md overflow-hidden flex items-center justify-center"
        style={{ width, height }}
      >
        {/* Advanced multi-layered spinner */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer pulsing ring with gradient */}
          <motion.div 
            className="absolute rounded-full border-4 border-transparent"
            style={{ 
              width: width * 0.9, 
              height: height * 0.9,
              background: `conic-gradient(from 0deg, rgba(58, 255, 236, 0.9), rgba(100, 100, 255, 0.9), rgba(58, 255, 236, 0.1), rgba(58, 255, 236, 0.9))`
            }}
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 5px rgba(58, 255, 236, 0.4)',
                '0 0 15px rgba(58, 255, 236, 0.7)',
                '0 0 5px rgba(58, 255, 236, 0.4)'
              ]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Secondary outer ring with dash effect */}
          <motion.div 
            className="absolute rounded-full border-dashed border-4 border-primary/50"
            style={{ width: width * 0.82, height: height * 0.82 }}
            animate={{ 
              rotate: -360,
              borderColor: [
                'rgba(58, 255, 236, 0.5)',
                'rgba(100, 100, 255, 0.5)',
                'rgba(58, 255, 236, 0.5)'
              ]
            }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Middle segmented ring with particle effect */}
          <motion.div 
            className="absolute rounded-full"
            style={{ width: width * 0.7, height: height * 0.7 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                style={{ 
                  transform: `rotate(${i * 30}deg) translateX(${width * 0.35}px)`,
                  boxShadow: '0 0 8px rgba(58, 255, 236, 0.9)'
                }}
                animate={{ 
                  scale: [1, i % 3 === 0 ? 2 : 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15
                }}
              />
            ))}
          </motion.div>
          
          {/* Dynamic rotating elements - broken segments */}
          <motion.div 
            className="absolute rounded-full"
            style={{ width: width * 0.6, height: height * 0.6 }}
            animate={{ rotate: -180 }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ 
                  width: width * 0.6, 
                  height: height * 0.6,
                  transform: `rotate(${i * 45}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <motion.div
                  className="absolute h-1 rounded-full bg-gradient-to-r from-primary/90 to-primary/20"
                  style={{ 
                    width: width * 0.25,
                    top: '50%',
                    left: '50%',
                    marginLeft: -(width * 0.125),
                    marginTop: -2,
                  }}
                  animate={{ 
                    width: [(width * 0.25), (width * 0.3), (width * 0.25)],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Inner spinning element */}
          <motion.div 
            className="absolute"
            style={{ width: width * 0.45, height: height * 0.45 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <motion.div 
              className="absolute w-full h-full"
              style={{
                background: `conic-gradient(from 180deg, rgba(58, 255, 236, 0), rgba(58, 255, 236, 0.8), rgba(58, 255, 236, 0))`,
                borderRadius: '50%'
              }}
              animate={{ opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          {/* Core pulsing element */}
          <motion.div 
            className="absolute rounded-full bg-primary/20"
            style={{ width: width * 0.25, height: height * 0.25 }}
            animate={{ 
              boxShadow: [
                '0 0 5px rgba(58, 255, 236, 0.5)',
                '0 0 20px rgba(58, 255, 236, 0.8)',
                '0 0 5px rgba(58, 255, 236, 0.5)'
              ],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/70 to-blue-500/70"
              animate={{ 
                rotate: 360,
                scale: [0.7, 1, 0.7]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </motion.div>
        </div>
        
        {/* Holographic backdrop effect */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{ 
            background: [
              'radial-gradient(circle at 30% 50%, rgba(58, 255, 236, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
              'radial-gradient(circle at 70% 50%, rgba(58, 255, 236, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
              'radial-gradient(circle at 30% 50%, rgba(58, 255, 236, 0.4) 0%, rgba(0, 0, 0, 0) 70%)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Digital text effect */}
        <motion.div 
          className="absolute top-1 left-2 text-xs font-mono font-bold text-primary"
          animate={{ 
            opacity: [0.7, 1, 0.7],
            textShadow: [
              '0 0 2px rgba(58, 255, 236, 0.7)',
              '0 0 5px rgba(58, 255, 236, 0.9)',
              '0 0 2px rgba(58, 255, 236, 0.7)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: fontSize * 0.8 }}
        >
          SYNCING
        </motion.div>
      </div>
    </div>
  );
};

export default FuturisticLoadingAnimation; 