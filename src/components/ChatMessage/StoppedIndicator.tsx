import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';

export const StoppedIndicator: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] w-fit select-none"
    >
      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
        info
      </span>
      <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
        {t('message.stopped')}
      </span>
    </motion.div>
  );
};
