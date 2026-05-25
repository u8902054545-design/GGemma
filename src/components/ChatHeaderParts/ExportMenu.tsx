import React, { useState } from 'react';
import { Drawer } from 'vaul';
import { downloadHistory } from '../chatHeaderFunctions';
import { useLanguage } from '../../hooks/useLanguage';
import { ExportConfirmDialog } from '../../TemporaryChat/ExportConfirmDialog';

interface ExportMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: any[];
  isTemporary?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  isOpen,
  onOpenChange,
  messages,
  isTemporary = false
}) => {
  const { t } = useLanguage();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<'txt' | 'json' | null>(null);

  const handleExportClick = (format: 'txt' | 'json') => {
    if (isTemporary) {
      setPendingExport(format);
      setIsConfirmDialogOpen(true);
    } else {
      downloadHistory(messages, format);
      onOpenChange(false);
    }
  };

  const handleConfirmExport = () => {
    if (pendingExport) {
      downloadHistory(messages, pendingExport);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[190]" />
          <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[200] outline-none border-none max-w-lg mx-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
            <div className="p-4 bg-[var(--md-sys-color-surface)] pb-8">
              <div className="text-[var(--md-sys-color-on-surface)] text-lg font-medium px-4 mb-4 text-center">{t('export.title')}</div>
              <button
                onClick={() => handleExportClick('txt')}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)]">description</span>
                <span className="text-[var(--md-sys-color-on-surface)]">{t('export.txt')}</span>
              </button>
              <button
                onClick={() => handleExportClick('json')}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 transition-colors border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)]">data_object</span>
                <span className="text-[var(--md-sys-color-on-surface)]">{t('export.json')}</span>
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <ExportConfirmDialog 
        isOpen={isConfirmDialogOpen} 
        onClose={() => setIsConfirmDialogOpen(false)} 
        onConfirm={handleConfirmExport} 
      />
    </>
  );
};
