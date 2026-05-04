import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchOverlay } from './SearchOverlay';
import '@material/web/progress/circular-progress.js';

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

const drawerVariants = {
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 1
    }
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      restDelta: 0.01
    }
  }
};

interface Chat {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
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
  onNewChat
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
          <>
            <motion.div
              key="sidebar-backdrop"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-[55] cursor-pointer"
              style={{ willChange: 'opacity' }}
            />

            <motion.aside
              key="sidebar-menu"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 h-screen w-[300px] bg-[#1c1b1f] border-r border-white/5 flex flex-col z-[60] shadow-2xl overflow-hidden"
              style={{ willChange: 'transform' }}
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
                          className={`group flex items-center px-4 py-3 rounded-full text-sm text-left truncate transition-all duration-200 ${
                            isActive
                            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                            : 'text-[#e6e1e5] hover:bg-[#2b2930]'
                          }`}
                        >
                          <span className="truncate flex-1">
                            {chat.title || 'Untitled Chat'}
                          </span>
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
