import React from 'react';
import { motion } from 'motion/react';
import { GemmaIcon } from './IconsApp/GemmaIcon';
import { mdEasing, mdDuration } from '../motion/transitions';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: mdDuration.short4, ease: mdEasing.decelerate }}
      className="flex flex-col items-start mb-8"
    >
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg className="google-spinner" viewBox="0 0 50 50">
          <circle
            className="google-spinner-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3.5"
          />
        </svg>
        <div className="z-10 flex items-center justify-center">
          <GemmaIcon className="w-9 h-9" />
        </div>
      </div>
      <div className="h-6 w-full" />
    </motion.div>
  );
};
