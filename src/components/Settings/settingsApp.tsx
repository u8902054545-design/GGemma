import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { VoiceSelection } from './voiceSelection';
import { LanguageSelection } from './languageSelection';
import { ThemeSelection } from './themeSelection';
import { ChatHistorySelection } from './chatHistorySelection';
import { useLanguage } from '../../hooks/useLanguage';

interface SettingsAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ isOpen, onClose }) => {
  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
  const [isLanguageSelectionOpen, setIsLanguageSelectionOpen] = useState(false);
  const [isThemeSelectionOpen, setIsThemeSelectionOpen] = useState(false);
  const [isChatHistorySelectionOpen, setIsChatHistorySelectionOpen] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100000 }}
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
        <h1 className="text-[32px] font-normal text-[var(--md-sys-color-on-surface)] mt-2 mb-8 tracking-tight align-left w-full">
          {t('settings.title')}
        </h1>

        <div className="w-full flex flex-col gap-1">
          <button
            onClick={() => setIsThemeSelectionOpen(true)}
            className="ripple-container w-full py-4 px-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-2xl transition-all text-left active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-on-surface-variant)]">palette</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{t('settings.theme.title')}</span>
              <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">{t('settings.theme.desc')}</span>
            </div>
          </button>

          <button
            onClick={() => setIsVoiceSelectionOpen(true)}
            className="ripple-container w-full py-4 px-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-2xl transition-all text-left active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-on-surface-variant)]">voice_selection</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{t('settings.voice.title')}</span>
              <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">{t('settings.voice.desc')}</span>
            </div>
          </button>

          <button
            onClick={() => setIsLanguageSelectionOpen(true)}
            className="ripple-container w-full py-4 px-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-2xl transition-all text-left active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-on-surface-variant)]">language</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{t('settings.language.title')}</span>
              <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">{t('settings.language.desc')}</span>
            </div>
          </button>

          <button
            onClick={() => setIsChatHistorySelectionOpen(true)}
            className="ripple-container w-full py-4 px-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-2xl transition-all text-left active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-on-surface-variant)]">history</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{t('settings.chatHistory.saving')}</span>
              <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">{t('settings.chatHistory.menuDesc')}</span>
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
        {isLanguageSelectionOpen && (
          <LanguageSelection
            isOpen={isLanguageSelectionOpen}
            onClose={() => setIsLanguageSelectionOpen(false)}
          />
        )}
        {isThemeSelectionOpen && (
          <ThemeSelection
            isOpen={isThemeSelectionOpen}
            onClose={() => setIsThemeSelectionOpen(false)}
          />
        )}
        {isChatHistorySelectionOpen && (
          <ChatHistorySelection
            isOpen={isChatHistorySelectionOpen}
            onClose={() => setIsChatHistorySelectionOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
