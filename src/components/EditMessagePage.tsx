import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { mdEasing, mdDuration } from '../motion/transitions';

interface EditMessagePageProps {
  isOpen: boolean;
  initialText: string;
  onClose: () => void;
  onApply: (newText: string) => void;
}

export const EditMessagePage: React.FC<EditMessagePageProps> = ({
  isOpen,
  initialText,
  onClose,
  onApply,
}) => {
  const { t } = useLanguage();
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      // Auto focus and place cursor at the end of the text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 100);
    }
  }, [isOpen, initialText]);

  const handleApply = () => {
    if (text.trim()) {
      onApply(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: mdDuration.medium4, ease: mdEasing.standard }}
          className="fixed inset-0 z-[1000] flex flex-col bg-[var(--md-sys-color-background)] font-sans overflow-hidden"
        >
          {/* Top Navbar */}
          <header className="w-full h-16 px-4 md:px-6 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
                edit
              </span>
              <h1 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
                {t('editMessage.title')}
              </h1>
            </div>
            
            {/* Action buttons in header */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="h-10 px-4 rounded-full flex items-center justify-center gap-2 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-95 transition-all cursor-pointer font-medium text-[14px]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>{t('editMessage.close')}</span>
              </button>
              
              <button
                onClick={handleApply}
                disabled={!text.trim()}
                className="h-10 px-5 rounded-full flex items-center justify-center gap-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer font-medium text-[14px] shadow-sm"
              >
                <span>{t('editMessage.apply')}</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </header>

          {/* Main area */}
          <main className="flex-1 flex flex-col p-4 md:p-8 max-w-[1000px] w-full mx-auto justify-start">
            <div className="flex-1 flex flex-col bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20 rounded-[24px] p-6 shadow-md relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('editMessage.placeholder')}
                className="flex-1 w-full bg-transparent text-[var(--md-sys-color-on-surface)] text-[16px] leading-relaxed resize-none focus:outline-none placeholder-[var(--md-sys-color-on-surface-variant)]/50 select-text"
              />
              <div className="absolute bottom-4 right-6 text-[12px] text-[var(--md-sys-color-on-surface-variant)]/40 font-mono select-none">
                {text.length} chars | Press Enter to apply, Shift+Enter for new line
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
