import React from 'react';
import { Drawer } from 'vaul';
import { downloadHistory } from '../chatHeaderFunctions';

interface ExportMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: any[];
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  isOpen,
  onOpenChange,
  messages
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
        <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[70] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
          <div className="p-4 bg-[#1c1b1f] pb-8">
            <div className="text-[var(--md-sys-color-on-surface)] text-lg font-medium px-4 mb-4 text-center">Export Chat</div>
            <button
              onClick={() => { downloadHistory(messages, 'txt'); onOpenChange(false); }}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-gray-400">description</span>
              <span className="text-gray-200">Download as TXT</span>
            </button>
            <button
              onClick={() => { downloadHistory(messages, 'json'); onOpenChange(false); }}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-gray-400">data_object</span>
              <span className="text-gray-200">Download as JSON</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
