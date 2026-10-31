import React from 'react';

interface AddActionProps {
  onAddClick: () => void;
  preventFocusLoss?: (e: React.MouseEvent) => void;
  isOpen?: boolean;
  title?: string;
}

export const AddAction: React.FC<AddActionProps> = ({ 
  onAddClick,
  preventFocusLoss = (e) => e.preventDefault(),
  isOpen = false,
  title = 'Add'
}) => {
  return (
    <button
      type="button"
      data-add-trigger="true"
      onMouseDown={preventFocusLoss}
      onClick={onAddClick}
      className={`btn-add-bottomleft ${isOpen ? 'menu-open' : ''}`}
      title={title}
      aria-label="Add attachment"
    >
      <span className="material-symbols-outlined text-[24px]">add</span>
    </button>
  );
};
