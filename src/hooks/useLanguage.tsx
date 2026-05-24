import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

export const translations: Translations = {
  'settings.title': {
    en: 'Application Settings',
    ru: 'Настройки приложения',
  },
  'settings.voice.title': {
    en: 'Voice and dubbing',
    ru: 'Голос и озвучка',
  },
  'settings.voice.desc': {
    en: 'Voice selection for voicing',
    ru: 'Выбор голоса для озвучки',
  },
  'settings.language.title': {
    en: 'Application Language',
    ru: 'Язык приложения',
  },
  'settings.language.desc': {
    en: 'Choose your preferred language',
    ru: 'Выберите предпочтительный язык',
  },
  'settings.language.selection.title': {
    en: 'Language',
    ru: 'Язык',
  },
  'settings.voice.selection.title': {
    en: 'Choose a voice',
    ru: 'Выберите голос',
  },
  'settings.voice.preview': {
    en: 'Hello! I am one of the Gemini voices. How do I sound to you?',
    ru: 'Привет! Я один из голосов Gemini. Как я вам?',
  },
  'common.en': {
    en: 'English',
    ru: 'Английский',
  },
  'common.ru': {
    en: 'Russian',
    ru: 'Русский',
  },
  'common.back': {
    en: 'Back',
    ru: 'Назад',
  },
  'chat.new': {
    en: 'New chat',
    ru: 'Новый чат',
  },
  'chat.temporary': {
    en: 'Temporary Chat',
    ru: 'Временный чат',
  },
  'chat.search': {
    en: 'Search for chats',
    ru: 'Поиск чатов',
  },
  'chat.input.placeholder': {
    en: 'Type a message...',
    ru: 'Введите сообщение...',
  },
  'chat.input.placeholder.gemma': {
    en: 'Ask Gemma',
    ru: 'Спросите Gemma',
  },
  'chat.search.button': {
    en: 'Search',
    ru: 'Поиск',
  },
  'chat.temporary.desc': {
    en: "Temporary chats aren't saved to your history, and won't be used to train our models. They are deleted as soon as you close them.",
    ru: 'Временные чаты не сохраняются в истории и не используются для обучения моделей. Они удаляются сразу после закрытия.',
  },
  'sidebar.chats': {
    en: 'Chats',
    ru: 'Чаты',
  },
  'login.title': {
    en: 'Gemma Deno Dev',
    ru: 'Gemma Deno Dev',
  },
  'login.subtitle': {
    en: 'Open Access Workspace',
    ru: 'Рабочее пространство открытого доступа',
  },
  'login.button': {
    en: 'Sign in with Google',
    ru: 'Войти через Google',
  },
  'login.error': {
    en: 'Login error',
    ru: 'Ошибка входа',
  },
  'chat.search.placeholder': {
    en: 'Search chats and messages...',
    ru: 'Поиск чатов и сообщений...',
  },
  'chat.search.nothing': {
    en: 'Nothing found',
    ru: 'Ничего не найдено',
  },
  'profile.signout': {
    en: 'Sign out',
    ru: 'Выйти',
  },
  'profile.settings': {
    en: 'Settings',
    ru: 'Настройки',
  },
  'profile.google_account': {
    en: 'Google Account',
    ru: 'Аккаунт Google',
  },
  'profile.version': {
    en: 'Version',
    ru: 'Версия',
  },
  'menu.pin': {
    en: 'Pin chat',
    ru: 'Закрепить чат',
  },
  'menu.unpin': {
    en: 'Unpin chat',
    ru: 'Открепить чат',
  },
  'menu.rename': {
    en: 'Rename chat',
    ru: 'Переименовать чат',
  },
  'menu.delete': {
    en: 'Delete chat',
    ru: 'Удалить чат',
  },
  'dialog.rename.title': {
    en: 'Rename chat',
    ru: 'Переименовать чат',
  },
  'dialog.rename.input': {
    en: 'Chat Name',
    ru: 'Название чата',
  },
  'dialog.rename.save': {
    en: 'Save',
    ru: 'Сохранить',
  },
  'dialog.delete.title': {
    en: 'Delete chat?',
    ru: 'Удалить чат?',
  },
  'dialog.delete.desc': {
    en: 'You will no longer be able to send messages in this chat. The chat will also be deleted from your history.',
    ru: 'Вы больше не сможете отправлять сообщения в этом чате. Чат также будет удален из вашей истории.',
  },
  'dialog.delete.confirm': {
    en: 'Delete',
    ru: 'Удалить',
  },
  'dialog.cancel': {
    en: 'Cancel',
    ru: 'Отмена',
  },
  'common.confirm': {
    en: 'Confirm',
    ru: 'Подтвердить',
  },
  'sidebar.no_chats': {
    en: 'No chats yet',
    ru: 'Чатов пока нет',
  },
  'sidebar.load_error': {
    en: 'Failed to load chats',
    ru: 'Не удалось загрузить чаты',
  },
  'sidebar.untitled': {
    en: 'Untitled Chat',
    ru: 'Чат без названия',
  },
  'start.greeting': {
    en: 'Hello',
    ru: 'Привет',
  },
  'start.subtitle': {
    en: 'How can I help you today?',
    ru: 'Чем я могу вам помочь сегодня?',
  },
  'start.suggestion.stranger': {
    en: 'Write a script for a show like Stranger Things',
    ru: 'Write a script for a show like Stranger Things',
  },
  'start.suggestion.kling': {
    en: 'How to use Kling AI for professional video creation',
    ru: 'How to use Kling AI for professional video creation',
  },
  'start.suggestion.derry': {
    en: 'Latest theories about Welcome to Derry Season 2',
    ru: 'Latest theories about Welcome to Derry Season 2',
  },
  'start.suggestion.sci-fi': {
    en: 'Create a prompt for a cinematic sci-fi scene',
    ru: 'Create a prompt for a cinematic sci-fi scene',
  },
  'message.stopped': {
    en: 'Generation stopped by user',
    ru: 'Генерация остановлена пользователем',
  },
  'message.expand': {
    en: 'Expand',
    ru: 'Развернуть',
  },
  'message.collapse': {
    en: 'Collapse',
    ru: 'Свернуть',
  },
  'message.warning': {
    en: 'Gemma can make mistakes. Check important info.',
    ru: 'Gemma может ошибаться. Проверяйте важную информацию.',
  },
  'export.title': {
    en: 'Export Chat',
    ru: 'Экспорт чата',
  },
  'export.txt': {
    en: 'Download as TXT',
    ru: 'Скачать как TXT',
  },
  'export.json': {
    en: 'Download as JSON',
    ru: 'Скачать как JSON',
  },
  'download.code.title': {
    en: 'Download Code',
    ru: 'Скачать код',
  },
  'download.code.filename': {
    en: 'File name',
    ru: 'Имя файла',
  },
  'download.code.extension': {
    en: 'Extension',
    ru: 'Расширение',
  },
  'download.code.button': {
    en: 'Download',
    ru: 'Скачать',
  },
  'model.selector.title': {
    en: 'Model selection',
    ru: 'Выбор модели',
  },
  'model.selector.auto.title': {
    en: 'Automatic selection',
    ru: 'Автоматический выбор',
  },
  'model.selector.auto.name': {
    en: 'Automatic',
    ru: 'Автоматически',
  },
  'model.selector.auto.desc': {
    en: 'System-optimized choice',
    ru: 'Системно оптимизированный выбор',
  }
  };


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'ru' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
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
