import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme, Theme } from '../../hooks/useTheme';

interface ThemeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelection: React.FC<ThemeSelectionProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; icon: string }[] = [
    { id: 'system', name: t('settings.theme.system'), icon: 'settings_brightness' },
    { id: 'dark', name: t('settings.theme.dark'), icon: 'mode_night' },
    { id: 'light', name: t('settings.theme.light'), icon: 'light_mode' },
  ];

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
          {t('settings.theme.selection.title')}
        </h1>

        <div className="w-full flex flex-col">
          {themes.map((tItem) => {
            const isSelected = theme === tItem.id;

            return (
              <button
                key={tItem.id}
                onClick={() => setTheme(tItem.id)}
                className="ripple-container w-full py-4 px-3 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/10 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-xl transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined text-[24px] ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                    {tItem.icon}
                  </span>
                  <span className={`text-[16px] font-medium transition-colors ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface)]'}`}>
                    {tItem.name}
                  </span>
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  {isSelected && (
                    <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-primary)]">
                      check
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};
