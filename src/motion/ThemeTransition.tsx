import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';

export const ThemeTransition: React.FC = () => {
  const { isTransitioning, resolvedTheme } = useTheme();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200000,
            backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#fdfbff',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
};
