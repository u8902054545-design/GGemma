import React from 'react';

interface AddActionProps {
  onAddClick: () => void;
  isImageDisabled: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AddAction: React.FC<AddActionProps> = ({ 
  onAddClick, 
  isImageDisabled, 
  fileInputRef, 
  onFileChange 
}) => {
  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={onAddClick}
        disabled={isImageDisabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
          isImageDisabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'hover:bg-[#1a1a1a] active:scale-95 group'
        }`}
        style={{ backgroundColor: '#0f0f0f' }}
      >
        <span 
          className="material-symbols-outlined text-[24px] group-hover:text-[#8ab4f8]"
          style={{ color: '#e2e2e2' }}
        >
          {isImageDisabled ? 'attach_file_off' : 'add'}
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
