import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchOverlay } from './SearchOverlay';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ShareChatDialog } from '../sharing/ShareChatDialog';
import { renameChat, togglePinChat, fetchChatMessages } from './chatHeaderFunctions';
import { SidebarMenu } from './SidebarParts/SidebarMenu';
import { ExportMenu } from './ChatHeaderParts/ExportMenu';
import { useLanguage } from '../hooks/useLanguage';
import { Chat } from '../hooks/chatTypes';
import { useAuth } from '../hooks/useAuth';
import { ProfileDrawer } from './UserProfile';
import { NewChatButton } from './SidebarParts/NewChatButton';
import { SidebarProfile } from './SidebarParts/SidebarProfile';
import { useChatHistory } from '../hooks/useChatHistory';
import { ChatHistorySelection } from './Settings/chatHistorySelection';
import { ChatsPage } from './ChatsPage';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  loading?: boolean;
  error?: boolean;
  onRefresh: () => void;
  onRefreshSilent?: () => void;
  currentChatId: string;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  deleteChatFromDB: (id: string) => Promise<void>;
  setChatTitle: (title: string) => void;
  togglePin: (id: string, pinned: boolean) => Promise<void>;
  setSnackbarMessage: (msg: string) => void;
  setIsSnackbarOpen: (open: boolean) => void;
  onForkChat?: (id: string, title: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  error,
  onRefreshSilent,
  currentChatId,
  onChatSelect,
  onNewChat,
  deleteChatFromDB,
  setChatTitle,
  togglePin,
  setSnackbarMessage,
  setIsSnackbarOpen,
  onForkChat
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatsPageOpen, setIsChatsPageOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatHistorySelectionOpen, setIsChatHistorySelectionOpen] = useState(false);
  const [exportMessages, setExportMessages] = useState<any[]>([]);

  const { t } = useLanguage();
  const { user } = useAuth();
  const { isChatHistoryEnabled } = useChatHistory();

  const onRefreshSilentRef = useRef(onRefreshSilent);
  useEffect(() => {
    onRefreshSilentRef.current = onRefreshSilent;
  }, [onRefreshSilent]);

  useEffect(() => {
    if (isOpen && isChatHistoryEnabled) {
      onRefreshSilentRef.current?.();
    }
  }, [isOpen, isChatHistoryEnabled]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(t('errors.snackbar_failed_connect'));
      setIsSnackbarOpen(true);
    }
  }, [error, setSnackbarMessage, setIsSnackbarOpen, t]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setIsSnackbarOpen(true);
  };

  const handleOpenSearch = () => {
    if (!isChatHistoryEnabled) {
      setSnackbarMessage(t('errors.historyDisabled.search'));
      setIsSnackbarOpen(true);
      return;
    }
    setIsSearchOpen(true);
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleLongPress = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMenuOpen(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleExport = async () => {
    if (selectedChat) {
      const msgs = await fetchChatMessages(selectedChat.id);
      setExportMessages(msgs);
      setIsExportOpen(true);
    }
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (selectedChat) {
      try {
        await renameChat(selectedChat.id, newTitle, (title) => {
          setChatTitle(title);
          selectedChat.title = title;
        });
        showSnackbar(t('snackbar.chatRenamed'));
      } catch (err) {
        console.error('Failed to rename chat:', err);
        showSnackbar(err instanceof Error ? err.message : t('snackbar.chatRenameError'));
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedChat) {
      try {
        await deleteChatFromDB(selectedChat.id);
        if (currentChatId === selectedChat.id) onNewChat();
        setIsDeleteOpen(false);
        showSnackbar(t('snackbar.chatDeleted'));
      } catch (err) {
        console.error('Failed to delete chat:', err);
        showSnackbar(err instanceof Error ? err.message : t('snackbar.chatDeleteError'));
      }
    }
  };

  const handleTogglePin = async () => {
    if (selectedChat) {
      try {
        await togglePinChat(selectedChat.id, !selectedChat.is_pinned, togglePin);
        setIsMenuOpen(false);
        showSnackbar(!selectedChat.is_pinned ? t('snackbar.chatPinned') : t('snackbar.chatUnpinned'));
      } catch (err) {
        console.error('Failed to pin/unpin chat:', err);
        showSnackbar(err instanceof Error ? err.message : t('snackbar.chatPinError'));
      }
    }
  };

  const pinnedChats = chats.filter((chat) => chat.is_pinned);

  return (
    <>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectChat={(id) => {
          onChatSelect(id);
          setIsSearchOpen(false);
          setIsChatsPageOpen(false);
          onClose();
        }}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[140] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <aside
        className="fixed inset-0 h-full w-full bg-[var(--md-sys-color-surface)] flex flex-col z-[150] shadow-2xl overflow-hidden"
        style={{
          transform: isOpen ? 'translateX(0px)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-[19px] font-semibold text-[var(--md-sys-color-on-surface)] tracking-tight select-none">
            Gemma
          </span>

          <div className="flex items-center gap-1">
            <md-icon-button
              onClick={handleOpenSearch}
              aria-label={t('sidebar.search') || 'Search'}
              style={{
                '--md-icon-button-icon-color': 'var(--md-sys-color-on-surface)',
                '--md-icon-button-state-layer-color': 'var(--md-sys-color-on-surface)'
              }}
            >
              <md-icon>search</md-icon>
            </md-icon-button>

            <md-icon-button
              onClick={onClose}
              aria-label={t('common.close') || 'Close'}
              style={{
                '--md-icon-button-icon-color': 'var(--md-sys-color-on-surface)',
                '--md-icon-button-state-layer-color': 'var(--md-sys-color-on-surface)'
              }}
            >
              <md-icon>close</md-icon>
            </md-icon-button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-4">
          <NewChatButton
            onClick={() => {
              onNewChat();
              onClose();
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-1 custom-scrollbar min-h-0">
          <button
            type="button"
            onClick={() => {
              if (!isChatHistoryEnabled) {
                setSnackbarMessage(t('errors.historyDisabled.chat'));
                setIsSnackbarOpen(true);
                return;
              }
              setIsChatsPageOpen(true);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <span className="material-symbols-outlined text-[22px] text-[var(--md-sys-color-primary)]">
                forum
              </span>
              <span className="text-[15px] font-medium">
                {t('sidebar.chats') || 'Chats'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {chats.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] font-medium">
                  {chats.length}
                </span>
              )}
              <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]/60">
                chevron_right
              </span>
            </div>
          </button>

          {!isChatHistoryEnabled && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center mt-4">
              <span className="material-symbols-outlined text-[40px] text-[var(--md-sys-color-on-surface-variant)]/50 mb-3">
                history_off
              </span>
              <p className="text-sm text-[var(--md-sys-color-on-surface)] font-medium mb-1">
                {t('sidebar.historyDisabled')}
              </p>
              <button
                type="button"
                onClick={() => setIsChatHistorySelectionOpen(true)}
                className="px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-xs font-medium transition-transform active:scale-95 mt-2 cursor-pointer"
              >
                {t('sidebar.enableHistory')}
              </button>
            </div>
          )}

          {isChatHistoryEnabled && pinnedChats.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/20">
              <div className="px-4 pb-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                {t('sidebar.pinned') || 'Pinned'}
              </div>
              <div className="flex flex-col gap-1">
                {pinnedChats.map((chat) => {
                  const isActive = currentChatId === chat.id;

                  let timer: NodeJS.Timeout;
                  const handleStart = () => {
                    timer = setTimeout(() => handleLongPress(chat), 600);
                  };
                  const handleEnd = () => clearTimeout(timer);

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        onChatSelect(chat.id);
                        onClose();
                      }}
                      onTouchStart={handleStart}
                      onTouchEnd={handleEnd}
                      onTouchMove={handleEnd}
                      onTouchCancel={handleEnd}
                      onMouseDown={handleStart}
                      onMouseUp={handleEnd}
                      onMouseLeave={handleEnd}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                          : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                      }`}
                    >
                      <span className="truncate flex-1">{chat.title || t('sidebar.untitled')}</span>
                      <span className="material-symbols-outlined text-[18px] ml-2 opacity-70">
                        keep
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SidebarProfile
          userAvatar={userAvatar}
          userName={userName}
          onClick={() => {
            onClose();
            setTimeout(() => setIsProfileOpen(true), 200);
          }}
        />
      </aside>

      <ChatsPage
        isOpen={isChatsPageOpen}
        onClose={() => setIsChatsPageOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={(id) => {
          onChatSelect(id);
          setIsChatsPageOpen(false);
          onClose();
        }}
        onNewChat={() => {
          onNewChat();
          setIsChatsPageOpen(false);
          onClose();
        }}
        onLongPress={handleLongPress}
        onOpenSearch={handleOpenSearch}
      />

      <AnimatePresence>
        {isChatHistorySelectionOpen && (
          <ChatHistorySelection
            isOpen={isChatHistorySelectionOpen}
            onClose={() => setIsChatHistorySelectionOpen(false)}
          />
        )}
      </AnimatePresence>

      <SidebarMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        selectedChat={selectedChat}
        onPin={handleTogglePin}
        onRename={() => {
          setIsMenuOpen(false);
          setTimeout(() => setIsRenameOpen(true), 300);
        }}
        onExport={handleExport}
        onDelete={() => {
          setIsMenuOpen(false);
          setTimeout(() => setIsDeleteOpen(true), 300);
        }}
        onShare={() => {
          setIsMenuOpen(false);
          setTimeout(() => setIsShareOpen(true), 300);
        }}
        onForkChat={() => {
          setIsMenuOpen(false);
          if (selectedChat) onForkChat?.(selectedChat.id, selectedChat.title);
        }}
      />

      <ExportMenu
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        messages={exportMessages}
      />

      <RenameDialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        currentTitle={selectedChat?.title || ''}
        onConfirm={handleRenameConfirm}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ShareChatDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        chatId={selectedChat?.id}
        chatTitle={selectedChat?.title}
        showSnackbar={showSnackbar}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
