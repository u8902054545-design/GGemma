import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';

interface LanguageSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: 'en' | 'ru'; name: string }[] = [
    { code: 'en', name: t('common.en') },
    { code: 'ru', name: t('common.ru') },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
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
        <h1 className="text-[32px] font-normal text-white mt-2 mb-6 tracking-tight align-left w-full">
          {t('settings.language.selection.title')}
        </h1>

        <div className="w-full flex flex-col">
          {languages.map((lang) => {
            const isSelected = language === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="ripple-container w-full py-4 px-3 flex items-center justify-between border-b border-[#111111] hover:bg-white/5 rounded-xl transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {isSelected && (
                      <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-primary)]">
                        check
                      </span>
                    )}
                  </div>
                  <span className={`text-[16px] font-medium transition-colors ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-white'}`}>
                    {lang.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};
