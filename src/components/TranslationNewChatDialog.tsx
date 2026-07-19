import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

interface TranslationNewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const TranslationNewChatDialog: React.FC<TranslationNewChatDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useLanguage();

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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl"
              >
                <AlertDialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-4 font-normal">
                  {t('dialog.translation.title') || 'Disable Translation?'}
                </AlertDialog.Title>
                <AlertDialog.Description className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-relaxed mb-6">
                  {t('dialog.translation.desc') || 'Disabling translation in an active chat will require starting a new chat.'}
                </AlertDialog.Description>
                
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-full transition-colors"
                  >
                    {t('dialog.cancel') || 'Cancel'}
                  </button>
                  <button 
                    type="button"
                    onClick={onConfirm}
                    className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-[var(--md-sys-color-primary)]/10 rounded-full transition-colors"
                  >
                    {t('dialog.translation.confirm') || 'Open new chat'}
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
