"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step {
  label: string;
  status: 'waiting' | 'current' | 'completed' | 'error';
}

interface ProgressStepsProps {
  steps: Step[];
}

const getStepColors = (status: Step['status']) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'transparent',
        border: 'hsl(var(--primary))',
        text: 'hsl(var(--primary))'
      };
    case 'current':
      return {
        bg: 'transparent',
        border: 'hsl(var(--primary))',
        text: 'hsl(var(--primary))'
      };
    case 'error':
      return {
        bg: 'transparent',
        border: 'hsl(var(--destructive))',
        text: 'hsl(var(--destructive))'
      };
    default:
      return {
        bg: 'transparent',
        border: 'hsl(var(--border))',
        text: 'hsl(var(--muted-foreground))'
      };
  }
};

const getStepDescription = (label: string, status: Step['status']) => {
  switch (label.toLowerCase()) {
    case 'upload':
      return 'Kıyafet fotoğrafınızı yükleyin';
    case 'analyze':
      return 'Yapay zeka kıyafetinizi analiz ediyor';
    case 'generate':
      return 'Size özel yemek önerileri oluşturuluyor';
    case 'find places':
      return 'Yakınınızdaki restoranlar bulunuyor';
    default:
      return `${label} ${status === 'completed' ? 'tamamlandı' : status === 'current' ? 'işleniyor' : 'bekleniyor'}`;
  }
};

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  return (
    <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto px-12">
      {/* Progress Line */}
      <div className="absolute left-[10%] right-[10%] top-[17px] h-[1px] bg-muted-foreground/30">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${
              (steps.filter((step) => step.status === 'completed').length /
                (steps.length - 1)) *
              100
            }%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between w-full relative">
        {steps.map((step, index) => {
          const colors = getStepColors(step.status);
          const description = getStepDescription(step.label, step.status);
          
          return (
            <TooltipProvider key={index} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                <div className="flex flex-col items-center group">
                    <motion.div
                      initial={{ 
                        scale: 1,
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      animate={{ 
                        scale: step.status === 'current' ? 1.1 : 1,
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      whileHover={{ 
                      scale: step.status === 'current' ? 1.3 : 1.1,
                        transition: { duration: 0.2 }
                      }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border
                        cursor-pointer transition-all duration-200 backdrop-blur-sm bg-white/80 dark:bg-black/80
                        hover:shadow-sm hover:shadow-primary/10
                        ${step.status === 'completed' ? 'hover:bg-primary/90' : 
                          step.status === 'current' ? 'hover:border-primary/70 shadow-sm shadow-primary/20' :
                          step.status === 'error' ? 'hover:border-destructive/70' :
                          'hover:border-primary/30'}`}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      {step.status === 'completed' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                    <motion.span
                      initial={{ color: colors.text }}
                      animate={{ color: colors.text }}
                      className="mt-2 text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-200"
                    >
                      {step.label}
                    </motion.span>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="bg-background/95 backdrop-blur-sm border"
                  side="bottom"
                >
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
