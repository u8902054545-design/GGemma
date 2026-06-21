import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface SidebarSearchProps {
  onClick: () => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ onClick }) => {
  const { t } = useLanguage();

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]">
      <span className="material-symbols-outlined text-[20px]">search</span>
      <span>{t('chat.search')}</span>
    </button>
  );
};
