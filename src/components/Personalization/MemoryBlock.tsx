import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase, SUPABASE_ENDPOINT } from '../../config';
import Snackbar from '../Snackbar';
import * as GoogleSpinnerModule from '../GoogleSpinner';

const GoogleSpinner: React.ComponentType<any> =
  (GoogleSpinnerModule as any).default ||
  (GoogleSpinnerModule as any).GoogleSpinner;

interface MemoryBlockProps {
  onManageClick?: () => void;
}

export const MemoryBlock: React.FC<MemoryBlockProps> = ({ onManageClick }) => {
  const { language } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMemorySetting = async () => {
      if (isMounted) setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (isMounted && data) {
          if (typeof data.memory_enabled === 'boolean') {
            setIsEnabled(data.memory_enabled);
          } else if (typeof data.settings?.memory_enabled === 'boolean') {
            setIsEnabled(data.settings.memory_enabled);
          }
        }
      } catch (err) {
        console.error('Failed to load memory setting:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMemorySetting();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving || isLoading) return;

    const nextValue = !isEnabled;
    setIsEnabled(nextValue);
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsEnabled(!nextValue);
        setIsSaving(false);
        return;
      }

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings: {
            memory_enabled: nextValue
          }
        })
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      setSnackbarMessage(
        nextValue
          ? (language === 'ru' ? 'Память включена' : 'Memory enabled')
          : (language === 'ru' ? 'Память отключена' : 'Memory disabled')
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to update memory setting:', err);
      setIsEnabled(!nextValue);
      setSnackbarMessage(
        language === 'ru' ? 'Ошибка при сохранении' : 'Failed to save setting'
      );
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const isRu = language === 'ru';

  return (
    <>
      <div
        onClick={onManageClick}
        className={`w-full p-5 flex items-start justify-between gap-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[24px] transition-all shadow-sm ${
          onManageClick ? 'cursor-pointer hover:bg-[var(--md-sys-color-on-surface-variant)]/5 active:scale-[0.99]' : ''
        }`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <span className="material-symbols-outlined text-[26px] text-[var(--md-sys-color-primary)] mt-1 flex-shrink-0">
            psychology
          </span>
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                {isRu ? 'Память' : 'Memory'}
              </span>
              {onManageClick && isEnabled && !isLoading && (
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                  chevron_right
                </span>
              )}
            </div>
            <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
              {isRu
                ? 'Ассистент сохраняет важные детали, привычки и контекст из диалогов, чтобы отвечать более точно и персонально.'
                : 'The assistant remembers key facts, preferences, and context from chats to deliver more relevant and personal answers.'}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="w-[52px] h-[32px] mt-0.5 flex items-center justify-center flex-shrink-0">
            {GoogleSpinner && <GoogleSpinner size={22} className="w-[22px] h-[22px]" />}
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            disabled={isSaving}
            onClick={handleToggle}
            className={`relative inline-flex items-center justify-start flex-shrink-0 w-[52px] h-[32px] mt-0.5 p-0 rounded-full box-border border-2 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
              isEnabled
                ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]'
                : 'bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline)]'
            }`}
          >
            <span
              className={`pointer-events-none block rounded-full transform transition-all duration-200 ease-in-out ${
                isEnabled
                  ? 'w-[24px] h-[24px] translate-x-[22px] bg-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'w-[16px] h-[16px] translate-x-[6px] bg-[var(--md-sys-color-outline)]'
              }`}
            />
          </button>
        )}
      </div>

      <Snackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        duration={2000}
      />
    </>
  );
};
