import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { googleRailHubVariants } from '../../motion/googleRailTransitions';
import { useLanguage } from '../../hooks/useLanguage';
import { ProfileDrawer } from '../UserProfile';
import { QuotaAndUsagePage } from '../QuotaUsage/QuotaAndUsagePage';
import { PersonalizationPage } from '../Personalization/personalizationPage';
import { SharesPage } from '../../sharing/SharesPage';
import { ThemeSelection } from './themeSelection';
import { VoiceSelection } from './voiceSelection';
import { LanguageSelection } from './languageSelection';
import { ChatHistorySelection } from './chatHistorySelection';

interface SettingsHubPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsHubPage: React.FC<SettingsHubPageProps> = ({ isOpen, onClose }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isQuotaUsageOpen, setIsQuotaUsageOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isSharesOpen, setIsSharesOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isSubpageOpen =
    isQuotaUsageOpen ||
    isPersonalizationOpen ||
    isSharesOpen ||
    isThemeOpen ||
    isVoiceOpen ||
    isLanguageOpen ||
    isChatHistoryOpen;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100000 }}
      className="fixed inset-0 bg-[var(--md-sys-color-background,#000000)] text-[var(--md-sys-color-on-surface,#E6E0E9)] flex flex-col font-sans select-none overflow-hidden"
    >
      <motion.div
        variants={googleRailHubVariants}
        animate={isSubpageOpen ? 'pushed' : 'active'}
        initial={false}
        className="flex flex-col flex-1 w-full h-full overflow-hidden"
      >
        <header className="w-full">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-2 pt-1.5 pb-1.5 min-h-[52px]">
            <div className="flex w-12 items-center justify-start">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--md-sys-color-on-surface,#E6E0E9)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            </div>

            <h1 className="text-[22px] font-normal leading-7 tracking-normal text-[var(--md-sys-color-on-surface,#E6E0E9)] text-center truncate">
              Settings
            </h1>

            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl w-full px-4 pt-2 pb-8 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <section aria-label="Account and Quota">
              <div className="flex flex-col gap-[3px] rounded-[28px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-1.5 border border-[var(--md-sys-color-outline-variant,#49454F)]/30">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[22px] rounded-b-[8px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">person</span>
                    </div>
                    <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                      Account settings
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuotaUsageOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[8px] rounded-b-[22px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">data_usage</span>
                    </div>
                    <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                      {t('quota.title') || 'Quota and usage'}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>
              </div>
            </section>

            <section aria-label="Personalization and Preferences">
              <div className="flex flex-col gap-[3px] rounded-[28px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-1.5 border border-[var(--md-sys-color-outline-variant,#49454F)]/30">
                <button
                  type="button"
                  onClick={() => setIsPersonalizationOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[22px] rounded-b-[8px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">person_edit</span>
                    </div>
                    <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                      {t('personalization.title') || 'Personalization'}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsThemeOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[8px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">palette</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                        {t('settings.theme.title') || 'Application Theme'}
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                        {t('settings.theme.desc') || 'Change the appearance of the app'}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[8px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">voice_selection</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                        {t('settings.voice.title') || 'Voice and dubbing'}
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                        {t('settings.voice.desc') || 'Voice selection for voicing'}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLanguageOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[8px] rounded-b-[22px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">language</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                        {t('settings.language.title') || 'Application Language'}
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                        {t('settings.language.desc') || 'Choose your preferred language'}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>
              </div>
            </section>

            <section aria-label="Public Links and Chat History">
              <div className="flex flex-col gap-[3px] rounded-[28px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-1.5 border border-[var(--md-sys-color-outline-variant,#49454F)]/30">
                <button
                  type="button"
                  onClick={() => setIsSharesOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[22px] rounded-b-[8px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">link</span>
                    </div>
                    <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                      {t('shared.profile_title') || 'Public links'}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatHistoryOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-t-[8px] rounded-b-[22px] bg-[var(--md-sys-color-surface-container,#1D1B20)] hover:bg-[var(--md-sys-color-surface-container-high,#2B2930)] active:scale-[0.99] transition-all px-4 py-4 text-left text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                      <span className="material-symbols-outlined text-[22px]">history</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px]">
                        {t('settings.chatHistory.saving') || 'Saving chats'}
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                        {t('settings.chatHistory.menuDesc') || 'Manage chat history settings'}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                    chevron_right
                  </span>
                </button>
              </div>
            </section>
          </div>
        </main>
      </motion.div>

      <AnimatePresence>
        {isAccountOpen && (
          <ProfileDrawer
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
          />
        )}
        {isQuotaUsageOpen && (
          <QuotaAndUsagePage
            isOpen={isQuotaUsageOpen}
            onClose={() => setIsQuotaUsageOpen(false)}
          />
        )}
        {isPersonalizationOpen && (
          <PersonalizationPage
            isOpen={isPersonalizationOpen}
            onClose={() => setIsPersonalizationOpen(false)}
          />
        )}
        {isSharesOpen && (
          <SharesPage
            isOpen={isSharesOpen}
            onClose={() => setIsSharesOpen(false)}
          />
        )}
        {isThemeOpen && (
          <ThemeSelection
            isOpen={isThemeOpen}
            onClose={() => setIsThemeOpen(false)}
          />
        )}
        {isVoiceOpen && (
          <VoiceSelection
            isOpen={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
          />
        )}
        {isLanguageOpen && (
          <LanguageSelection
            isOpen={isLanguageOpen}
            onClose={() => setIsLanguageOpen(false)}
          />
        )}
        {isChatHistoryOpen && (
          <ChatHistorySelection
            isOpen={isChatHistoryOpen}
            onClose={() => setIsChatHistoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
