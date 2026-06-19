import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { getKeyboardDialogStyle, keyboardDialogTransition } from '../motion/keyboardDialog';
import { mdEasing } from '../motion/transitions';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onConfirm: (newTitle: string) => void | Promise<void>;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({ isOpen, onClose, currentTitle, onConfirm }) => {
  const [inputValue, setInputValue] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [dialogHeight, setDialogHeight] = useState(200);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const { t } = useLanguage();

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen) {
      setInputValue(currentTitle);
      setIsLoading(false);
      setKeyboardHeight(0);
      setTimeout(() => {
        if (!mountedRef.current) return;
        autoResize();
        if (dialogRef.current) {
          setDialogHeight(dialogRef.current.offsetHeight);
        }
      }, 50);
    }
    return () => { mountedRef.current = false; };
  }, [isOpen, currentTitle, autoResize]);

  const handleTextareaFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    const len = e.target.value.length;
    e.target.setSelectionRange(len, len);
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;

    const handleViewportResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      const keyboard = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardHeight(Math.max(0, keyboard));
    };

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', handleViewportResize);
    viewport?.addEventListener('scroll', handleViewportResize);

    return () => {
      viewport?.removeEventListener('resize', handleViewportResize);
      viewport?.removeEventListener('scroll', handleViewportResize);
    };
  }, [isOpen]);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(inputValue);
    } catch {
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        onClose();
      }
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
                ref={dialogRef}
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 1, x: '-50%', y: '-50%' }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.2, 0, 0, 1]
                }}
                className="fixed left-1/2 top-1/2 w-[90vw] max-w-[400px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/10"
                style={{
                  ...getKeyboardDialogStyle(keyboardHeight, dialogHeight),
                  ...keyboardDialogTransition,
                }}
              >
                <Dialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-6 font-normal">
                  {t('dialog.rename.title')}
                </Dialog.Title>

                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={handleTextareaFocus}
                    rows={1}
                    className="w-full bg-transparent border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-4 py-4 rounded-[4px] outline-none focus:border-[var(--md-sys-color-primary)] transition-all resize-none overflow-y-auto max-h-[200px] leading-normal"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 bg-[var(--md-sys-color-surface-container-high)] px-1 text-xs text-[var(--md-sys-color-on-surface-variant)] group-focus-within:text-[var(--md-sys-color-primary)] transition-all">
                    {t('dialog.rename.input')}
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-primary)]/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    {t('dialog.cancel')}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-medium hover:shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[80px] justify-center"
                  >
                    {isLoading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      t('dialog.rename.save')
                    )}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
