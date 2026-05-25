import React from 'react';

type ImagePreviewProps = {
  url: string;
  onRemove: () => void;
  onImageClick?: (url: string) => void;
};

const ImagePreviewComponent: React.FC<ImagePreviewProps> = ({ url, onRemove, onImageClick }) => {
  return (
    <div className="relative w-24 h-24 mt-2 ml-4 mb-2 group">
      <img 
        src={url} 
        alt="Preview" 
        className="w-full h-full object-cover rounded-xl border border-[var(--md-sys-color-outline)] cursor-pointer hover:border-[var(--md-sys-color-primary)] transition-all"
        onClick={() => onImageClick?.(url)}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 bg-[var(--md-sys-color-background)] rounded-full p-0.5 border border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] transition-colors flex items-center justify-center z-10"
      >
        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]">
          close
        </span>
      </button>
    </div>
  );
};

export const ImagePreview = React.memo(ImagePreviewComponent);
