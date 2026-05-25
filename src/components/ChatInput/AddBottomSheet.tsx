import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';

interface AddBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick: () => void;
  onCameraClick: () => void;
  isSearchActive: boolean;
  onSearchToggle: () => void;
}

export const AddBottomSheet: React.FC<AddBottomSheetProps> = ({
  isOpen,
  onClose,
  onPhotoClick,
  onCameraClick,
  isSearchActive,
  onSearchToggle
}) => {
  const { t } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface-container-low)] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-[1200px] mx-auto focus:outline-none">
          <div className="p-4 bg-[var(--md-sys-color-surface-container-low)] rounded-t-[32px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline-variant)] mb-8" />
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => { onPhotoClick(); onClose(); }}
                className="flex-1 aspect-square bg-[var(--md-sys-color-surface-container-highest)] rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[32px] text-[var(--md-sys-color-primary)]">photo</span>
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{t('chat.add.photo')}</span>
              </button>
              
              <button 
                onClick={() => { onCameraClick(); onClose(); }}
                className="flex-1 aspect-square bg-[var(--md-sys-color-surface-container-highest)] rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[32px] text-[var(--md-sys-color-primary)]">photo_camera</span>
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{t('chat.add.camera')}</span>
              </button>
            </div>

            <button
              onClick={() => { onSearchToggle(); onClose(); }}
              className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all active:scale-[0.98] ${
                isSearchActive 
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
                  : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isSearchActive ? 'text-[var(--md-sys-color-primary)]' : ''}`}>
                search
              </span>
              <span className="text-[16px] font-medium flex-1 text-left">{t('chat.add.search')}</span>
              {isSearchActive && (
                 <span className="material-symbols-outlined text-[20px]">check</span>
              )}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
