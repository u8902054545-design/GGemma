import React, { useState } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import { usePremium, QuotaItem } from '../../hooks/usePremium';
import '@material/web/progress/circular-progress.js';

interface QuotaAndUsagePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuotaAndUsagePage: React.FC<QuotaAndUsagePageProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { isPremium, quotas, loading, error, refresh } = usePremium();
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'free'>('all');
  const [selectedChartModel, setSelectedChartModel] = useState<QuotaItem | null>(null);

  if (!isOpen) return null;

  const isPaidItem = (item: QuotaItem) => {
    const val = item.is_paid ?? item.paid ?? item.is_premium;
    if (val === false || String(val).toLowerCase() === 'false' || val === 0) {
      return false;
    }
    if (val === true || String(val).toLowerCase() === 'true' || val === 1) {
      return true;
    }
    const tier = (item.tier || '').toLowerCase();
    if (tier === 'free') return false;
    if (tier === 'paid' || tier === 'premium') return true;

    const name = (item.model_name || '').toLowerCase();
    const id = (item.model_id || '').toLowerCase();
    return name.includes('gemini 3.1 pro preview') || id.includes('gemini-3.1-pro-preview') ||
      name.includes('gemini 4 argon') || id.includes('gemini-4-argon');
  };

  const paidQuotas = quotas.filter(isPaidItem);
  const freeQuotas = quotas.filter(item => !isPaidItem(item));
  const paidModelsCount = paidQuotas.length;
  const freeModelsCount = freeQuotas.length;
  const accessibleModelsCount = isPremium ? quotas.length : freeModelsCount;

  const maxLimit = Math.max(...quotas.map(q => Number(q.daily_limit || 50)), 100);

  const total = quotas.length || 1;
  const paidPercent = Math.round((paidModelsCount / total) * 100);
  const freePercent = 100 - paidPercent;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const freeStrokeDash = (freePercent / 100) * circumference;
  const paidStrokeDash = (paidPercent / 100) * circumference;

  const renderQuotaCard = (item: QuotaItem) => {
    const isPaid = isPaidItem(item);
    const isAccessible = !isPaid || isPremium;
    const limit = item.daily_limit || 50;

    return (
      <div
        key={item.id || item.model_name}
        className={`rounded-[24px] border p-5 transition-all duration-200 flex flex-col justify-between ${
          isAccessible
            ? 'border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-sm'
            : 'border-[var(--md-sys-color-error)]/20 bg-[var(--md-sys-color-surface-container-low)]/70 opacity-90'
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isPaid
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                  : 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
              }`}>
                <span className="material-symbols-outlined text-[22px]">
                  {isPaid ? 'workspace_premium' : 'smart_toy'}
                </span>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                  {item.model_name}
                </h4>
                {item.model_id && (
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]/70 truncate font-mono">
                    {item.model_id}
                  </p>
                )}
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 ${
              isPaid
                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                : 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
            }`}>
              {isPaid ? 'Flagship' : 'Free'}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]/80 mt-3 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[16px]">speed</span>
            <span>Daily limit:</span>
            <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
              {limit} requests
            </span>
          </div>

          <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
            isAccessible
              ? 'text-[var(--md-sys-color-primary)]'
              : 'text-[var(--md-sys-color-error)]'
          }`}>
            <span className="material-symbols-outlined text-[15px]">
              {isAccessible ? 'check_circle' : 'lock'}
            </span>
            {isAccessible ? 'Available' : 'Upgrade Required'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100000 }}
      className="fixed inset-0 bg-[var(--md-sys-color-background)] flex flex-col font-sans overflow-hidden text-[var(--md-sys-color-on-background)]"
    >
      {/* 1. Top App Bar (Google Material Design 3) with Data Usage icon */}
      <header className="w-full h-16 px-4 border-b border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface)]/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-on-surface-variant)]/10 text-[var(--md-sys-color-on-surface)] transition-colors active:scale-95"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)]/60 flex items-center justify-center text-[var(--md-sys-color-primary)] shrink-0">
              <span className="material-symbols-outlined text-[20px]">data_usage</span>
            </div>
            <div>
              <h1 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] leading-tight">
                Quota and usage
              </h1>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xl truncate hidden sm:block">
                Everything about your resources: view available models, monitor your current and weekly request usage, and select the right pricing plan.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-xs font-medium text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh resource usage and quotas"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar">
        {/* Mobile Subtitle Display */}
        <div className="block sm:hidden -mt-2">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            Everything about your resources: view available models, monitor your current and weekly request usage, and select the right pricing plan.
          </p>
        </div>

        {loading && quotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <md-circular-progress indeterminate />
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] animate-pulse">
              Loading resource and quota details...
            </p>
          </div>
        ) : error && quotas.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)]/20 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-error)] mb-2">
              error
            </span>
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              Error loading quota data
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-4">
              {error}
            </p>
            <button
              type="button"
              onClick={() => refresh()}
              className="h-10 px-6 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-xs font-medium shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* 2. M3 Hero Info Block with Upgrade Callout */}
            <div className="relative overflow-hidden rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/20 bg-gradient-to-br from-[var(--md-sys-color-surface-container)] via-[var(--md-sys-color-primary-container)]/15 to-[var(--md-sys-color-surface-container-high)] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-highest)]/80 text-[var(--md-sys-color-primary)] text-xs font-semibold tracking-wide uppercase border border-[var(--md-sys-color-outline-variant)]/30">
                    <span className="material-symbols-outlined text-[16px]">stars</span>
                    <span>Flagship Models</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--md-sys-color-on-surface)] tracking-tight">
                    Get access to flagship models
                  </h2>

                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                    Supercharge your capabilities with unrestricted access to Gemini 3.1 Pro Preview and Gemini 4 Argon, featuring higher daily limits and prioritized processing.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Placeholder per user specification: "пока не куда не ведёт"
                      }}
                      className="h-11 px-6 rounded-full bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/90 text-[var(--md-sys-color-on-primary)] text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Start the upgrade</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--md-sys-color-surface-container-highest)]/70 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/20">
                      <span className={`w-2 h-2 rounded-full ${isPremium ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'}`} />
                      <span>{isPremium ? 'Premium Active' : 'Free Tier'}</span>
                    </div>
                  </div>
                </div>

                {/* Flagship Models Feature Card */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface)]/80 border border-[var(--md-sys-color-outline-variant)]/20 flex items-center justify-between gap-5 min-w-[270px]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                        auto_awesome
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">Gemini 3.1 Pro Preview</span>
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Deep Reasoning & Logic</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isPremium
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                        : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/30'
                    }`}>
                      {isPremium ? 'Available' : 'Flagship'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface)]/80 border border-[var(--md-sys-color-outline-variant)]/20 flex items-center justify-between gap-5 min-w-[270px]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                        bolt
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">Gemini 4 Argon</span>
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Next-Gen Architecture</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isPremium
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                        : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/30'
                    }`}>
                      {isPremium ? 'Available' : 'Flagship'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Visual Charts Section (Material 3) */}
            {quotas.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Daily Request Allowance Bar Chart */}
                <div className="lg:col-span-2 rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-5 sm:p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                        Daily Request Allowance
                      </h3>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        Daily requests allowed per model
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-[var(--md-sys-color-primary)]" />
                        <span className="text-[var(--md-sys-color-on-surface-variant)]">Flagship</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-[var(--md-sys-color-tertiary)]" />
                        <span className="text-[var(--md-sys-color-on-surface-variant)]">Free</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="w-full flex-1 min-h-[220px] flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto border-b border-[var(--md-sys-color-outline-variant)]/20">
                    {quotas.map((item) => {
                      const limit = Number(item.daily_limit || 50);
                      const heightPercent = Math.max(12, Math.round((limit / maxLimit) * 100));
                      const isPaid = isPaidItem(item);
                      const isSelected = selectedChartModel?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedChartModel(item)}
                          className="flex-1 min-w-[38px] max-w-[64px] flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <span className={`text-[10px] font-mono font-medium transition-all ${
                            isSelected
                              ? 'text-[var(--md-sys-color-primary)] font-bold scale-110'
                              : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'
                          }`}>
                            {limit}
                          </span>

                          <div className="w-full h-36 bg-[var(--md-sys-color-surface-container-highest)]/40 rounded-t-xl relative flex items-end overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                              className={`w-full rounded-t-xl transition-all duration-200 group-hover:brightness-110 ${
                                isPaid
                                  ? 'bg-[var(--md-sys-color-primary)]'
                                  : 'bg-[var(--md-sys-color-tertiary)]'
                              } ${isSelected ? 'ring-2 ring-[var(--md-sys-color-on-surface)]' : ''}`}
                            />
                          </div>

                          <span
                            title={item.model_name}
                            className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] truncate w-full text-center group-hover:text-[var(--md-sys-color-on-surface)]"
                          >
                            {(item.model_name || '').replace('google/', '').split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedChartModel && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                          {selectedChartModel.model_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaidItem(selectedChartModel)
                            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                            : 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
                        }`}>
                          {isPaidItem(selectedChartModel) ? 'Flagship' : 'Free'}
                        </span>
                      </div>
                      <div className="text-[var(--md-sys-color-on-surface-variant)]">
                        Daily limit: <strong className="text-[var(--md-sys-color-on-surface)]">{selectedChartModel.daily_limit || 50}</strong> requests
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Chart 2: Donut Distribution Chart */}
                <div className="rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                      Model Tier Distribution
                    </h3>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      Ratio of Free vs Flagship models
                    </p>
                  </div>

                  {/* SVG Donut */}
                  <div className="flex items-center justify-center my-4 relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="var(--md-sys-color-surface-container-highest)"
                        strokeWidth="16"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="var(--md-sys-color-tertiary)"
                        strokeWidth="16"
                        strokeDasharray={`${freeStrokeDash} ${circumference}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="var(--md-sys-color-primary)"
                        strokeWidth="16"
                        strokeDasharray={`${paidStrokeDash} ${circumference}`}
                        strokeDashoffset={`-${freeStrokeDash}`}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                        {accessibleModelsCount}/{quotas.length}
                      </span>
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
                        {isPremium ? 'All unlocked' : 'Accessible'}
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-tertiary)]" />
                        <span className="text-[var(--md-sys-color-on-surface)]">Free Tier</span>
                      </div>
                      <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {freeModelsCount} ({freePercent}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)]" />
                        <span className="text-[var(--md-sys-color-on-surface)]">Flagship Tier</span>
                      </div>
                      <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {paidModelsCount} ({paidPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Available Models & Quotas Section (Separate Free and Paid Lists) */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                    Available Models & Quotas
                  </h3>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Explore available models and their daily request capacities
                  </p>
                </div>

                {/* Filter Chips (Material 3 Filter Chips) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`h-8 px-4 rounded-full text-xs font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                        : 'border border-[var(--md-sys-color-outline-variant)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]/40'
                    }`}
                  >
                    All ({quotas.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('free')}
                    className={`h-8 px-4 rounded-full text-xs font-medium transition-all ${
                      activeTab === 'free'
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                        : 'border border-[var(--md-sys-color-outline-variant)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]/40'
                    }`}
                  >
                    Free ({freeModelsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paid')}
                    className={`h-8 px-4 rounded-full text-xs font-medium transition-all ${
                      activeTab === 'paid'
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                        : 'border border-[var(--md-sys-color-outline-variant)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]/40'
                    }`}
                  >
                    Flagship ({paidModelsCount})
                  </button>
                </div>
              </div>

              {quotas.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[var(--md-sys-color-outline-variant)]/30 p-8 text-center bg-[var(--md-sys-color-surface-container-low)]">
                  <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-on-surface-variant)]/50 mb-2">
                    table_rows
                  </span>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    No model configurations available at this moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Flagship Models (Paid) List */}
                  {(activeTab === 'all' || activeTab === 'paid') && paidQuotas.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                          workspace_premium
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                          Flagship Models (Paid)
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold">
                          {paidQuotas.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {paidQuotas.map(renderQuotaCard)}
                      </div>
                    </div>
                  )}

                  {activeTab === 'paid' && paidQuotas.length === 0 && (
                    <div className="rounded-[28px] border border-dashed border-[var(--md-sys-color-outline-variant)]/30 p-8 text-center bg-[var(--md-sys-color-surface-container-low)]">
                      <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-on-surface-variant)]/50 mb-2">
                        workspace_premium
                      </span>
                      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                        No paid/flagship models currently configured.
                      </p>
                    </div>
                  )}

                  {/* Free Models List */}
                  {(activeTab === 'all' || activeTab === 'free') && freeQuotas.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-tertiary)]">
                          check_circle
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                          Free Models
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] font-semibold">
                          {freeQuotas.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {freeQuotas.map(renderQuotaCard)}
                      </div>
                    </div>
                  )}

                  {activeTab === 'free' && freeQuotas.length === 0 && (
                    <div className="rounded-[28px] border border-dashed border-[var(--md-sys-color-outline-variant)]/30 p-8 text-center bg-[var(--md-sys-color-surface-container-low)]">
                      <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-on-surface-variant)]/50 mb-2">
                        smart_toy
                      </span>
                      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                        No free models currently configured.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </motion.div>
  );
};
