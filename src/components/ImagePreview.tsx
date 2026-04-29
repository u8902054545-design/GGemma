import React from 'react';

type ImagePreviewProps = {
  url: string;
  onRemove: () => void;
};

const ImagePreviewComponent: React.FC<ImagePreviewProps> = ({ url, onRemove }) => {
  return (
    <div className="relative w-24 h-24 mt-2 ml-4 mb-2 group">
      <img 
        src={url} 
        alt="Preview" 
        className="w-full h-full object-cover rounded-xl border border-[#333]"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-black rounded-full p-0.5 border border-[#333] hover:border-[#555] transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[18px] text-[#808080] group-hover:text-[#e2e2e2]">
          close
        </span>
      </button>
    </div>
  );
};

export const ImagePreview = React.memo(ImagePreviewComponent);
