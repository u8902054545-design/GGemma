import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface SidebarSearchProps {
  onClick: () => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ onClick }) => {
  const { t } = useLanguage();

  return (
    <div onClick={onClick} className="relative group cursor-pointer">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] text-[20px]">search</span>
      <div className="w-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] pl-10 pr-4 py-3 rounded-full text-sm flex items-center transition-colors group-hover:bg-[var(--md-sys-color-surface-container-highest)]">
        {t('chat.search')}
      </div>
    </div>
  );
};
