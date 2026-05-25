import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mdEasing } from '../motion/transitions';
import { handleNewChat, renameChat, togglePinChat } from './chatHeaderFunctions';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ExportMenu } from './ChatHeaderParts/ExportMenu';
import { ChatActionsMenu } from './ChatHeaderParts/ChatActionsMenu';
import { useLanguage } from '../hooks/useLanguage';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';

interface ChatHeaderProps {
  messages: any[];
  chatTitle: string;
  chatId: string;
  isPinned: boolean;
  selectedModel: { id: string, name: string };
  isModelSelectorOpen: boolean;
  onModelSelectorToggle: () => void;
  setMessages: (msgs: any[]) => void;
  setChatId: (id: string) => void;
  setChatTitle: (title: string) => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  deleteChatFromDB: (id: string) => Promise<void>;
  togglePin: (id: string, pinned: boolean) => Promise<void>;
  isTemporary?: boolean;
  onTemporaryChatClick?: () => void;
  onNewChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  messages, chatTitle, chatId, isPinned, selectedModel, isModelSelectorOpen, onModelSelectorToggle,
  setMessages, setChatId, setChatTitle,
  onMenuClick, isSidebarOpen, deleteChatFromDB, togglePin, isTemporary = false,
  onTemporaryChatClick, onNewChat
}) => {
  const isChatStarted = messages.length > 0;
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { t } = useLanguage();

  const onNewChatClick = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      handleNewChat(setMessages, setChatId, setChatTitle);
    }
  };

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
    <header className="sticky top-0 z-50 bg-[var(--md-sys-color-background)] h-[64px] flex justify-center">
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
                className="p-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors flex items-center justify-center bg-transparent"
              >
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">menu</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onModelSelectorToggle}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors group"
        >
          <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[150px]">
            {selectedModel.name}
          </span>
          <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)]">
            {isModelSelectorOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
        </button>
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
              className={`p-2 rounded-full transition-colors flex items-center justify-center bg-transparent ${isTemporary ? 'bg-[var(--md-sys-color-primary)]/20 text-[var(--md-sys-color-primary)]' : 'hover:bg-[var(--md-sys-color-on-surface-variant)]/10 text-[var(--md-sys-color-on-surface-variant)]'}`}
            >
              <span className="material-symbols-outlined text-[22px]">chat_dashed</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {isChatStarted && (
            <motion.div
              key="chat-controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <button onClick={onNewChatClick} className="p-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors flex items-center justify-center bg-transparent">
                <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">edit_square</span>
              </button>

              {isTemporary ? (
                <md-icon-button 
                  onClick={() => setIsMenuOpen(true)}
                  style={{
                    '--md-icon-button-icon-color': 'var(--md-sys-color-on-surface-variant)',
                    '--md-icon-button-state-layer-color': 'var(--md-sys-color-on-surface-variant)'
                  }}
                >
                  <md-icon>more_vert</md-icon>
                </md-icon-button>
              ) : (
                <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors flex items-center justify-center bg-transparent">
                  <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[22px]">more_vert</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExportMenu isOpen={isDownloadOpen} onOpenChange={setIsDownloadOpen} messages={messages} isTemporary={isTemporary} />
      <ChatActionsMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        isPinned={isPinned}
        onPin={handleTogglePin}
        onRename={() => { setIsMenuOpen(false); setTimeout(() => setIsRenameOpen(true), 300); }}
        onExport={() => setIsDownloadOpen(true)}
        onDelete={() => { setIsMenuOpen(false); setTimeout(() => setIsDeleteOpen(true), 300); }}
        isTemporary={isTemporary}
      />
      <RenameDialog isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} currentTitle={chatTitle} onConfirm={handleRenameConfirm} />
      <DeleteConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} />
      </div>
    </header>
  );
};
