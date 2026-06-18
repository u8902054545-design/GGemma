import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase, SUPABASE_ENDPOINT } from '../../config';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';

interface PersonalizationPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
          <md-outlined-text-field
            label={t('personalization.field_label')}
            value={text}
            onInput={(e: any) => setText(e.target.value)}
            className="w-full"
            rows={5}
          />
        </div>

        <md-filled-button onClick={handleSave} className="w-full">
          {saved ? t('personalization.saved') : t('personalization.save')}
        </md-filled-button>
      </main>
    </motion.div>
  );
};
