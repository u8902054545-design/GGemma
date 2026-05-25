import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';
import '@material/web/button/text-button.js';

interface ExportConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExportConfirmDialog: React.FC<ExportConfirmDialogProps> = ({ isOpen, onClose, onConfirm }) => {
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
                className="fixed inset-0 bg-black/40 z-[300]" 
              />
            </AlertDialog.Overlay>
            <AlertDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: mdEasing.standard }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[400px] bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] p-6 z-[310] outline-none shadow-2xl border border-[var(--md-sys-color-outline-variant)]/20"
              >
                <div className="flex flex-col">
                  <div className="flex flex-col items-center gap-4 text-center mb-6">
                    <span className="material-symbols-outlined text-[28px] text-[var(--md-sys-color-primary)]">
                      warning
                    </span>
                    <AlertDialog.Title className="text-[var(--md-sys-color-on-surface)] text-[24px] font-normal leading-tight">
                      {t('temp.export.confirm.title')}
                    </AlertDialog.Title>
                  </div>
                  
                  <AlertDialog.Description className="text-[var(--md-sys-color-on-surface-variant)] text-[14px] leading-relaxed mb-8 px-2">
                    {t('temp.export.confirm.desc')}
                  </AlertDialog.Description>
                  
                  <div className="flex justify-end gap-6 pr-2">
                    <md-text-button 
                      onClick={onClose}
                      style={{
                        '--md-text-button-label-text-color': 'var(--md-sys-color-primary)',
                        'padding-left': '12px',
                        'padding-right': '12px'
                      }}
                    >
                      {t('dialog.cancel')}
                    </md-text-button>
                    <md-text-button 
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      style={{
                        '--md-text-button-label-text-color': 'var(--md-sys-color-primary)',
                        '--md-text-button-label-text-font': 'medium',
                        'padding-left': '12px',
                        'padding-right': '12px'
                      }}
                    >
                      {t('temp.export.confirm.accept')}
                    </md-text-button>
                  </div>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
};
