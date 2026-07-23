import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SelectedModel } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import { modelDescriptions } from '../modelDescriptions';
import { GemmaIcon } from './IconsApp/GemmaIcon';

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
  const isAutoSelect = selectedModel.id === 'auto';

  const selectModel = (model: SelectedModel) => {
    onModelSelect(model);
    onClose();
  };

  const toggleAutoSelect = () => {
    if (isAutoSelect) {
      const defaultModel = models.find(m => m.id !== 'auto') || models[0];
      if (defaultModel) {
        onModelSelect(defaultModel);
      }
    } else {
      onModelSelect({ id: 'auto', name: t('model.selector.auto.name') || 'Автоматически' });
    }
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
          <header className="sticky top-0 z-10 flex h-[64px] items-center border-b border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-background)]/90 px-3 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-on-surface-variant)]/10"
              aria-label={t('dialog.cancel')}
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>

            <div className="ml-2 flex items-center">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full px-3 py-1.5 text-lg font-medium text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-on-surface-variant)]/10"
              >
                <GemmaIcon className="h-6 w-6 shrink-0" />
                <span>Gemma models</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 pb-8 pt-5">
            <div className="mx-auto w-full max-w-[720px]">
              {/* Material 3 Auto-Select Toggle Card */}
              <div className="mb-6 rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-surface-container-high)] p-5 shadow-sm transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${isAutoSelect ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'}`}>
                      <span className="material-symbols-outlined text-[24px]">magic_button</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
                        {t('model.selector.auto.title') || 'Автоматический выбор модели'}
                      </h2>
                      <p className="mt-0.5 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                        {t('model.selector.auto.desc') || 'Оптимальный подбор модели под каждый запрос'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAutoSelect}
                    onClick={toggleAutoSelect}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${
                      isAutoSelect
                        ? 'bg-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-md transition duration-300 ease-in-out flex items-center justify-center ${
                        isAutoSelect
                          ? 'translate-x-6 bg-[var(--md-sys-color-on-primary)] text-[var(--md-sys-color-primary)]'
                          : 'translate-x-0 bg-[var(--md-sys-color-outline)] text-transparent'
                      }`}
                    >
                      {isAutoSelect && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </span>
                  </button>
                </div>

                {isAutoSelect && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/20 text-xs text-[var(--md-sys-color-primary)] font-medium flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>Автоматический выбор активен. Система автоматически подберет подходящую модель Gemma.</span>
                  </motion.div>
                )}
              </div>

              {/* Models List (Only rendered when Auto Select is OFF) */}
              <AnimatePresence mode="wait">
                {!isAutoSelect && (
                  <motion.div
                    key="models-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {models.map((model) => {
                      const isSelected = selectedModel.id === model.id;
                      const isExhausted = exhaustedModels.includes(model.id);

                      return (
                        <button
                          key={model.id}
                          type="button"
                          disabled={isExhausted}
                          onClick={() => selectModel(model)}
                          className={`group relative flex w-full items-start gap-4 rounded-[28px] border p-5 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-md'
                              : 'border-[var(--md-sys-color-outline-variant)]/25 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)]/40 hover:bg-[var(--md-sys-color-surface-container-highest)]'
                          } disabled:pointer-events-none disabled:opacity-40`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                              isSelected
                                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                                : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold tracking-tight">{model.name}</span>
                              {isSelected && (
                                <span className="rounded-full bg-[var(--md-sys-color-primary)]/15 px-2.5 py-0.5 text-[11px] font-medium text-[var(--md-sys-color-primary)]">
                                  Выбрано
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                              {modelDescriptions[model.id]?.[language] || ''}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
