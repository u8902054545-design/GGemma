import { en } from './translations/en';
import { ru } from './translations/ru';

export type Language = 'en' | 'ru';

export interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

const buildTranslations = (): Translations => {
  const result: Translations = {};
  const keys = Object.keys(en) as Array<keyof typeof en>;
  
  keys.forEach(key => {
    result[key] = {
      en: en[key],
      ru: (ru as any)[key] || en[key]
    };
  });
  
  return result;
};

export const translations = buildTranslations();
