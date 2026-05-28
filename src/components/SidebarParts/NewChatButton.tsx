import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface NewChatButtonProps {
  onClick: () => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 bg-[var(--md-sys-color-primary-container)] hover:opacity-90 text-[var(--md-sys-color-on-primary-container)] rounded-2xl transition-all active:scale-[0.95]"
    >
      <span className="material-symbols-outlined text-[22px]">edit_square</span>
      <span className="font-medium text-sm">{t('chat.new')}</span>
    </button>
  );
};
