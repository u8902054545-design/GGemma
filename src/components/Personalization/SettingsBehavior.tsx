import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase, SUPABASE_ENDPOINT } from '../../config';
import Snackbar from '../Snackbar';
import { CommStyleBottomSheet, COMMUNICATION_STYLES } from './CommStyleBottomSheet';
import { AssistRoleBottomSheet, ASSISTANT_ROLES } from './AssistRoleBottomSheet';
import '@material/web/button/filled-button.js';

interface SettingsBehaviorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsBehavior: React.FC<SettingsBehaviorProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [commStyle, setCommStyle] = useState('');
  const [assistConfig, setAssistConfig] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isRoleBottomSheetOpen, setIsRoleBottomSheetOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBehaviorSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await response.json();
        if (data) {
          setCommStyle(data.communication_style || '');
          if (data.assistant_config) setAssistConfig(data.assistant_config);
        }
      } catch (err) {
        console.error('Failed to load behavior settings:', err);
      }
    };
    loadBehaviorSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(SUPABASE_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          settings: { 
            communication_style: commStyle || null,
            assistant_config: assistConfig
          } 
        })
      });
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to save behavior settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStyleItem = COMMUNICATION_STYLES.find(
    s => s.id === commStyle.toLowerCase()
  );

  const selectedRoleItem = ASSISTANT_ROLES.find(
    r => r.id === assistConfig.toLowerCase()
  );

  const customRoleItem = assistConfig ? {
    id: assistConfig,
    titleRu: 'Персональная роль',
    titleEn: 'Custom Role',
    descRu: assistConfig,
    descEn: assistConfig
  } : undefined;

  const currentRole = selectedRoleItem || customRoleItem;

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ zIndex: 100002 }}
        className="fixed inset-0 bg-[var(--md-sys-color-background)] flex flex-col font-sans overflow-hidden"
      >
        <header className="w-full p-4 flex items-center justify-start">
          <button
            onClick={onClose}
            className="p-3 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-start justify-start px-6 pb-8 overflow-y-auto w-full max-w-[600px] mx-auto">
          <h1 className="text-[32px] font-normal text-[var(--md-sys-color-on-surface)] mt-2 mb-4 tracking-tight align-left w-full">
            {t('personalization.behavior.title')}
          </h1>

          {/* Communication Style Selector */}
          <div className="w-full mb-6">
            <label className="block text-[16px] font-medium text-[var(--md-sys-color-on-surface)] mb-1">
              {t('personalization.behavior.comm_style.title')}
            </label>
            <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mb-3 leading-relaxed">
              {t('personalization.behavior.comm_style.desc')}
            </p>
            
            <button
              onClick={() => setIsBottomSheetOpen(true)}
              className="w-full py-4 px-4 flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20 rounded-2xl transition-all text-left active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[16px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    {selectedStyleItem 
                      ? (language === 'ru' ? selectedStyleItem.titleRu : selectedStyleItem.titleEn)
                      : (language === 'ru' ? 'Не используется' : 'Not used')}
                  </span>
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1">
                    {selectedStyleItem 
                      ? (language === 'ru' ? selectedStyleItem.descRu : selectedStyleItem.descEn)
                      : (language === 'ru' ? 'Стиль общения с ассистентом' : 'Assistant communication tone')}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0">
                arrow_drop_down
              </span>
            </button>
          </div>

          {/* Assistant Configuration (Role Selector) */}
          <div className="w-full mb-8">
            <label className="block text-[16px] font-medium text-[var(--md-sys-color-on-surface)] mb-1">
              {t('personalization.behavior.assist_config.title')}
            </label>
            <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mb-3 leading-relaxed">
              {t('personalization.behavior.assist_config.desc')}
            </p>
            
            <button
              onClick={() => setIsRoleBottomSheetOpen(true)}
              className="w-full py-4 px-4 flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20 rounded-2xl transition-all text-left active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[16px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    {currentRole 
                      ? (language === 'ru' ? currentRole.titleRu : currentRole.titleEn)
                      : (language === 'ru' ? 'Не используется' : 'Not used')}
                  </span>
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1">
                    {currentRole 
                      ? (language === 'ru' ? currentRole.descRu : currentRole.descEn)
                      : (language === 'ru' ? 'Роль ассистента' : 'Assistant role')}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0">
                arrow_drop_down
              </span>
            </button>
          </div>

          <md-filled-button onClick={handleSave} disabled={isLoading} className="w-full">
            {t('personalization.save')}
          </md-filled-button>
        </main>

        <Snackbar
          message={t('personalization.saved')}
          isOpen={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          duration={2000}
        />
      </motion.div>

      <CommStyleBottomSheet
        isOpen={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        selectedStyle={commStyle}
        onStyleSelect={setCommStyle}
      />

      <AssistRoleBottomSheet
        isOpen={isRoleBottomSheetOpen}
        onOpenChange={setIsRoleBottomSheetOpen}
        selectedRole={assistConfig}
        onRoleSelect={setAssistConfig}
      />
    </>
  );
};
