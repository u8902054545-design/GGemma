import React, { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

interface DeleteAllSharesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const DeleteAllSharesDialog: React.FC<DeleteAllSharesDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <AlertDialog.Portal forceMount>
            <AlertDialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/60 z-[300]" 
              />
            </AlertDialog.Overlay>
            <AlertDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/10"
              >
                <AlertDialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-4 font-normal">
                  {t('shared.delete_all_confirm_title') || 'Delete all public links?'}
                </AlertDialog.Title>
                <AlertDialog.Description className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-relaxed mb-6">
                  {t('shared.delete_all_confirm')}
                </AlertDialog.Description>
                
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-full transition-colors disabled:opacity-50 text-sm bg-transparent border-none"
                  >
                    {t('dialog.cancel')}
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="px-4 py-2 text-[var(--md-sys-color-error)] font-medium hover:bg-[var(--md-sys-color-error)]/10 rounded-full transition-colors active:bg-[var(--md-sys-color-error)]/20 disabled:opacity-50 flex items-center gap-2 min-w-[80px] justify-center text-sm bg-transparent border-none"
                  >
                    {isLoading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      t('dialog.delete.confirm')
                    )}
                  </button>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
};
export default DeleteAllSharesDialog;
