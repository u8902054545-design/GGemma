import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { SelectedModel } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import { modelDescriptions } from '../modelDescriptions';

interface GemmaModelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: SelectedModel;
  onModelSelect: (model: SelectedModel) => void;
  models: SelectedModel[];
  exhaustedModels?: string[];
  onViewAllModels: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const GemmaModelDialog: React.FC<GemmaModelDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedModel,
  onModelSelect,
  models,
  exhaustedModels = [],
  onViewAllModels,
  triggerRef
}) => {
  const { t, language } = useLanguage();
  const latestModels = models.slice(0, 3);
  const [dialogStyle, setDialogStyle] = useState<React.CSSProperties & { originX?: number; originY?: number }>({
    originX: 0.05,
    originY: 0,
  });
  const [hasPosition, setHasPosition] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let buttonRect: DOMRect | null = null;
      if (triggerRef?.current) {
        buttonRect = triggerRef.current.getBoundingClientRect();
      } else {
        const btn = document.querySelector('[data-model-selector-button="true"]');
        if (btn) {
          buttonRect = btn.getBoundingClientRect();
        }
      }

      if (buttonRect && buttonRect.width > 0) {
        const top = buttonRect.bottom + 6;
        const maxLeft = typeof window !== 'undefined' ? window.innerWidth - 444 : 800;
        const left = Math.max(12, Math.min(buttonRect.left, maxLeft));
        const relativeX = (buttonRect.left + buttonRect.width / 2 - left) / 430;
        const clampedOriginX = Math.max(0.02, Math.min(0.98, relativeX));

        setDialogStyle({
          top: `${top}px`,
          left: `${left}px`,
          originX: clampedOriginX,
          originY: 0,
        });
        setHasPosition(true);
      } else {
        setDialogStyle({
          originX: 0.05,
          originY: 0,
        });
        setHasPosition(false);
      }
    }
  }, [isOpen, triggerRef]);

  const selectModel = (model: SelectedModel) => {
    onModelSelect(model);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount className="fixed inset-0 z-[220] bg-transparent" />

            <Dialog.Content forceMount asChild onOpenAutoFocus={(event) => event.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                style={dialogStyle}
                className={`fixed z-[230] w-[calc(100vw-28px)] max-w-[430px] transform-gpu outline-none will-change-[transform,opacity] ${!hasPosition ? 'left-[max(0.75rem,calc((100vw-1200px)/2+64px))] top-[58px]' : ''}`}
              >
                <div className="overflow-hidden rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-surface-container-high)] shadow-xl">
                  <div className="px-6 pb-3 pt-6">
                    <Dialog.Title className="text-xl font-medium text-[var(--md-sys-color-on-surface)]">
                      {t('model.selector.title')}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                      {t('model.selector.latest')}
                    </p>
                  </div>

                  <div className="px-3 pb-2">
                    {latestModels.map((model) => {
                      const isSelected = selectedModel.id === model.id;
                      const isExhausted = exhaustedModels.includes(model.id);

                      return (
                        <button
                          key={model.id}
                          type="button"
                          disabled={isExhausted}
                          onClick={() => selectModel(model)}
                          className={`mb-1 flex w-full items-center gap-4 rounded-[20px] px-4 py-3 text-left transition-colors duration-200 ${isSelected ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10'} disabled:pointer-events-none disabled:opacity-40`}
                        >
                          <span className={`material-symbols-outlined text-[22px] ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                            auto_awesome
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-medium">{model.name}</span>
                            <span className="mt-0.5 block truncate text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
                              {modelDescriptions[model.id]?.[language] || ''}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[22px] text-[var(--md-sys-color-primary)]">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onViewAllModels}
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-[24px] border border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-surface-container-high)] px-5 py-3 text-sm font-medium text-[var(--md-sys-color-on-surface)] shadow-xl transition-colors duration-200 hover:bg-[var(--md-sys-color-surface-container-highest)] active:bg-[var(--md-sys-color-surface-container-highest)]"
                >
                  <span className="material-symbols-outlined text-[30px] text-white">more_horiz</span>
                  <span>{t('model.selector.viewAll')}</span>
                </button>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
