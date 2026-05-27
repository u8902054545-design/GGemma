import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/divider/divider.js';

interface AddBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick: () => void;
  onCameraClick: () => void;
  onVideoClick: () => void;
  isSearchActive: boolean;
  onSearchToggle: () => void;
  isImageDisabled?: boolean;
  isVideoDisabled?: boolean;
}

export const AddBottomSheet: React.FC<AddBottomSheetProps> = ({
  isOpen,
  onClose,
  onPhotoClick,
  onCameraClick,
  onVideoClick,
  isSearchActive,
  onSearchToggle,
  isImageDisabled = false,
  isVideoDisabled = false
}) => {
  const { t } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-[1200px] mx-auto focus:outline-none">
          <div className="p-4 bg-[var(--md-sys-color-surface)] rounded-t-[32px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline-variant)] mb-6" />
            
            <md-list style={{ 
              '--md-list-container-color': 'transparent',
              'padding': '0'
            }}>
              <md-list-item
                type="button"
                disabled={isImageDisabled}
                onClick={() => { onPhotoClick(); onClose(); }}
                style={{
                  '--md-list-item-label-text-color': 'var(--md-sys-color-on-surface)',
                  '--md-list-item-supporting-text-color': 'var(--md-sys-color-on-surface-variant)',
                  'cursor': isImageDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                <div slot="headline">{t('chat.add.photo')}</div>
                <md-icon slot="start">
                  {isImageDisabled ? 'bid_landscape_disabled' : 'photo'}
                </md-icon>
              </md-list-item>

              <md-list-item
                type="button"
                disabled={isImageDisabled}
                onClick={() => { onCameraClick(); onClose(); }}
                style={{
                  '--md-list-item-label-text-color': 'var(--md-sys-color-on-surface)',
                  '--md-list-item-supporting-text-color': 'var(--md-sys-color-on-surface-variant)',
                  'cursor': isImageDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                <div slot="headline">{t('chat.add.camera')}</div>
                <md-icon slot="start">
                  {isImageDisabled ? 'no_photography' : 'photo_camera'}
                </md-icon>
              </md-list-item>

              <md-list-item
                type="button"
                disabled={isVideoDisabled}
                onClick={() => { onVideoClick(); onClose(); }}
                style={{
                  '--md-list-item-label-text-color': 'var(--md-sys-color-on-surface)',
                  '--md-list-item-supporting-text-color': 'var(--md-sys-color-on-surface-variant)',
                  'cursor': isVideoDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                <div slot="headline">{t('chat.add.video')}</div>
                <md-icon slot="start">
                  {isVideoDisabled ? 'videocam_off' : 'videocam'}
                </md-icon>
              </md-list-item>

              <md-divider style={{ margin: '8px 16px', opacity: 0.1 }} />

              <md-list-item
                type="button"
                onClick={() => { onSearchToggle(); onClose(); }}
                style={{
                  '--md-list-item-label-text-color': isSearchActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                  '--md-list-item-container-color': isSearchActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                  'border-radius': '16px',
                  'margin': '0 8px'
                }}
              >
                <div slot="headline">{t('chat.add.search')}</div>
                <md-icon slot="start" style={{ color: isSearchActive ? 'var(--md-sys-color-primary)' : 'inherit' }}>
                  search
                </md-icon>
                {isSearchActive && (
                   <md-icon slot="end" style={{ color: 'var(--md-sys-color-primary)' }}>check</md-icon>
                )}
              </md-list-item>
            </md-list>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
