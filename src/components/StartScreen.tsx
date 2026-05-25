import React from 'react';
import { motion } from 'motion/react';
import { GemmaIcon } from './GemmaIcon';
import { useLanguage } from '../hooks/useLanguage';

type SuggestionCardProps = {
  text: string;
  icon: string;
  onClick: (text: string) => void;
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ text, icon, onClick }) => {
  return (
    <div 
      onClick={() => onClick(text)}
      className="relative p-[1px] rounded-xl overflow-hidden cursor-pointer group animate-gradient opacity-60 hover:opacity-100 transition-opacity duration-300"
    >
      <div className="relative bg-[var(--md-sys-color-surface)] h-full rounded-xl p-3 flex flex-col justify-between hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors duration-300">
        <p className="text-[var(--md-sys-color-on-surface)] text-xs font-medium leading-snug">
          {text}
        </p>
        <div className="flex justify-end mt-3">
          <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] rounded-full p-1.5 text-[16px] group-hover:text-[var(--md-sys-color-on-surface)] transition-colors duration-300">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};

type StartScreenProps = {
  userName: string | null;
  onSelectSuggestion: (text: string) => void;
};

export const StartScreen: React.FC<StartScreenProps> = ({ userName, onSelectSuggestion }) => {
  const firstName = userName?.split(' ')[0] || 'User';
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-start w-full max-w-6xl mx-auto pt-12 pb-10">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center">
           <GemmaIcon className="w-full h-full" />
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold mb-2 tracking-tight">
          <span className="text-gradient">Hello, {firstName}</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--md-sys-color-on-surface-variant)] tracking-tight">
          {t('start.subtitle')}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full px-4 mt-4">
        <SuggestionCard 
          text={t('start.suggestion.stranger')} 
          icon="movie_edit" 
          onClick={onSelectSuggestion} 
        />
        <SuggestionCard 
          text={t('start.suggestion.kling')} 
          icon="video_settings" 
          onClick={onSelectSuggestion} 
        />
        <SuggestionCard 
          text={t('start.suggestion.derry')} 
          icon="mystery" 
          onClick={onSelectSuggestion} 
        />
        <SuggestionCard 
          text={t('start.suggestion.sci-fi')} 
          icon="auto_awesome" 
          onClick={onSelectSuggestion} 
        />
      </div>
    </div>
  );
};
