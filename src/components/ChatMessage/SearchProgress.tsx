import React from 'react';
import { motion } from 'motion/react';
import { 
  searchNotificationVariants, 
  typewriterContainerVariants, 
  typewriterLetterVariants 
} from '../../motion/searchNotificationTransitions';

interface SearchProgressProps {
  statusText: string;
}

export const SearchProgress: React.FC<SearchProgressProps> = ({ statusText }) => {
  const letters = Array.from(statusText);

  return (
    <motion.div
      variants={searchNotificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-2 py-1 text-[var(--md-sys-color-on-surface-variant)] text-xs md:text-sm italic font-medium w-fit mb-2"
    >
      <div className="relative w-3.5 h-3.5 flex-shrink-0">
        <svg
          className="w-full h-full"
          style={{ animation: 'google-spinner-rotate 2s linear infinite' }}
          viewBox="0 0 50 50"
        >
          <circle
            className="google-spinner-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="6"
          />
        </svg>
      </div>
      
      <motion.span 
        variants={typewriterContainerVariants}
        className="inline-flex opacity-85"
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={typewriterLetterVariants}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
};
