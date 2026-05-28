import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface ExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ isExpanded, onToggle }) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onToggle}
      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] transition-all cursor-pointer select-none"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isExpanded ? 'keyboard_control_key' : 'stat_minus_1'}
      </span>
      <span className="text-xs font-medium uppercase tracking-wider">
        {isExpanded ? t('message.collapse') : t('message.expand')}
      </span>
    </button>
  );
};
