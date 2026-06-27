import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { createChatShare, getChatShareCount, SharedChat } from '../Functions/shareUtils';
import { fetchChatMessages } from './chatHeaderFunctions';

interface ShareChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string | undefined;
  chatTitle: string | undefined;
  showSnackbar?: (message: string) => void;
}

export const ShareChatDialog: React.FC<ShareChatDialogProps> = ({
  isOpen,
  onClose,
  chatId,
  chatTitle,
  showSnackbar
}) => {
  const [isOperating, setIsOperating] = useState(false);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [existingCount, setExistingCount] = useState<number | null>(null);
  const [sharedInfo, setSharedInfo] = useState<SharedChat | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const mountedRef = useRef(true);
  const { t } = useLanguage();

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen) {
      setSharedInfo(null);
      setIsCopied(false);
      setExistingCount(null);
      if (chatId) {
        loadShareCount();
      }
    }
    return () => {
      mountedRef.current = false;
    };
  }, [isOpen, chatId]);

  const loadShareCount = async () => {
    if (!chatId) return;
    setIsLoadingCount(true);
    try {
      const count = await getChatShareCount(chatId);
      if (mountedRef.current) {
        setExistingCount(count);
      }
    } catch (err) {
      console.error('Failed to load share count', err);
    } finally {
      if (mountedRef.current) {
        setIsLoadingCount(false);
      }
    }
  };

  const handleCreateShare = async () => {
    if (!chatId) return;
    setIsOperating(true);
    try {
      // 1. Fetch latest messages from database
      const messages = await fetchChatMessages(chatId);
      if (messages.length === 0) {
        throw new Error('Cannot share an empty chat');
      }

      // 2. Insert the shared chat snapshot
      const result = await createChatShare(chatId, chatTitle || '', messages);
      
      if (mountedRef.current) {
        setSharedInfo(result);
        setExistingCount(prev => (prev !== null ? prev + 1 : 1));
        if (showSnackbar) {
          showSnackbar(t('snackbar.chatShared') || 'Chat link ready!');
        }
      }
    } catch (err) {
      console.error('Failed to share chat:', err);
      if (showSnackbar) {
        showSnackbar(t('dialog.share.error.create') || 'Failed to share chat');
      }
    } finally {
      if (mountedRef.current) {
        setIsOperating(false);
      }
    }
  };

  const getShareUrl = () => {
    if (!sharedInfo) return '';
    return `${window.location.origin}/shared/${sharedInfo.id}`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => {
        if (mountedRef.current) setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'linear' }}
                className="fixed inset-0 bg-black/60 z-[300]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.2, 0, 0, 1]
                }}
                className="fixed left-1/2 top-1/2 w-[90vw] max-w-[460px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/10"
              >
                <Dialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-4 font-normal flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">share</span>
                  {t('dialog.share.title')}
                </Dialog.Title>

                <div className="space-y-4">
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    {t('dialog.share.desc')}
                  </p>

                  {isLoadingCount ? (
                    <div className="w-full flex justify-center py-4">
                      <span className="material-symbols-outlined animate-spin text-[24px] text-[var(--md-sys-color-primary)]">progress_activity</span>
                    </div>
                  ) : sharedInfo ? (
                    <div className="space-y-4 mt-2">
                      <div className="flex items-center gap-2 bg-[var(--md-sys-color-surface-container)] rounded-xl p-3 border border-[var(--md-sys-color-outline-variant)]/10">
                        <input
                          type="text"
                          readOnly
                          value={getShareUrl()}
                          className="bg-transparent border-none text-sm text-[var(--md-sys-color-on-surface)] outline-none flex-1 truncate font-mono select-all"
                        />
                        <button
                          onClick={handleCopy}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                            isCopied 
                              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
                              : 'hover:bg-[var(--md-sys-color-on-surface-variant)]/10 text-[var(--md-sys-color-on-surface-variant)]'
                          }`}
                          title={t('dialog.share.copy')}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isCopied ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                        {t('dialog.share.status.shared')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] italic opacity-75 mt-2">
                      {existingCount !== null && existingCount > 0 ? (
                        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)] font-medium">
                          <span className="material-symbols-outlined text-[18px]">info</span>
                          <span>
                            {(t('dialog.share.status.shared_count') || 'Links generated for this chat: {count}').replace('{count}', existingCount.toString())}
                          </span>
                        </div>
                      ) : (
                        t('dialog.share.status.not_shared')
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-3 mt-6 pt-2">
                    {sharedInfo ? (
                      <button
                        onClick={() => setSharedInfo(null)}
                        disabled={isOperating}
                        className="px-4 py-2 border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] rounded-full text-sm font-medium hover:bg-[var(--md-sys-color-primary)]/5 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        {t('dialog.share.create_another') || 'Create another link'}
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateShare}
                        disabled={isOperating}
                        className="px-5 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-sm font-medium hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isOperating ? (
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">link</span>
                        )}
                        {t('dialog.share.create')}
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      disabled={isOperating}
                      className="px-4 py-2 text-[var(--md-sys-color-on-surface-variant)] font-medium hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full text-sm transition-colors"
                    >
                      {t('dialog.share.close')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
