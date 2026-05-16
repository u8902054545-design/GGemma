import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { VoiceSelection } from './voiceSelection';

interface SettingsAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ isOpen, onClose }) => {
  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100000 }}
      className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden"
    >
      <header className="w-full p-4 flex items-center justify-start">
        <button
          onClick={onClose}
          className="p-3 hover:bg-white/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-start justify-start px-6 pb-8 overflow-y-auto w-full max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-normal text-white mt-2 mb-8 tracking-tight align-left w-full">
          Application Settings
        </h1>

        <div className="w-full flex flex-col gap-1">
          <button
            onClick={() => setIsVoiceSelectionOpen(true)}
            className="ripple-container w-full py-4 px-3 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all text-left active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-on-surface-variant)]">voice_selection</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-white">Voice and dubbing</span>
              <span className="text-[14px] text-[#999999]">Voice selection for voicing</span>
            </div>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {isVoiceSelectionOpen && (
          <VoiceSelection
            isOpen={isVoiceSelectionOpen}
            onClose={() => setIsVoiceSelectionOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
