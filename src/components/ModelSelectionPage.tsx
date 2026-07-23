import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SelectedModel } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import { modelDescriptions } from '../modelDescriptions';
import { mdEasing } from '../motion/transitions';

interface ModelSelectionPageProps {
  isOpen: boolean;
  selectedModel: SelectedModel;
  onClose: () => void;
  onModelSelect: (model: SelectedModel) => void;
  models: SelectedModel[];
  exhaustedModels?: string[];
}

export const ModelSelectionPage: React.FC<ModelSelectionPageProps> = ({
  isOpen,
  selectedModel,
  onClose,
  onModelSelect,
  models,
  exhaustedModels = []
}) => {
  const { t, language } = useLanguage();

  const selectModel = (model: SelectedModel) => {
    onModelSelect(model);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          initial={{ y: '100%', opacity: 0.98 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.98 }}
          transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[240] flex transform-gpu flex-col overflow-hidden bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] will-change-transform"
        >
          <header className="sticky top-0 z-10 flex h-[64px] items-center border-b border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-background)]/90 px-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-on-surface-variant)]/10"
              aria-label={t('dialog.cancel')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="ml-2 min-w-0">
              <h1 className="truncate text-lg font-medium text-[var(--md-sys-color-on-surface)]">
                {t('model.selector.allTitle')}
              </h1>
              <p className="truncate text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {t('model.selector.allSubtitle')}
              </p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 pb-8 pt-5">
            <div className="mx-auto w-full max-w-[720px]">
              <div className="mb-4 rounded-[24px] bg-[var(--md-sys-color-surface-container-high)] p-4">
                <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                  {t('model.selector.auto.title')}
                </p>
                <button
                  type="button"
                  onClick={() => selectModel({ id: 'auto', name: t('model.selector.auto.name') })}
                  className={`mt-3 flex w-full items-center gap-4 rounded-[18px] px-4 py-3 text-left transition-colors ${selectedModel.id === 'auto' ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' : 'hover:bg-[var(--md-sys-color-on-surface-variant)]/10'}`}
                >
                  <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">magic_button</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{t('model.selector.auto.name')}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
                      {t('model.selector.auto.desc')}
                    </span>
                  </span>
                  {selectedModel.id === 'auto' && (
                    <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">check</span>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {models.map((model, index) => {
                  const isSelected = selectedModel.id === model.id;
                  const isExhausted = exhaustedModels.includes(model.id);

                  return (
                    <button
                      key={model.id}
                      type="button"
                      disabled={isExhausted}
                      onClick={() => selectModel(model)}
                      className={`flex w-full items-center gap-4 rounded-[22px] border px-4 py-4 text-left transition-colors duration-200 ${isSelected ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' : 'border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)]/40'} disabled:pointer-events-none disabled:opacity-40`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)]/12 text-sm font-semibold text-[var(--md-sys-color-primary)]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{model.name}</span>
                        <span className="mt-1 block text-[13px] leading-5 text-[var(--md-sys-color-on-surface-variant)]">
                          {modelDescriptions[model.id]?.[language] || ''}
                        </span>
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
