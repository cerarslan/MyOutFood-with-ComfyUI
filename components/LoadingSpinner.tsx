import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0">
          <div className="w-full h-full rounded-full border-2 border-primary/20 dark:border-primary/10" />
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        
        {/* Inner pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-4 h-4 bg-primary rounded-full" />
        </motion.div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/5 dark:bg-primary/10 blur-md animate-pulse" />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
