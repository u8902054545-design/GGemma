import React from 'react';

interface SidebarSearchProps {
  onClick: () => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 min-w-0 flex-1 flex items-center gap-3 rounded-full bg-[var(--md-sys-color-surface-container-high)] px-4 text-left text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-sys-color-primary)] active:scale-[0.99]"
      aria-label="Search for chats"
    >
      <md-icon className="text-[20px] shrink-0">search</md-icon>
      <span className="min-w-0 truncate text-sm font-normal">Search for chats</span>
    </button>
  );
};
