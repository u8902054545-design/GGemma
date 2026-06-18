import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase, SUPABASE_ENDPOINT } from '../../config';
import Snackbar from '../Snackbar';
import '@material/web/button/filled-button.js';

interface PersonalizationPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadPersonalization = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await response.json();
        if (data?.personalization_text) setText(data.personalization_text);
      } catch (err) {
        console.error('Failed to load personalization:', err);
      }
    };
    loadPersonalization();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(SUPABASE_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: { personalization_text: text } })
      });
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to save personalization:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
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
          {t('personalization.title')}
        </h1>

        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mb-6 leading-relaxed">
          {t('personalization.description')}
        </p>

        <div className="w-full mb-6">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('personalization.field_label')}
            className="w-full min-h-[120px] max-h-[400px] px-4 py-3 rounded-xl border border-[var(--md-sys-color-outline)] bg-transparent text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] text-[16px] leading-relaxed resize-none outline-none focus:border-[var(--md-sys-color-primary)] transition-colors"
            rows={1}
          />
        </div>

        <md-filled-button onClick={handleSave} className="w-full">
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
  );
};
