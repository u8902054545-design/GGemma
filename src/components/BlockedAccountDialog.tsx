import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

interface BlockedAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedAccountDialog: React.FC<BlockedAccountDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
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
                initial={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                exit={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                className="fixed top-1/2 left-1/2 w-[90vw] max-w-[360px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-xl border border-[var(--md-sys-color-outline-variant)]/20 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                  className="mb-4 text-[var(--md-sys-color-error)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-14 h-14"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                    />
                  </svg>
                </motion.div>

                <AlertDialog.Title className="text-[var(--md-sys-color-on-surface)] text-xl mb-2 font-semibold">
                  {t('login.blocked.title')}
                </AlertDialog.Title>
                
                <AlertDialog.Description className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-relaxed mb-6 font-sans">
                  {t('login.blocked.message')}
                </AlertDialog.Description>
                
                <div className="flex justify-center w-full">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-8 py-2.5 bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] font-medium hover:opacity-90 rounded-full transition-all active:scale-[0.98] w-full"
                  >
                    {t('login.blocked.button')}
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
