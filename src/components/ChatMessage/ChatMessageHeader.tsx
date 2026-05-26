import React from 'react';

type HeaderProps = {
  hasThought: boolean;
  isExpanded: boolean;
  onToggleThought: () => void;
};

export const ChatMessageHeader: React.FC<HeaderProps> = ({
  hasThought,
  isExpanded,
  onToggleThought
}) => {
  if (!hasThought) return null;

  return (
    <div className="flex items-center gap-2 mb-3 w-full">
      <button
        onClick={onToggleThought}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors text-[11px] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline)]/20"
      >
        <span>Show thought</span>
        <span className="material-symbols-outlined text-[14px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
    </div>
  );
};
