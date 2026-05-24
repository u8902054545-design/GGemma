import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchOverlay } from './SearchOverlay';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { renameChat, togglePinChat } from './chatHeaderFunctions';
import { ChatList } from './SidebarParts/ChatList';
import { SidebarMenu } from './SidebarParts/SidebarMenu';
import { useLanguage } from '../hooks/useLanguage';

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

interface Chat {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  is_pinned: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  loading?: boolean;
  error?: boolean;
  currentChatId: string;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  deleteChatFromDB: (id: string) => Promise<void>;
  setChatTitle: (title: string) => void;
  togglePin: (id: string, pinned: boolean) => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose, chats, loading, error, currentChatId,
  onChatSelect, onNewChat, deleteChatFromDB, setChatTitle, togglePin
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { t } = useLanguage();

  const handleLongPress = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMenuOpen(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (selectedChat) {
      await renameChat(selectedChat.id, newTitle, (title) => {
        setChatTitle(title);
        selectedChat.title = title;
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedChat) {
      try {
        await deleteChatFromDB(selectedChat.id);
        if (currentChatId === selectedChat.id) onNewChat();
        setIsDeleteOpen(false);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
  };

  const handleTogglePin = async () => {
    if (selectedChat) {
      try {
        await togglePinChat(selectedChat.id, !selectedChat.is_pinned, togglePin);
        setIsMenuOpen(false);
      } catch (error) {
        console.error("Failed to pin/unpin chat:", error);
      }
    }
  };

  return (
    <>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectChat={(id) => {
          onChatSelect(id);
          setIsSearchOpen(false);
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
        className="fixed top-0 left-0 h-screen w-[300px] bg-[#1c1b1f] border-r border-white/5 flex flex-col z-[150] shadow-2xl overflow-hidden"
        style={{ 
          transform: isOpen ? 'translateX(0px)' : 'translateX(-300px)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <div className="p-4 flex flex-col gap-4 mt-2">
          <div onClick={() => setIsSearchOpen(true)} className="relative group cursor-pointer">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#938f99] text-[20px]">search</span>
            <div className="w-full bg-[#2b2930] text-[#938f99] pl-10 pr-4 py-3 rounded-full text-sm flex items-center transition-colors group-hover:bg-[#36343b]">
              {t('chat.search')}
            </div>
          </div>

          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 bg-[var(--md-sys-color-primary-container)] hover:opacity-90 text-[var(--md-sys-color-on-primary-container)] rounded-2xl transition-all active:scale-[0.95]"
          >
            <span className="material-symbols-outlined text-[22px]">edit_square</span>
            <span className="font-medium text-sm">{t('chat.new')}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 mt-2 custom-scrollbar">
          <div className="px-4 py-2">
            <h2 className="text-[14px] font-medium text-[#e6e1e5]">{t('sidebar.chats')}</h2>
          </div>
          <ChatList
            chats={chats}
            loading={loading}
            error={error}
            currentChatId={currentChatId}
            onChatSelect={(id) => { onChatSelect(id); onClose(); }}
            onLongPress={handleLongPress}
          />
        </div>
      </aside>

      <SidebarMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        selectedChat={selectedChat}
        onPin={handleTogglePin}
        onRename={() => { setIsMenuOpen(false); setTimeout(() => setIsRenameOpen(true), 300); }}
        onDelete={() => { setIsMenuOpen(false); setTimeout(() => setIsDeleteOpen(true), 300); }}
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
    </>
  );
};
