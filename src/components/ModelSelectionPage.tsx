import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SelectedModel } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import { modelDescriptions } from '../modelDescriptions';
import { GemmaIcon } from './IconsApp/GemmaIcon';
import { GeminiIcon } from './IconsApp/GeminiIcon';
import { AntigravityIcon } from './IconsApp/AntigravityIcon';
import { usePremium } from '../hooks/usePremium';
import { QuotaAndUsagePage } from './QuotaUsage/QuotaAndUsagePage';
import { modelPageVariants } from '../motion/modelPageTransitions';

interface ModelSelectionPageProps {
  isOpen: boolean;
  selectedModel: SelectedModel;
  onClose: () => void;
  onModelSelect: (model: SelectedModel) => void;
  models: SelectedModel[];
  exhaustedModels?: string[];
}

type FilterGroup = 'all' | 'gemma' | 'gemini' | 'antigravity';

export const ModelSelectionPage: React.FC<ModelSelectionPageProps> = ({
  isOpen,
  selectedModel,
  onClose,
  onModelSelect,
  models,
  exhaustedModels = []
}) => {
  const { language } = useLanguage();
  const { isPremium, isModelPaid } = usePremium();
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<FilterGroup>('all');
  const [restrictedAlertModel, setRestrictedAlertModel] = useState<SelectedModel | null>(null);
  const [isQuotaUsageOpen, setIsQuotaUsageOpen] = useState(false);

  const getModelGroup = (id: string): 'gemini' | 'antigravity' | 'gemma' => {
    if (id.startsWith('google/gemini')) return 'gemini';
    if (id.startsWith('antigravity')) return 'antigravity';
    return 'gemma';
  };

  const filteredModels = useMemo(() => {
    const q = query.toLowerCase().trim();

    return models.filter((model) => {
      const group = getModelGroup(model.id);
      if (activeGroup !== 'all' && group !== activeGroup) {
        return false;
      }

      if (!q) return true;

      const nameMatch = model.name.toLowerCase().includes(q);
      const descText = modelDescriptions[model.id]?.[language]?.toLowerCase() || '';
      const descMatch = descText.includes(q);

      return nameMatch || descMatch;
    });
  }, [models, activeGroup, query, language]);

  const selectModel = (model: SelectedModel) => {
    onModelSelect(model);
    onClose();
  };

  const handleModelClick = (model: SelectedModel) => {
    const isPaid = isModelPaid(model.id) || isModelPaid(model.name);
    if (isPaid && !isPremium) {
      setRestrictedAlertModel(model);
      return;
    }
    selectModel(model);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            variants={modelPageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[240] flex transform-gpu flex-col overflow-hidden bg-[#202124] text-[#e8eaed] font-sans will-change-transform"
          >
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
            />
            <style>{`
              .google-search-bar-dark {
                background-color: #202124;
                border: 1px solid #5f6368;
                border-radius: 24px;
                height: 46px;
                transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
                            box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
                            border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
              }
              .google-search-bar-dark:hover,
              .google-search-bar-dark:focus-within {
                background-color: #303134;
                border-color: #303134;
                box-shadow: 0 1px 6px 0 #171717;
              }
              .material-symbols-outlined {
                user-select: none;
              }
            `}</style>

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
              <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
                <header className="flex items-center justify-between w-full">
                  <h1 className="text-xl sm:text-2xl font-medium text-[#e8eaed] tracking-tight">
                    Model selection
                  </h1>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuotaUsageOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#303134] text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed] transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">data_usage</span>
                      <span className="hidden sm:inline">Quota and usage</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Close"
                      onClick={onClose}
                      className="flex items-center justify-center w-10 h-10 rounded-full text-[#9aa0a6] hover:bg-[#303134] active:bg-[#3c4043] transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                  </div>
                </header>

                <div className="google-search-bar-dark flex items-center px-4 w-full">
                  <span className="material-symbols-outlined text-[#9aa0a6] text-[20px] mr-3">
                    search
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for models"
                    className="w-full h-full bg-transparent text-[#e8eaed] placeholder-[#9aa0a6] text-[16px] focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-[#9aa0a6] hover:text-[#e8eaed] transition-colors ml-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">clear</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveGroup('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none shrink-0 ${
                      activeGroup === 'all'
                        ? 'bg-[#394457] text-[#8ab4f8]'
                        : 'bg-[#303134] text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed]'
                    }`}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGroup('gemma')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none shrink-0 ${
                      activeGroup === 'gemma'
                        ? 'bg-[#394457] text-[#8ab4f8]'
                        : 'bg-[#303134] text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed]'
                    }`}
                  >
                    <GemmaIcon className="h-4 w-4" />
                    <span>Gemma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGroup('gemini')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none shrink-0 ${
                      activeGroup === 'gemini'
                        ? 'bg-[#394457] text-[#8ab4f8]'
                        : 'bg-[#303134] text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed]'
                    }`}
                  >
                    <GeminiIcon className="h-4 w-4" />
                    <span>Gemini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGroup('antigravity')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none shrink-0 ${
                      activeGroup === 'antigravity'
                        ? 'bg-[#394457] text-[#8ab4f8]'
                        : 'bg-[#303134] text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed]'
                    }`}
                  >
                    <AntigravityIcon className="h-4 w-4" />
                    <span>Antigravity</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  {filteredModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-[#9aa0a6]">
                      <span className="material-symbols-outlined text-[48px] mb-3 text-[#5f6368]">
                        search_off
                      </span>
                      <p className="text-base font-medium text-[#e8eaed]">No models found</p>
                      <p className="text-sm mt-1">Try another search query or category filter</p>
                    </div>
                  ) : (
                    filteredModels.map((model) => {
                      const isSelected = selectedModel.id === model.id;
                      const isExhausted = exhaustedModels.includes(model.id);
                      const isPaid = isModelPaid(model.id) || isModelPaid(model.name);
                      const isRestricted = isPaid && !isPremium;
                      const group = getModelGroup(model.id);

                      return (
                        <button
                          key={model.id}
                          type="button"
                          disabled={isExhausted}
                          onClick={() => handleModelClick(model)}
                          className={`flex items-start gap-4 p-4 rounded-[20px] text-left transition-all border focus:outline-none ${
                            isSelected
                              ? 'border-[#8ab4f8] bg-[#303134]'
                              : 'border-[#3c4043]/60 bg-[#202124] hover:bg-[#303134]/70 hover:border-[#5f6368]'
                          } disabled:opacity-40 disabled:pointer-events-none`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isSelected
                                ? 'bg-[#394457] text-[#8ab4f8]'
                                : 'bg-[#303134] text-[#9aa0a6]'
                            }`}
                          >
                            {group === 'gemini' ? (
                              <GeminiIcon className="h-5 w-5" />
                            ) : group === 'antigravity' ? (
                              <AntigravityIcon className="h-5 w-5" />
                            ) : (
                              <GemmaIcon className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-medium text-[#e8eaed]">
                                {model.name}
                              </span>
                              {isPaid && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isPremium
                                      ? 'bg-[#394457] text-[#8ab4f8]'
                                      : 'bg-[#303134] text-[#9aa0a6] border border-[#5f6368]'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {isPremium ? 'verified' : 'lock'}
                                  </span>
                                  {isPremium ? 'PRO' : 'PREMIUM'}
                                </span>
                              )}
                              {isSelected && (
                                <span className="rounded-full bg-[#394457] px-2 py-0.5 text-[11px] font-medium text-[#8ab4f8]">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[#9aa0a6] leading-relaxed">
                              {modelDescriptions[model.id]?.[language] || ''}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8ab4f8]">
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </div>
                          )}
                          {!isSelected && isRestricted && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9aa0a6]">
                              <span className="material-symbols-outlined text-[16px]">lock</span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {restrictedAlertModel && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    className="w-full max-w-sm rounded-[24px] border border-[#5f6368]/40 bg-[#303134] p-6 shadow-2xl text-center"
                  >
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[#394457] text-[#8ab4f8] flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                    </div>

                    <h3 className="text-lg font-medium text-[#e8eaed]">
                      {restrictedAlertModel.name}
                    </h3>
                    <p className="text-sm text-[#9aa0a6] mt-2 leading-relaxed">
                      This model is exclusively available to <strong>Premium</strong> users. Upgrade to unlock access to all flagship models.
                    </p>

                    <div className="mt-6 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRestrictedAlertModel(null);
                          setIsQuotaUsageOpen(true);
                        }}
                        className="w-full h-10 px-5 rounded-full bg-[#8ab4f8] hover:bg-[#8ab4f8]/90 text-[#202124] text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">data_usage</span>
                        <span>Open Quota and usage</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestrictedAlertModel(null)}
                        className="w-full h-10 px-5 rounded-full text-sm font-medium text-[#9aa0a6] hover:bg-[#3c4043] transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuotaUsageOpen && (
          <QuotaAndUsagePage
            isOpen={isQuotaUsageOpen}
            onClose={() => setIsQuotaUsageOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
