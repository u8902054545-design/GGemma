import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Chat } from '../../hooks/chatTypes';
import { GemmaSkeleton } from '../GemmaSkeleton';

interface ChatListProps {
  chats: Chat[];
  loading?: boolean;
  error?: boolean;
  currentChatId: string;
  onChatSelect: (id: string) => void;
  onLongPress: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  loading,
  error,
  currentChatId,
  onChatSelect,
  onLongPress
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        <GemmaSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-[var(--md-sys-color-error)]">{t('sidebar.load_error')}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{t('sidebar.no_chats')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {chats.map((chat) => {
        const isActive = currentChatId === chat.id;
        
        let timer: NodeJS.Timeout;
        const handleStart = () => {
          timer = setTimeout(() => onLongPress(chat), 600);
        };
        const handleEnd = () => clearTimeout(timer);

        return (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            className={`group flex items-center px-4 py-3 rounded-full text-sm text-left truncate transition-all duration-200 select-none ${
              isActive
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
              : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
            }`}
          >
            <span className="truncate flex-1">
              {chat.title || t('sidebar.untitled')}
            </span>
            {chat.is_pinned && (
              <span className="material-symbols-outlined text-[18px] ml-2 opacity-70">
                keep
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
