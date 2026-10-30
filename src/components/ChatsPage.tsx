import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Chat } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import { supabase, SUPABASE_ENDPOINT } from '../config';
import { Refresh } from './Refresh';

interface MaterialSymbolProps {
  name: string;
  className?: string;
  filled?: boolean;
}

const MaterialSymbol: React.FC<MaterialSymbolProps> = ({ name, className = 'w-6 h-6', filled = false }) => {
  switch (name) {
    case 'arrow_back':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="arrow_back"
          data-material-symbol="arrow_back"
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      );

    case 'format_list_bulleted':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="format_list_bulleted"
          data-material-symbol="format_list_bulleted"
        >
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
        </svg>
      );

    case 'grid_view':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="grid_view"
          data-material-symbol="grid_view"
        >
          {filled ? (
            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" />
          ) : (
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          )}
        </svg>
      );

    case 'edit_square':
      return (
        <svg
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          aria-label="edit_square"
          data-material-symbol="edit_square"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
        </svg>
      );

    case 'chat_bubble_off':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="chat_bubble_off"
          data-material-symbol="chat_bubble_off"
        >
          <path d="M20 4v11.17l1.71 1.71c.18-.26.29-.56.29-.88V4c0-1.1-.9-2-2-2H6.83l2 2H20zM1.39 4.22 2 4.83V22l4-4h9.17l4.61 4.61 1.41-1.41L2.81 2.81 1.39 4.22zM5.17 16 4 17.17V6.83L13.17 16H5.17z" />
        </svg>
      );

    case 'search':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="search"
          data-material-symbol="search"
        >
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      );

    case 'push_pin':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-label="push_pin"
          data-material-symbol="push_pin"
        >
          <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
        </svg>
      );

    default:
      return null;
  }
};

const GoogleEmptyChatsIllustration: React.FC = () => (
  <div className="mb-4 select-none flex items-center justify-center">
    <MaterialSymbol name="chat_bubble_off" className="w-14 h-14 text-white" />
  </div>
);

const getInitials = (title: string): string => {
  if (!title) return 'CH';
  const parts = title.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return title.slice(0, 2).toUpperCase();
};

const getAvatarTheme = (id: string) => {
  const themes = [
    { bg: '#1A1C2E', text: '#809CFF' },
    { bg: '#1C2620', text: '#6ED2A2' },
    { bg: '#2B1C2A', text: '#E599F7' },
    { bg: '#2C2216', text: '#FFC078' },
    { bg: '#172530', text: '#66D9E8' }
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return themes[Math.abs(hash) % themes.length];
};

const formatChatDate = (dateStr?: string, isRu?: boolean): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

interface ChatsPageProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onLongPress?: (chat: Chat) => void;
  onOpenSearch?: () => void;
  onRefresh?: () => Promise<void>;
}

