import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Drawer } from 'vaul';
import { SearchOverlay } from './SearchOverlay';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { renameChat, togglePinChat } from './chatHeaderFunctions';
import '@material/web/progress/circular-progress.js';

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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-circular-progress': any;
    }
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  loading,
  error,
  currentChatId,
  onChatSelect,
  onNewChat,
  deleteChatFromDB,
  setChatTitle,
  togglePin
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (chat: Chat) => {
    timerRef.current = setTimeout(() => {
      setSelectedChat(chat);
      setIsMenuOpen(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
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
        if (currentChatId === selectedChat.id) {
          onNewChat();
        }
        setIsDeleteOpen(false);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
  };

  const handleTogglePin = async () => {
    if (selectedChat) {
      try {
        const newPinState = !selectedChat.is_pinned;
        await togglePinChat(selectedChat.id, newPinState, togglePin);
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
            style={{ willChange: 'opacity' }}
          />
        )}
      </AnimatePresence>

      <aside
        className="fixed top-0 left-0 h-screen w-[300px] bg-[#1c1b1f] border-r border-white/5 flex flex-col z-[150] shadow-2xl overflow-hidden"
        style={{ 
          transform: isOpen ? 'translateX(0px)' : 'translateX(-300px)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
          willChange: 'transform' 
        }}
      >
        <div className="p-4 flex flex-col gap-4 mt-2">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative group cursor-pointer"
          >
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#938f99] text-[20px]">
              search
            </span>
            <div className="w-full bg-[#2b2930] text-[#938f99] pl-10 pr-4 py-3 rounded-full text-sm flex items-center transition-colors group-hover:bg-[#36343b]">
              Search for chats
            </div>
          </div>

          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 bg-[var(--md-sys-color-primary-container)] hover:opacity-90 text-[var(--md-sys-color-on-primary-container)] rounded-2xl transition-all active:scale-[0.95]"
          >
            <span className="material-symbols-outlined text-[22px]">edit_square</span>
            <span className="font-medium text-sm">New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 mt-2 custom-scrollbar">
          <div className="px-4 py-2">
            <h2 className="text-[14px] font-medium text-[#e6e1e5]">Chats</h2>
          </div>

          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <md-circular-progress indeterminate style={{ '--md-circular-progress-size': '32px' }} />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#ffb4ab]">Failed to load chats</p>
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat) => {
                const isActive = currentChatId === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onChatSelect(chat.id);
                      onClose();
                    }}
                    onTouchStart={() => handleTouchStart(chat)}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(chat)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    className={`group flex items-center px-4 py-3 rounded-full text-sm text-left truncate transition-all duration-200 select-none ${
                      isActive
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                      : 'text-[#e6e1e5] hover:bg-[#2b2930]'
                    }`}
                  >
                    <span className="truncate flex-1">
                      {chat.title || 'Untitled Chat'}
                    </span>
                    {chat.is_pinned && (
                      <span className="material-symbols-outlined text-[18px] ml-2 opacity-70">
                        keep
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-[#938f99]">No chats yet</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <Drawer.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[70]" />
          <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[80] outline-none border-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
            <div className="p-4 bg-[#1c1b1f] pb-8">
              <div className="text-[var(--md-sys-color-on-surface)] text-sm font-medium px-6 mb-2 opacity-50 truncate">
                {selectedChat?.title}
              </div>
              <button
                onClick={handleTogglePin}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-gray-200 border-none"
              >
                <span className="material-symbols-outlined">
                  {selectedChat?.is_pinned ? 'keep_off' : 'keep'}
                </span>
                <span>{selectedChat?.is_pinned ? 'Unpin a chat' : 'Pin chat'}</span>
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
