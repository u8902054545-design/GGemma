import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

export const TemporaryChatPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--md-sys-color-background)]"
    >
      <div className="flex flex-col items-center max-w-sm text-center mb-20">
        <div className="w-20 h-20 rounded-3xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center mb-6 shadow-2xl border border-[var(--md-sys-color-outline-variant)]/10">
          <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-[40px]">
            chat_dashed
          </span>
        </div>

        <h2 className="text-[var(--md-sys-color-primary)] text-2xl font-semibold mb-3 tracking-tight">
          {t('chat.temporary')}
        </h2>
        
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-relaxed">
          {t('chat.temporary.desc')}
        </p>
      </div>
    </motion.div>
  );
};
