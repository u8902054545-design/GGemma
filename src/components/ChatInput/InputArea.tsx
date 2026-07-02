import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePreview } from '../ImagePreview';
import { searchButtonVariants, searchTextVariants } from '../../motion/searchTransition';

import { useLanguage } from '../../hooks/useLanguage';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  previewUrl: string | null;
  selectedFile: File | null;
  clearSelection: () => void;
  onMediaClick?: (url: string) => void;
  isSearchActive: boolean;
  isSearchDisabled: boolean;
  onSearchClick?: () => void;
  isListening: boolean;
  toggleListening: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  textareaRef,
  onKeyDown,
  previewUrl,
  selectedFile,
  clearSelection,
  onMediaClick,
  isSearchActive,
  isSearchDisabled,
  onSearchClick,
  isListening,
  toggleListening,
}) => {
  const { t } = useLanguage();
  const mediaType = selectedFile?.type.startsWith('video/') ? 'video' : 'image';

  return (
    <div 
      className="flex-1 rounded-[32px] shadow-2xl flex flex-col overflow-hidden min-h-[52px] transition-all duration-300 ease-[var(--md-sys-motion-easing-emphasized)] bg-[var(--md-sys-color-surface-container-high)]"
    >
      {previewUrl && (
        <div className="px-5 pt-3">
          <ImagePreview 
            url={previewUrl} 
            onRemove={clearSelection}
            onMediaClick={onMediaClick}
            type={mediaType}
          />
        </div>
      )}

      <AnimatePresence>
        {isSearchActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="px-5 overflow-hidden"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm">
               <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">search</span>
               <span className="text-[13px] font-medium text-[var(--md-sys-color-on-primary-container)]">{t('chat.add.search')}</span>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchClick?.();
                }}
                className="flex items-center justify-center ml-1 hover:bg-[var(--md-sys-color-on-primary-container)]/10 rounded-full transition-colors"
               >
                 <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-primary-container)]">close</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-end w-full px-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('chat.input.placeholder.gemma')}
          className="w-full bg-transparent border-none outline-none resize-none max-h-60 min-h-[52px] pl-4 pr-12 py-3.5 text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] text-[16px] leading-relaxed select-text"
          rows={1}
        />

        <div className="absolute right-4 bottom-2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isListening ? "bg-[#EA4335]/20" : "hover:bg-[var(--md-sys-color-on-surface-variant)]/10"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${
              isListening ? "text-[#EA4335]" : "text-[var(--md-sys-color-on-surface-variant)]"
            }`}>
              mic
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
