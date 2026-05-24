import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from './UserProfile';
import { mdEasing } from '../motion/transitions';
import { handleNewChat, renameChat, togglePinChat } from './chatHeaderFunctions';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ExportMenu } from './ChatHeaderParts/ExportMenu';
import { ChatActionsMenu } from './ChatHeaderParts/ChatActionsMenu';
import { useLanguage } from '../hooks/useLanguage';

interface ChatHeaderProps {
  messages: any[];
  chatTitle: string;
  chatId: string;
  isPinned: boolean;
  setMessages: (msgs: any[]) => void;
  setChatId: (id: string) => void;
  setChatTitle: (title: string) => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  deleteChatFromDB: (id: string) => Promise<void>;
  togglePin: (id: string, pinned: boolean) => Promise<void>;
  isTemporary?: boolean;
  onTemporaryChatClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  messages, chatTitle, chatId, isPinned, setMessages, setChatId, setChatTitle,
  onMenuClick, isSidebarOpen, deleteChatFromDB, togglePin, isTemporary = false,
  onTemporaryChatClick
}) => {
  const isChatStarted = messages.length > 0;
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { t } = useLanguage();

  const displayTitle = isTemporary ? t('chat.temporary') : chatTitle;

  const onNewChatClick = () => handleNewChat(setMessages, setChatId, setChatTitle);

  const handleRenameConfirm = (newTitle: string) => renameChat(chatId, newTitle, setChatTitle);

  const handleDeleteConfirm = async () => {
    try {
      await deleteChatFromDB(chatId);
      onNewChatClick();
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleTogglePin = async () => {
    try {
      await togglePinChat(chatId, !isPinned, togglePin);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to toggle pin in header:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black h-[64px] flex justify-center">
      <div className="w-full max-w-[1200px] px-4 flex justify-between items-center h-full">
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <AnimatePresence initial={false}>
            {!isSidebarOpen && (
              <motion.button
                key="hamburger"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, ease: mdEasing.standard }}
                onClick={onMenuClick}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center bg-transparent"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">menu</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {isChatStarted && displayTitle && (
            <motion.h1
              key={displayTitle}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate mr-4 ml-1"
            >
              {displayTitle}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-end min-w-[48px] gap-1">
        <AnimatePresence mode="wait">
          {!isChatStarted && (
            <motion.button
              key="temp-chat-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onTemporaryChatClick}
              className={`p-2 rounded-full transition-colors flex items-center justify-center bg-transparent ${isTemporary ? 'bg-[#a8c7fa]/20 text-[#a8c7fa]' : 'hover:bg-white/10 text-[var(--md-sys-color-on-surface-variant)]'}`}
            >
              <span className="material-symbols-outlined text-[22px]">chat_dashed</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {!isChatStarted ? (
            <motion.div
              key="user-avatar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <UserProfile />
            </motion.div>
          ) : (
            <motion.div
              key="chat-controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <button onClick={onNewChatClick} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center bg-transparent">
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">edit_square</span>
              </button>

              <button onClick={() => setIsDownloadOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center bg-transparent">
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">download</span>
              </button>

              {!isTemporary && (
                <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center bg-transparent">
                  <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">more_vert</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExportMenu isOpen={isDownloadOpen} onOpenChange={setIsDownloadOpen} messages={messages} />
      <ChatActionsMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        isPinned={isPinned}
        onPin={handleTogglePin}
        onRename={() => { setIsMenuOpen(false); setTimeout(() => setIsRenameOpen(true), 300); }}
        onDelete={() => { setIsMenuOpen(false); setTimeout(() => setIsDeleteOpen(true), 300); }}
      />
      <RenameDialog isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} currentTitle={chatTitle} onConfirm={handleRenameConfirm} />
      <DeleteConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} />
      </div>
    </header>
  );
};
