import React, { useRef, useEffect, useState } from 'react';

interface AudioDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  defaultFilename: string;
}

export const AudioDownloadDialog: React.FC<AudioDownloadDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  defaultFilename 
}) => {
  const [filename, setFilename] = useState(defaultFilename);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFilename(defaultFilename);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultFilename]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#000000]/60" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[320px] bg-[#1c1b1f] rounded-[28px] p-6 shadow-2xl border border-white/10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#8ab4f8]/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#8ab4f8] text-[28px]">
              download
            </span>
          </div>
          <h2 className="text-xl font-medium text-[#e6e1e5] text-center">
            Download audio
          </h2>
        </div>

        <div className="relative mb-8">
          <input
            ref={inputRef}
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="File name"
            className="w-full bg-[#1c1b1f] border border-[#938f99] rounded-xl px-4 py-3 text-[#e6e1e5] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none transition-all"
            onKeyDown={(e) => e.key === 'Enter' && onConfirm(filename)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#938f99]">
            .mp3
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(filename)}
            className="px-6 py-2.5 text-sm font-medium bg-[#8ab4f8] text-[#004a77] rounded-full hover:shadow-md transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
