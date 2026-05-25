import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { mdEasing } from '../motion/transitions';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({ isOpen, onClose, currentTitle, onConfirm }) => {
  const [inputValue, setInputValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentTitle);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, currentTitle]);

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
                className="fixed inset-0 bg-black/60 z-[100]" 
                />
                </Dialog.Overlay>                <Dialog.Content asChild>
                <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[400px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[101] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/10"
                >
                <Dialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-6 font-normal">
                  {t('dialog.rename.title')}
                </Dialog.Title>

                <div className="relative group">
                  <input
                    ref={inputRef}
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-4 py-4 rounded-[4px] outline-none focus:border-[var(--md-sys-color-primary)] transition-all"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 bg-[var(--md-sys-color-surface-container-high)] px-1 text-xs text-[var(--md-sys-color-on-surface-variant)] group-focus-within:text-[var(--md-sys-color-primary)] transition-all">
                    {t('dialog.rename.input')}
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button onClick={onClose} className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-primary)]/10 rounded-full transition-colors">
                    {t('dialog.cancel')}
                  </button>
                  <button
                    onClick={() => { onConfirm(inputValue); onClose(); }}
                    className="px-6 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-medium hover:shadow-md active:scale-95 transition-all"
                  >
                    {t('dialog.rename.save')}
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
