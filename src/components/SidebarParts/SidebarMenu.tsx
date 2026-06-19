import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';
import { Chat } from '../../hooks/chatTypes';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChat: Chat | null;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  isPinning?: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onOpenChange,
  selectedChat,
  onPin,
  onRename,
  onDelete,
  onExport,
  isPinning = false
}) => {
  const { t } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[160]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[170] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
          <div className="p-4 bg-[var(--md-sys-color-surface)] pb-8">
            <div className="text-[var(--md-sys-color-on-surface)] text-sm font-medium px-6 mb-2 opacity-50 truncate">
              {selectedChat?.title}
            </div>
            <button
              onClick={onPin}
              disabled={isPinning}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors text-[var(--md-sys-color-on-surface)] border-none bg-transparent disabled:opacity-50"
            >
              {isPinning ? (
                <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">
                  {selectedChat?.is_pinned ? 'keep_off' : 'keep'}
                </span>
              )}
              <span>{selectedChat?.is_pinned ? t('menu.unpin') : t('menu.pin')}</span>
            </button>
            <button
              onClick={onRename}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors text-[var(--md-sys-color-on-surface)] border-none bg-transparent"
            >
              <span className="material-symbols-outlined">edit</span>
              <span>{t('menu.rename')}</span>
            </button>
            <button
              onClick={onExport}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors text-[var(--md-sys-color-on-surface)] border-none bg-transparent"
            >
              <span className="material-symbols-outlined">download</span>
              <span>{t('export.title')}</span>
            </button>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors text-[var(--md-sys-color-error)] border-none bg-transparent"
            >
              <span className="material-symbols-outlined">delete</span>
              <span>{t('menu.delete')}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
