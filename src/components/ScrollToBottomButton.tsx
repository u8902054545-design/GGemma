import React from 'react';
import { motion } from 'motion/react';
import { scrollToBottomInstant } from '../Functions/scrollUtils';

interface ScrollToBottomButtonProps {
  show: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ show, messagesEndRef }) => {
  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => scrollToBottomInstant(messagesEndRef)}
      className="absolute bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] shadow-2xl hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
    >
      <span className="material-symbols-outlined">arrow_downward</span>
    </motion.button>
  );
};
