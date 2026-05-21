import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';

interface TTSHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  onModelConfigClick: () => void;
}

export const TTSHeader: React.FC<TTSHeaderProps> = ({
  onMenuClick,
  isSidebarOpen,
  onModelConfigClick
}) => {
  return (
    <header className="px-4 py-3 flex justify-between items-center sticky top-0 z-50 bg-black h-[64px]">
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <AnimatePresence initial={false}>
            {!isSidebarOpen && (
              <motion.button
                key="hamburger"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                onClick={onMenuClick}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">
                  menu
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <h1 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate ml-1">
          Audio messages
        </h1>
      </div>

      <div className="flex items-center justify-end min-w-[48px]">
        <button 
          onClick={onModelConfigClick}
          className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">
            tune
          </span>
        </button>
      </div>
    </header>
  );
};
