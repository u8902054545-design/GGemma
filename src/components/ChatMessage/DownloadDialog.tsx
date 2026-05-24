import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string, extension: string) => void;
  defaultExtension: string;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  defaultExtension 
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const extRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const filename = nameRef.current?.value || 'script';
    const extension = extRef.current?.value || defaultExtension;
    onConfirm(filename, extension);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#000000]/60" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[320px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 shadow-2xl border border-[var(--md-sys-color-outline-variant)]">
        <h2 className="text-xl font-medium mb-6 text-[var(--md-sys-color-on-surface)]">
          {t('download.code.title')}
        </h2>

        <div className="flex flex-col gap-5 mb-8">
          <div className="relative">
            <input
              ref={nameRef}
              type="text"
              defaultValue="script"
              placeholder={t('download.code.filename')}
              className="w-full bg-transparent border border-[var(--md-sys-color-outline)] rounded-lg px-3 py-3 text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] outline-none transition-colors"
            />
          </div>
          
          <div className="relative">
            <input
              ref={extRef}
              type="text"
              defaultValue={defaultExtension}
              placeholder={t('download.code.extension')}
              className="w-full bg-transparent border border-[var(--md-sys-color-outline)] rounded-lg px-3 py-3 text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] rounded-full transition-colors"
          >
            {t('dialog.cancel')}
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full hover:shadow-md transition-all active:scale-95"
          >
            {t('download.code.button')}
          </button>
        </div>
      </div>
    </div>
  );
};
