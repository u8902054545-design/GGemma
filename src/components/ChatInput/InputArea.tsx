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
  clearSelection: () => void;
  onImageClick?: (url: string) => void;
  isSearchActive: boolean;
  isSearchDisabled: boolean;
  onSearchClick?: () => void;
  onModelConfigClick?: () => void;
  isListening: boolean;
  toggleListening: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  textareaRef,
  onKeyDown,
  previewUrl,
  clearSelection,
  onImageClick,
  isSearchActive,
  isSearchDisabled,
  onSearchClick,
  onModelConfigClick,
  isListening,
  toggleListening,
}) => {
  const { t } = useLanguage();

  return (
    <div 
      className="flex-1 rounded-[32px] shadow-2xl flex flex-col overflow-hidden min-h-[52px] transition-all duration-300 ease-[var(--md-sys-motion-easing-emphasized)]"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      {previewUrl && (
        <div className="px-5 pt-3">
          <ImagePreview 
            url={previewUrl} 
            onRemove={clearSelection}
            onImageClick={onImageClick}
          />
        </div>
      )}

      <div className="flex items-end w-full px-2">
        <div className="flex items-center pb-2 pl-2">
          <motion.button
            type="button"
            onClick={!isSearchDisabled ? onSearchClick : undefined}
            variants={searchButtonVariants}
            initial="inactive"
            animate={isSearchActive ? "active" : "inactive"}
            disabled={isSearchDisabled}
            className={`relative flex items-center h-9 px-3.5 overflow-hidden rounded-full group transition-all ${
              isSearchDisabled 
                ? "cursor-not-allowed opacity-40" 
                : isSearchActive
                ? "bg-[#8ab4f8]/20 ring-1 ring-[#8ab4f8]/30"
                : "hover:bg-[#1a1a1a]"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
              isSearchActive ? "text-[#8ab4f8]" : "text-[#9aa0a6] group-hover:text-[#e2e2e2]"
            }`}>
              {isSearchDisabled ? 'search_off' : 'search'}
            </span>
            <motion.span
              variants={searchTextVariants}
              initial="hidden"
              animate={isSearchActive ? "visible" : "hidden"}
              className={`text-sm font-medium whitespace-nowrap overflow-hidden ml-2 ${
                isSearchActive ? "text-[#8ab4f8]" : "text-[#9aa0a6]"
              }`}
            >
              {t('chat.search.button')}
            </motion.span>
          </motion.button>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('chat.input.placeholder.gemma')}
          className="flex-1 bg-transparent border-none outline-none resize-none max-h-60 min-h-[52px] px-4 py-3.5 text-[#e2e2e2] placeholder-[#757575] text-[16px] leading-relaxed select-text"
          rows={1}
        />

        <div className="flex items-center gap-1 pr-2 pb-2">
          <button
            type="button"
            onClick={onModelConfigClick}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[#1a1a1a] active:scale-90 group"
          >
            <span 
              className="material-symbols-outlined text-[20px] group-hover:text-[#8ab4f8]"
              style={{ color: '#9aa0a6' }}
            >
              tune
            </span>
          </button>
          
          <button
            type="button"
            onClick={toggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isListening ? "bg-[#EA4335]/20" : "hover:bg-[#1a1a1a]"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${
              isListening ? "text-[#EA4335]" : "text-[#9aa0a6]"
            }`}>
              mic
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
