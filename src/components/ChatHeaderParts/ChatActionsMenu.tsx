import React from 'react';
import { Drawer } from 'vaul';

interface ChatActionsMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPinned: boolean;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ChatActionsMenu: React.FC<ChatActionsMenuProps> = ({
  isOpen,
  onOpenChange,
  isPinned,
  onPin,
  onRename,
  onDelete
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[70] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
          <div className="p-4 bg-[#1c1b1f] pb-8">
            <button
              onClick={onPin}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-gray-200 border-none bg-transparent"
            >
              <span className="material-symbols-outlined">{isPinned ? 'keep_off' : 'keep'}</span>
              <span>{isPinned ? 'Unpin a chat' : 'Pin chat'}</span>
            </button>
            <button
              onClick={onRename}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-gray-200 border-none bg-transparent"
            >
              <span className="material-symbols-outlined">edit</span>
              <span>Rename chat</span>
            </button>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-[#ffb4ab] border-none bg-transparent"
            >
              <span className="material-symbols-outlined">delete</span>
              <span>Delete chat</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
