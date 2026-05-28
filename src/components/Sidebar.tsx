import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchOverlay } from './SearchOverlay';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { renameChat, togglePinChat, fetchChatMessages } from './chatHeaderFunctions';
import { ChatList } from './SidebarParts/ChatList';
import { SidebarMenu } from './SidebarParts/SidebarMenu';
import { ExportMenu } from './ChatHeaderParts/ExportMenu';
import { useLanguage } from '../hooks/useLanguage';
import { Chat } from '../hooks/chatTypes';
import { useAuth } from '../hooks/useAuth';
import { ProfileDrawer } from './UserProfile';
import { SidebarSearch } from './SidebarParts/SidebarSearch';
import { NewChatButton } from './SidebarParts/NewChatButton';
import { SidebarProfile } from './SidebarParts/SidebarProfile';
import '@material/web/icon/icon.js';

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
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [exportMessages, setExportMessages] = useState<any[]>([]);
  const { t } = useLanguage();
  const { user } = useAuth();

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
        className="fixed inset-y-0 left-0 h-full w-[300px] bg-[var(--md-sys-color-surface)] border-r border-[var(--md-sys-color-outline-variant)]/10 flex flex-col z-[150] shadow-2xl overflow-hidden"
        style={{ 
          transform: isOpen ? 'translateX(0px)' : 'translateX(-300px)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <div className="p-4 flex flex-col gap-4 mt-2">
          <SidebarSearch onClick={() => setIsSearchOpen(true)} />

          <NewChatButton onClick={() => { onNewChat(); onClose(); }} />
        </div>

        <div className="flex-1 overflow-y-auto px-2 mt-2 custom-scrollbar min-h-0">
          <div className="px-4 py-2">
            <h2 className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{t('sidebar.chats')}</h2>
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

        <SidebarProfile 
          userAvatar={userAvatar}
          userName={userName}
          onClick={() => {
            onClose();
            setTimeout(() => setIsProfileOpen(true), 200);
          }}
        />
      </aside>

      <SidebarMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        selectedChat={selectedChat}
        onPin={handleTogglePin}
        onRename={() => { setIsMenuOpen(false); setTimeout(() => setIsRenameOpen(true), 300); }}
        onExport={handleExport}
        onDelete={() => { setIsMenuOpen(false); setTimeout(() => setIsDeleteOpen(true), 300); }}
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

      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};
