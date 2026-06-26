import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  searchNotificationVariants, 
  typewriterContainerVariants, 
  typewriterLetterVariants 
} from '../../motion/searchNotificationTransitions';

export const SearchProgress: React.FC = () => {
  const { t } = useLanguage();
  const text = t('message.search_progress');
  const letters = Array.from(text);

  return (
    <motion.div
      variants={searchNotificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-2 py-1 text-[var(--md-sys-color-on-surface-variant)] text-xs md:text-sm italic font-medium w-fit mb-2"
    >
      {/* Simple visual spinner */}
      <div className="w-3.5 h-3.5 border-2 border-[var(--md-sys-color-on-surface-variant)] border-t-transparent rounded-full animate-spin flex-shrink-0 opacity-70" />
      
      {/* Typewriter text */}
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
