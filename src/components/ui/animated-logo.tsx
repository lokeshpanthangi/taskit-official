import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function AnimatedLogo({ 
  size = 'md', 
  showText = true,
  className 
}: AnimatedLogoProps) {
  const { isAuthenticated } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Trigger animation once after login
  useEffect(() => {
    if (isAuthenticated && !hasAnimated) {
      setIsAnimating(true);
      setHasAnimated(true);
    }
  }, [isAuthenticated, hasAnimated]);
  
  // Keep animation continuous after login
  useEffect(() => {
    if (!isAuthenticated) {
      setIsAnimating(false);
      setHasAnimated(false);
      return;
    }
    
    // If already authenticated and has animated, keep animation continuous
    if (isAuthenticated && hasAnimated) {
      setIsAnimating(true);
    }
  }, [isAuthenticated, hasAnimated]);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const containerVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300
      }
    }
  };
  
  const checkmarkVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeInOut",
        delay: 0.2
      } 
    }
  };
  
  const circleVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    }
  };
  
  const textVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: 0.6 
      } 
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(
          'relative rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-lg',
          sizeClasses[size]
        )}
        variants={containerVariants}
        animate={isAnimating ? 'hover' : 'initial'}
        onClick={() => setIsAnimating(true)}
      >
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)] opacity-0"
          animate={{ 
            opacity: isAnimating ? 0.8 : 0,
            scale: isAnimating ? 1.2 : 1
          }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.svg
          viewBox="0 0 24 24"
          className="w-2/3 h-2/3 text-primary-foreground"
          initial="initial"
          animate={isAnimating ? 'animate' : 'initial'}
        >
          {/* Circle background */}
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            variants={circleVariants}
          />
          
          {/* Checkmark */}
          <motion.path
            d="M8 12l3 3 5-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={checkmarkVariants}
          />
        </motion.svg>
      </motion.div>
      
      {showText && (
        <motion.span 
          className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : size === 'lg' ? '1.5rem' : '1.75rem' }}
          initial="initial"
          animate={isAnimating ? 'animate' : 'initial'}
          variants={textVariants}
        >
          TaskPal
        </motion.span>
      )}
    </div>
  );
}
