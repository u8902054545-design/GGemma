import React from 'react';

interface AddActionProps {
  onAddClick: () => void;
}

export const AddAction: React.FC<AddActionProps> = ({ 
  onAddClick
}) => {
  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={onAddClick}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-95 group"
      >
        <span 
          className="material-symbols-outlined text-[24px] group-hover:text-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
        >
          add
        </span>
      </button>
    </div>
  );
};