export const ChatsPage: React.FC<ChatsPageProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onLongPress,
  onOpenSearch,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    try {
      return (localStorage.getItem('chat_history_layout') as 'list' | 'grid') || 'list';
    } catch {
      return 'list';
    }
  });

  const { t, language } = useLanguage();
  const isRu = language === 'ru';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleViewModeChange = async (mode: 'list' | 'grid') => {
    setViewMode(mode);
    try {
      localStorage.setItem('chat_history_layout', mode);
    } catch {}

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            settings: { chat_layout: mode }
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync layout setting:', err);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  const createLongPressHandlers = (chat: Chat) => {
    let timer: NodeJS.Timeout;
    const start = () => {
      timer = setTimeout(() => {
        if (onLongPress) onLongPress(chat);
      }, 600);
    };
    const end = () => clearTimeout(timer);
    return {
      onTouchStart: start,
      onTouchEnd: end,
      onTouchMove: end,
      onTouchCancel: end,
      onMouseDown: start,
      onMouseUp: end,
      onMouseLeave: end
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="fixed inset-0 z-[150] bg-[#000000] text-[#E3E3E3] flex flex-col select-none overflow-hidden"
          style={{
            fontFamily: 'Roboto, "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col h-full bg-[#000000] sm:border-x sm:border-[#1E1F20] relative">
            <header className="shrink-0 z-20 bg-[#000000]/95 backdrop-blur-md px-2 h-16 flex items-center justify-between border-b border-[#1E1F20]">
              <button
                type="button"
                onClick={onClose}
                aria-label={isRu ? 'Назад' : 'Back'}
                className="w-11 h-11 rounded-full flex items-center justify-center text-[#E3E3E3] hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
              >
                <MaterialSymbol name="arrow_back" className="w-6 h-6" />
              </button>

              <h1 className="absolute left-1/2 -translate-x-1/2 text-[22px] font-normal tracking-normal text-[#E3E3E3] truncate max-w-[60%]">
                {t('sidebar.chats') || (isRu ? 'Чаты' : 'Chats')}
              </h1>

              <div className="w-11 h-11" aria-hidden="true" />
            </header>

            <Refresh onRefresh={handleRefresh} className="flex-1 min-h-0 flex flex-col">
              <main className="flex-1 min-h-[calc(100dvh-4rem)] flex flex-col px-4 pt-3 pb-32">
                <div className="w-full">
                  <button
                    type="button"
                    onClick={onOpenSearch}
                    aria-label={isRu ? 'Поиск по чатам' : 'Search in chats'}
                    className="flex items-center w-full h-12 rounded-full bg-[#1E1F20] hover:bg-[#282A2C] active:bg-[#303236] transition-all px-4 text-left cursor-pointer group"
                  >
                    <MaterialSymbol name="search" className="w-5 h-5 text-[#9AA0A6] shrink-0 group-hover:text-white transition-colors" />
                    <span className="pl-3 text-[16px] text-[#9AA0A6] group-hover:text-[#C4C7C5] transition-colors select-none">
                      {isRu ? 'Поиск по чатам' : 'Search in chats'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-end mt-3 mb-2">
                  <div
                    role="group"
                    aria-label="View mode switch"
                    className="relative inline-grid grid-cols-2 items-center p-1 rounded-full bg-[#16171D] border border-[#2A2C38]"
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: '#0000FF' }}
                      className={`pointer-events-none absolute top-1 bottom-1 left-1 w-12 rounded-full shadow-md shadow-[#0000FF]/40 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                        viewMode === 'grid' ? 'translate-x-12' : 'translate-x-0'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleViewModeChange('list')}
                      aria-pressed={viewMode === 'list'}
                      className={`relative z-10 h-9 w-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                        viewMode === 'list' ? 'text-white scale-105' : 'text-[#9AA0A6] hover:text-white scale-100'
                      }`}
                    >
                      <MaterialSymbol name="format_list_bulleted" className="w-[21px] h-[21px]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewModeChange('grid')}
                      aria-pressed={viewMode === 'grid'}
                      className={`relative z-10 h-9 w-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                        viewMode === 'grid' ? 'text-white scale-105' : 'text-[#9AA0A6] hover:text-white scale-100'
                      }`}
                    >
                      <MaterialSymbol name="grid_view" className="w-[21px] h-[21px]" />
                    </button>
                  </div>
                </div>

                {chats.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <GoogleEmptyChatsIllustration />
                    <h2 className="text-[20px] font-normal text-[#E3E3E3] tracking-tight">
                      {isRu ? 'Чаты не найдены' : 'No chats found'}
                    </h2>
                    <p className="mt-2 text-[14px] text-[#9AA0A6] max-w-xs leading-relaxed">
                      Ask Gemma anything. Your chats will appear here
                    </p>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="divide-y divide-[#1E1F20] -mx-2">
                    {chats.map((chat) => {
                      const isActive = currentChatId === chat.id;
                      const avatarTheme = getAvatarTheme(chat.id);
                      const dateStr = formatChatDate(chat.created_at, isRu);
                      const pressHandlers = createLongPressHandlers(chat);

                      return (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() => {
                            onChatSelect(chat.id);
                            onClose();
                          }}
                          {...pressHandlers}
                          className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-colors text-left cursor-pointer group ${
                            isActive ? 'bg-[#1E2026]' : 'hover:bg-[#16171A] active:bg-[#1E2026]'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div
                              style={{
                                backgroundColor: avatarTheme.bg,
                                color: avatarTheme.text
                              }}
                              className="w-12 h-12 rounded-full flex items-center justify-center font-medium text-base"
                            >
                              {getInitials(chat.title)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[16px] truncate ${isActive ? 'font-bold text-white' : 'font-medium text-[#E3E3E3]'}`}>
                                {chat.title || t('sidebar.untitled') || (isRu ? 'Без названия' : 'Untitled')}
                              </span>
                              {dateStr && (
                                <span className="text-xs text-[#9AA0A6] shrink-0">
                                  {dateStr}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-sm text-[#9AA0A6] truncate flex items-center gap-1">
                                {chat.parent_chat_title
                                  ? `${isRu ? 'Ветвь' : 'Branch'}: ${chat.parent_chat_title}`
                                  : (isRu ? 'Чат' : 'Chat')}
                              </p>
                              {chat.is_pinned && (
                                <MaterialSymbol name="push_pin" className="w-4 h-4 text-[#0000FF] shrink-0" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {chats.map((chat) => {
                      const isActive = currentChatId === chat.id;
                      const avatarTheme = getAvatarTheme(chat.id);
                      const dateStr = formatChatDate(chat.created_at, isRu);
                      const pressHandlers = createLongPressHandlers(chat);

                      return (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() => {
                            onChatSelect(chat.id);
                            onClose();
                          }}
                          {...pressHandlers}
                          className={`flex flex-col justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                            isActive
                              ? 'border-[#0000FF] bg-[#181920]'
                              : 'border-[#282A2C] bg-[#131314] hover:border-[#0000FF] hover:bg-[#181920]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div
                                style={{
                                  backgroundColor: avatarTheme.bg,
                                  color: avatarTheme.text
                                }}
                                className="w-11 h-11 rounded-full flex items-center justify-center font-medium text-sm"
                              >
                                {getInitials(chat.title)}
                              </div>
                              {chat.is_pinned && (
                                <MaterialSymbol name="push_pin" className="w-4 h-4 text-[#0000FF] shrink-0" />
                              )}
                            </div>

                            <h3 className={`mt-3 text-[15px] truncate ${isActive ? 'font-bold text-white' : 'font-medium text-[#E3E3E3]'}`}>
                              {chat.title || t('sidebar.untitled') || (isRu ? 'Без названия' : 'Untitled')}
                            </h3>
                            <p className="mt-1 text-xs text-[#9AA0A6] line-clamp-2 leading-relaxed">
                              {chat.parent_chat_title ? `${isRu ? 'Ветвь' : 'Branch'}: ${chat.parent_chat_title}` : ''}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#282A2C] flex items-center justify-between text-[11px] text-[#9AA0A6]">
                            <span>{dateStr}</span>
                            <span className="text-[#4D5BFF] font-medium">{isRu ? 'Открыть' : 'Open'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </main>
            </Refresh>

            <div
              className="fixed right-6 z-30"
              style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="button"
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                style={{ backgroundColor: '#0000FF' }}
                className="h-14 px-5 rounded-[16px] text-white font-medium text-[15px] tracking-wide flex items-center gap-3 shadow-lg shadow-black/60 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <MaterialSymbol name="edit_square" className="w-6 h-6" />
                <span>{isRu ? 'Новый чат' : 'New chat'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
