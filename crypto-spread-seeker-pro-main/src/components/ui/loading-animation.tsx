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
      case 'sm': return { width: 80, height: 30, fontSize: 10, circleSize: 40 };
      case 'lg': return { width: 160, height: 60, fontSize: 16, circleSize: 60 };
      default: return { width: 120, height: 45, fontSize: 12, circleSize: 50 };
    }
  };
  
  const { width, height, fontSize, circleSize } = getDimensions();
  
  return (
    <div className={`flex flex-row items-center justify-center gap-4 ${className}`}>
      {text && (
        <motion.div 
          className="font-mono tracking-wider font-semibold text-primary"
          style={{ fontSize }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.div>
      )}
      
      <div className="flex justify-center items-center">
        {/* Futuristic circular loading animation using accent color variables */}
        <div
          className="relative"
          style={{ width: circleSize, height: circleSize }}
        >
          {/* Glowing backdrop for futuristic effect */}
          <motion.div 
            className="absolute rounded-full bg-primary/10"
            style={{
              width: '100%',
              height: '100%',
              top: '0%',
              left: '0%',
              filter: 'blur(5px)',
            }}
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        
          {/* Center dot */}
          <motion.div 
            className="absolute bg-primary"
            style={{
              width: circleSize / 6,
              height: circleSize / 6,
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px var(--primary)',
              zIndex: 10
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
          
          {/* Outer ring - with glowing effect */}
          <motion.div 
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `${circleSize / 30}px solid transparent`,
              borderTopColor: 'var(--primary)',
              borderRightColor: 'var(--primary)',
              opacity: 0.3,
              boxSizing: 'border-box'
            }}
            animate={{ 
              rotate: 360,
              boxShadow: [
                '0 0 5px rgba(var(--primary), 0.3)',
                '0 0 10px rgba(var(--primary), 0.5)',
                '0 0 5px rgba(var(--primary), 0.3)'
              ]
            }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Secondary outer ring - with tech pattern */}
          <motion.div 
            className="absolute inset-0"
            style={{
              width: '85%',
              height: '85%',
              top: '7.5%',
              left: '7.5%',
              borderRadius: '50%',
              border: `${circleSize / 40}px dashed var(--primary)`,
              opacity: 0.4,
              boxSizing: 'border-box'
            }}
            animate={{ rotate: -180 }}
            transition={{ 
              duration: 6, 
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
              border: `${circleSize / 40}px solid transparent`,
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
          
          {/* Innermost tech circle */}
          <motion.div 
            className="absolute bg-transparent"
            style={{
              width: '50%',
              height: '50%',
              top: '25%',
              left: '25%',
              borderRadius: '50%',
              border: `${circleSize / 60}px solid var(--primary)`,
              opacity: 0.2,
              boxSizing: 'border-box'
            }}
            animate={{ 
              rotate: 360,
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FuturisticLoadingAnimation; 