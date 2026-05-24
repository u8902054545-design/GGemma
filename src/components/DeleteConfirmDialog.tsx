import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onClose, onConfirm }) => {
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
                className="fixed inset-0 bg-black/80 z-[100]" 
              />
            </AlertDialog.Overlay>
            <AlertDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] bg-[#211f26] rounded-[28px] p-6 z-[101] outline-none shadow-xl"
              >
                <AlertDialog.Title className="text-[#e6e1e5] text-xl mb-4 font-normal">
                  {t('dialog.delete.title')}
                </AlertDialog.Title>
                <AlertDialog.Description className="text-[#cac4d0] text-sm leading-relaxed mb-6">
                  {t('dialog.delete.desc')}
                </AlertDialog.Description>
                
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[var(--md-sys-color-primary)] font-medium hover:bg-white/5 rounded-full transition-colors"
                  >
                    {t('dialog.cancel')}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm();
                    }} 
                    className="px-4 py-2 text-[#ffb4ab] font-medium hover:bg-[#ffb4ab]/10 rounded-full transition-colors active:bg-[#ffb4ab]/20"
                  >
                    {t('dialog.delete.confirm')}
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
