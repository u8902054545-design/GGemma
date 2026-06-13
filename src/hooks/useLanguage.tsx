import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, SUPABASE_ENDPOINT } from '../config';
import { useAuth } from './useAuth';
import { Language, translations } from './useTranslations';

export type { Language };
export { translations };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ru' || saved === 'en') return saved;
    const systemLang = navigator.language.split('-')[0];
    return systemLang === 'ru' ? 'ru' : 'en';
  });

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            settings: { selected_language: lang }
          }),
        });
      } catch (err) {
        console.error('Failed to sync language:', err);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
