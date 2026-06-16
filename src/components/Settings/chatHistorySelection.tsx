import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useLanguage } from '../../hooks/useLanguage';

interface ChatHistorySelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatHistorySelection: React.FC<ChatHistorySelectionProps> = ({ isOpen, onClose }) => {
  const { isChatHistoryEnabled, setChatHistoryEnabled } = useChatHistory();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
      className="fixed inset-0 bg-[var(--md-sys-color-background)] flex flex-col font-sans overflow-hidden"
    >
      <header className="w-full p-4 flex items-center justify-start">
        <button
          onClick={onClose}
          className="p-3 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-start justify-start px-6 pb-8 overflow-y-auto w-full max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-normal text-[var(--md-sys-color-on-surface)] mt-2 mb-6 tracking-tight align-left w-full">
          {t('settings.chatHistory.title')}
        </h1>

        <div className="w-full flex items-center justify-between py-4 px-3 border-b border-[var(--md-sys-color-outline-variant)]/10">
          <div className="flex flex-col gap-1 pr-4">
            <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">
              {t('settings.chatHistory.saving')}
            </span>
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {t('settings.chatHistory.desc')}
            </span>
          </div>
          <button
            onClick={() => setChatHistoryEnabled(!isChatHistoryEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isChatHistoryEnabled ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-surface-variant)]'}`}
            role="switch"
            aria-checked={isChatHistoryEnabled}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChatHistoryEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </main>
    </motion.div>
  );
};
