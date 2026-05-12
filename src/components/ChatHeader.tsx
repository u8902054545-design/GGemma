import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Drawer } from 'vaul';
import { UserProfile } from './UserProfile';
import { mdEasing } from '../motion/transitions';
import { downloadHistory, handleNewChat, renameChat, togglePinChat } from './chatHeaderFunctions';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

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
  messages,
  chatTitle,
  chatId,
  isPinned,
  setMessages,
  setChatId,
  setChatTitle,
  onMenuClick,
  isSidebarOpen,
  deleteChatFromDB,
  togglePin,
  isTemporary = false,
  onTemporaryChatClick
}) => {
  const isChatStarted = messages.length > 0;
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const displayTitle = isTemporary ? "Temporary Chat" : chatTitle;

  const onNewChatClick = () => {
    handleNewChat(setMessages, setChatId, setChatTitle);
  };

  const handleRenameConfirm = (newTitle: string) => {
    renameChat(chatId, newTitle, setChatTitle);
  };

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
    <header className="px-4 py-3 flex justify-between items-center sticky top-0 z-50 bg-black h-[64px]">
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
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">
                  menu
                </span>
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
              transition={{ duration: 0.4, ease: mdEasing.standard }}
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
              transition={{ duration: 0.2 }}
              onClick={onTemporaryChatClick}
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${isTemporary ? 'bg-[#a8c7fa]/20 text-[#a8c7fa]' : 'hover:bg-white/10 text-[var(--md-sys-color-on-surface-variant)]'}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                chat_dashed
              </span>
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
              transition={{ duration: 0.3, ease: mdEasing.standard }}
            >
              <UserProfile />
            </motion.div>
          ) : (
            <motion.div
              key="chat-controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: mdEasing.standard }}
              className="flex items-center gap-1"
            >
              <button onClick={onNewChatClick} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">
                  edit_square
                </span>
              </button>

              <Drawer.Root open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
                <Drawer.Trigger asChild>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">
                      download
                    </span>
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
                  <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[70] outline-none border-none">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
                    <div className="p-4 bg-[#1c1b1f] pb-8">
                      <div className="text-[var(--md-sys-color-on-surface)] text-lg font-medium px-4 mb-4 text-center border-none">Export Chat</div>
                      <button
                        onClick={() => { downloadHistory(messages, 'txt'); setIsDownloadOpen(false); }}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-none"
                      >
                        <span className="material-symbols-outlined text-gray-400">description</span>
                        <span className="text-gray-200">Download as TXT</span>
                      </button>
                      <button
                        onClick={() => { downloadHistory(messages, 'json'); setIsDownloadOpen(false); }}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-none"
                      >
                        <span className="material-symbols-outlined text-gray-400">data_object</span>
                        <span className="text-gray-200">Download as JSON</span>
                      </button>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>

              {!isTemporary && (
                <Drawer.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <Drawer.Trigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">
                        more_vert
                      </span>
                    </button>
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
                    <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[70] outline-none border-none">
                      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
                      <div className="p-4 bg-[#1c1b1f] pb-8">
                        <button
                          onClick={handleTogglePin}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-gray-200 border-none"
                        >
                          <span className="material-symbols-outlined">{isPinned ? 'keep_off' : 'keep'}</span>
                          <span>{isPinned ? 'Unpin a chat' : 'Pin chat'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setTimeout(() => setIsRenameOpen(true), 300);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-gray-200 border-none"
                        >
                          <span className="material-symbols-outlined">edit</span>
                          <span>Rename chat</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setTimeout(() => setIsDeleteOpen(true), 300);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-[#ffb4ab] border-none"
                        >
                          <span className="material-symbols-outlined">delete</span>
                          <span>Delete chat</span>
                        </button>
                      </div>
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.Root>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RenameDialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        currentTitle={chatTitle}
        onConfirm={handleRenameConfirm}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </header>
  );
};
