import React from 'react';

interface AddActionProps {
  onAddClick: () => void;
  isImageDisabled: boolean;
}

export const AddAction: React.FC<AddActionProps> = ({ 
  onAddClick, 
  isImageDisabled
}) => {
  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={onAddClick}
        disabled={isImageDisabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl bg-[var(--md-sys-color-surface-container-high)] ${
          isImageDisabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-95 group'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px] group-hover:text-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
        >
          {isImageDisabled ? 'attach_file_off' : 'add'}
        </span>
      </button>
    </div>
  );
};
