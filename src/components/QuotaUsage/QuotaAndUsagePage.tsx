import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    const tier = (item.tier || '').toLowerCase();
    const name = (item.model_name || '').toLowerCase();
    const id = (item.model_id || '').toLowerCase();
    return val === true || String(val).toLowerCase() === 'true' || tier === 'paid' || tier === 'premium' ||
      name.includes('gemini 3.1 pro preview') || id.includes('gemini-3.1-pro-preview') ||
      name.includes('gemini 4 argon') || id.includes('gemini-4-argon');
  };

  const paidModelsCount = quotas.filter(isPaidItem).length;
  const freeModelsCount = quotas.length - paidModelsCount;
  const accessibleModelsCount = isPremium ? quotas.length : freeModelsCount;

  const displayQuotas = quotas.filter(item => {
    if (activeTab === 'paid') return isPaidItem(item);
    if (activeTab === 'free') return !isPaidItem(item);
    return true;
  });

  const maxLimit = Math.max(...quotas.map(q => Number(q.daily_limit || 50)), 100);

  const total = quotas.length || 1;
  const paidPercent = Math.round((paidModelsCount / total) * 100);
  const freePercent = 100 - paidPercent;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const freeStrokeDash = (freePercent / 100) * circumference;
  const paidStrokeDash = (paidPercent / 100) * circumference;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100000 }}
      className="fixed inset-0 bg-[var(--md-sys-color-background)] flex flex-col font-sans overflow-hidden text-[var(--md-sys-color-on-background)]"
    >
      {/* Top App Bar (Google Material Design 3) */}
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
          <div>
            <h1 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] leading-tight">
              {t('quota.title')}
            </h1>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              {t('quota.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-xs font-medium text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="hidden sm:inline">{t('quota.refresh')}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar">
        {loading && quotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <md-circular-progress indeterminate />
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] animate-pulse">
              {t('quota.loading')}
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)]/20 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-error)] mb-2">
              error
            </span>
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              {t('quota.error')}
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
            {/* 1. M3 Hero Status Card (loaded strictly from Premium_User table) */}
            <div className={`relative overflow-hidden rounded-[28px] border p-6 transition-all ${
              isPremium
                ? 'border-[var(--md-sys-color-primary)]/30 bg-gradient-to-br from-[var(--md-sys-color-surface-container)] via-[var(--md-sys-color-primary-container)]/15 to-[var(--md-sys-color-surface-container)]'
                : 'border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)]'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPremium
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">
                      {isPremium ? 'workspace_premium' : 'lock_open'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                        {t('quota.premium_status')}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        isPremium
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'}`} />
                        {isPremium ? t('quota.premium_active') : t('quota.premium_inactive')}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold text-[var(--md-sys-color-on-surface)] mt-1">
                      {isPremium ? 'Premium Tier' : 'Standard Tier'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed max-w-xl">
                      {isPremium ? t('quota.premium_desc_active') : t('quota.premium_desc_inactive')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--md-sys-color-outline-variant)]/20 w-full sm:w-auto">
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]/70 uppercase tracking-wider">
                    Source: Table «Premium_User»
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container-highest)] px-3 py-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)]/20">
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">is_premium:</span>
                    <span className={`font-semibold ${isPremium ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                      {isPremium ? 'True' : 'False'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status breakdown for specifically restricted models */}
              <div className="mt-5 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                      auto_awesome
                    </span>
                    <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                      Gemini 3.1 Pro Preview
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                    isPremium
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'bg-[var(--md-sys-color-error-container)]/30 text-[var(--md-sys-color-error)]'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {isPremium ? 'check_circle' : 'lock'}
                    </span>
                    {isPremium ? t('quota.access_granted') : t('quota.access_restricted')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                      stars
                    </span>
                    <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                      Gemini 4 Argon
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                    isPremium
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'bg-[var(--md-sys-color-error-container)]/30 text-[var(--md-sys-color-error)]'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {isPremium ? 'check_circle' : 'lock'}
                    </span>
                    {isPremium ? t('quota.access_granted') : t('quota.access_restricted')}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Overview Metric Cards loaded from Quotas and Premium_User */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-[24px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-4.5">
                <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  <span className="text-xs font-medium">{t('quota.total_models')}</span>
                  <span className="material-symbols-outlined text-[20px]">dataset</span>
                </div>
                <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                  {quotas.length}
                </div>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]/70 mt-1 block">
                  Table «Quotas»
                </span>
              </div>

              <div className="rounded-[24px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-4.5">
                <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  <span className="text-xs font-medium">{t('quota.free_models')}</span>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-tertiary)]">check_circle</span>
                </div>
                <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                  {freeModelsCount}
                </div>
                <span className="text-[11px] text-[var(--md-sys-color-tertiary)] mt-1 block font-medium">
                  {freePercent}% of all models
                </span>
              </div>

              <div className="rounded-[24px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-4.5">
                <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  <span className="text-xs font-medium">{t('quota.paid_models')}</span>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">workspace_premium</span>
                </div>
                <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                  {paidModelsCount}
                </div>
                <span className="text-[11px] text-[var(--md-sys-color-primary)] mt-1 block font-medium">
                  {paidPercent}% of all models
                </span>
              </div>

              <div className="rounded-[24px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-4.5">
                <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  <span className="text-xs font-medium">{t('quota.access_granted')}</span>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">lock_open</span>
                </div>
                <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                  {accessibleModelsCount} <span className="text-sm font-normal text-[var(--md-sys-color-on-surface-variant)]">/ {quotas.length}</span>
                </div>
                <span className="text-[11px] text-[var(--md-sys-color-primary)] mt-1 block font-medium">
                  {isPremium ? '100% Unlocked' : `${Math.round((accessibleModelsCount / total) * 100)}% Available`}
                </span>
              </div>
            </div>

            {/* 3. Visual Charts Section (Material 3) */}
            {quotas.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Daily Limit Bar Chart (Takes 2 cols on lg) */}
                <div className="lg:col-span-2 rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-5 sm:p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                        {t('quota.daily_limits_chart')}
                      </h3>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        Daily requests allowed per model in «Quotas»
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-[var(--md-sys-color-primary)]" />
                        <span className="text-[var(--md-sys-color-on-surface-variant)]">{t('quota.tier_paid')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-[var(--md-sys-color-tertiary)]" />
                        <span className="text-[var(--md-sys-color-on-surface-variant)]">{t('quota.tier_free')}</span>
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
                          {/* Limit Badge */}
                          <span className={`text-[10px] font-mono font-medium transition-all ${
                            isSelected
                              ? 'text-[var(--md-sys-color-primary)] font-bold scale-110'
                              : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'
                          }`}>
                            {limit}
                          </span>

                          {/* Bar Container */}
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

                          {/* Model Name Label */}
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
                          {isPaidItem(selectedChartModel) ? 'Paid' : 'Free'}
                        </span>
                      </div>
                      <div className="text-[var(--md-sys-color-on-surface-variant)]">
                        Daily limit: <strong className="text-[var(--md-sys-color-on-surface)]">{selectedChartModel.daily_limit || 50}</strong> requests
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Chart 2: Donut Distribution Chart (Takes 1 col on lg) */}
                <div className="rounded-[28px] border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)] p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                      {t('quota.distribution_chart')}
                    </h3>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      Ratio of Free vs Paid models in table
                    </p>
                  </div>

                  {/* SVG Donut */}
                  <div className="flex items-center justify-center my-4 relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                      {/* Background circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="var(--md-sys-color-surface-container-highest)"
                        strokeWidth="16"
                      />
                      {/* Free models segment */}
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
                      {/* Paid models segment */}
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

                    {/* Donut Center Display */}
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
                        <span className="text-[var(--md-sys-color-on-surface)]">{t('quota.tier_free')}</span>
                      </div>
                      <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {freeModelsCount} ({freePercent}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)]" />
                        <span className="text-[var(--md-sys-color-on-surface)]">{t('quota.tier_paid')}</span>
                      </div>
                      <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {paidModelsCount} ({paidPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Model Quota Cards List (loaded strictly from Quotas) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                    {t('quota.model_cards')}
                  </h3>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Models loaded directly from «Quotas» table and access calculated via «Premium_User»
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
                    Paid ({paidModelsCount})
                  </button>
                </div>
              </div>

              {displayQuotas.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[var(--md-sys-color-outline-variant)]/30 p-8 text-center bg-[var(--md-sys-color-surface-container-low)]">
                  <span className="material-symbols-outlined text-4xl text-[var(--md-sys-color-on-surface-variant)]/50 mb-2">
                    table_rows
                  </span>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    {t('quota.empty_quotas')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {displayQuotas.map((item) => {
                    const isPaid = isPaidItem(item);
                    const isAccessible = !isPaid || isPremium;
                    const limit = item.daily_limit || 50;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-[24px] border p-5 transition-all duration-200 flex flex-col justify-between ${
                          isAccessible
                            ? 'border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)]/40'
                            : 'border-[var(--md-sys-color-error)]/20 bg-[var(--md-sys-color-surface-container-low)]/70 opacity-90'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
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

                          {/* Tier Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 ${
                            isPaid
                              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                              : 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
                          }`}>
                            {isPaid ? t('quota.tier_paid') : t('quota.tier_free')}
                          </span>
                        </div>

                        {/* Limit and Access Row */}
                        <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/15 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface-variant)]">
                            <span className="material-symbols-outlined text-[16px]">speed</span>
                            <span>{t('quota.limit_per_day')}:</span>
                            <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                              {limit} {t('quota.requests')}
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
                            {isAccessible ? t('quota.access_granted') : t('quota.access_restricted')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </motion.div>
  );
};
