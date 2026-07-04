import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';

interface GeoblockDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const GeoblockDialog: React.FC<GeoblockDialogProps> = ({ isOpen, onConfirm }) => {
  return (
    <AlertDialog.Root open={isOpen}>
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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/20"
              >
                <AlertDialog.Title className="text-[var(--md-sys-color-error)] text-xl mb-3 font-semibold">
                  Service Unavailable
                </AlertDialog.Title>
                <AlertDialog.Description className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-relaxed mb-6 font-sans">
                  The service is not supported in this country.
                  <br />
                  <span className="text-xs opacity-80 mt-1 block">
                    Сервис не поддерживается в этой стране.
                  </span>
                </AlertDialog.Description>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={onConfirm}
                    className="px-6 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-medium hover:opacity-90 rounded-full transition-all active:scale-[0.98]"
                  >
                    OK / Ок
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
