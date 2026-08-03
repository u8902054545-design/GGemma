import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePreview } from '../ImagePreview';
import { searchButtonVariants, searchTextVariants } from '../../motion/searchTransition';

import { useLanguage } from '../../hooks/useLanguage';

const TRANSLATION_LANGUAGES = [
  'Auto Detect',
  'English',
  'Russian',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Italian',
  'Portuguese',
  'Arabic',
  'Turkish'
];

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
  isTranslationActive?: boolean;
  translationInputLang?: string;
  translationOutputLang?: string;
  onTranslationToggle?: () => void;
  onChangeInputLang?: (lang: string) => void;
  onChangeOutputLang?: (lang: string) => void;
  
  // Integrated actions props
  onAddClick: () => void;
  isTyping: boolean;
  stopRequest: () => void;
  handleWrappedSend: () => void;
  isSendDisabled: boolean;
  showVoiceChat: boolean;
  onVoiceChatClick: () => void;
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
  isTranslationActive = false,
  translationInputLang = 'English',
  translationOutputLang = 'Russian',
  onTranslationToggle,
  onChangeInputLang,
  onChangeOutputLang,
  
  onAddClick,
  isTyping,
  stopRequest,
  handleWrappedSend,
  isSendDisabled,
  showVoiceChat,
  onVoiceChatClick,
}) => {
  const { t } = useLanguage();
  const mediaType = selectedFile?.type.startsWith('video/') ? 'video' : 'image';

  return (
    <div 
      className="flex-1 rounded-[32px] shadow-2xl flex flex-col overflow-hidden min-h-[52px] transition-all duration-300 ease-[var(--md-sys-motion-easing-emphasized)] bg-[var(--md-sys-color-surface-container)]"
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

      <AnimatePresence>
        {isTranslationActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="px-5 overflow-hidden flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-secondary-container)] border border-[var(--md-sys-color-secondary)]/20 shadow-sm min-w-0 flex-1 justify-center">
                <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-secondary)] flex-shrink-0">translate</span>
                <select
                  value={translationInputLang}
                  onChange={(e) => onChangeInputLang?.(e.target.value)}
                  className="bg-transparent text-[12px] font-semibold text-[var(--md-sys-color-on-secondary-container)] outline-none border-none cursor-pointer pr-1 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" disabled hidden>
                    {t('chat.translation.input_lang') || 'Input Language'}
                  </option>
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-surface-variant)] select-none flex-shrink-0">
                arrow_forward
              </span>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm min-w-0 flex-1 justify-center">
                <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-primary)] flex-shrink-0">g_translate</span>
                <select
                  value={translationOutputLang}
                  onChange={(e) => onChangeOutputLang?.(e.target.value)}
                  className="bg-transparent text-[12px] font-semibold text-[var(--md-sys-color-on-primary-container)] outline-none border-none cursor-pointer pr-1 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" disabled hidden>
                    {t('chat.translation.output_lang') || 'Translated Output'}
                  </option>
                  {TRANSLATION_LANGUAGES.filter(lang => lang !== 'Auto Detect').map((lang) => (
                    <option key={lang} value={lang} className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onTranslationToggle?.();
              }}
              className="flex items-center justify-center p-1 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Textarea at the top */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('chat.input.placeholder.gemma')}
        className="w-full bg-transparent border-none outline-none resize-none max-h-60 min-h-[52px] px-4 pt-4 pb-2 text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] text-[16px] leading-relaxed select-text"
        rows={1}
      />

      {/* Action buttons row at the bottom */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 w-full">
        {/* Left actions: Add button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onAddClick}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-95 text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)]"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>

        {/* Right actions: Mic & Send/Live */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isListening ? "bg-[#EA4335]/20" : "hover:bg-[var(--md-sys-color-on-surface-variant)]/10"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${
              isListening ? "text-[#EA4335]" : "text-[var(--md-sys-color-on-surface-variant)]"
            }`}>
              mic
            </span>
          </button>

          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.button
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                type="button"
                onClick={stopRequest}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-110 active:scale-95 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              >
                <span className="material-symbols-outlined text-[22px]">stop</span>
              </motion.button>
            ) : showVoiceChat ? (
              <motion.button
                key="voice-chat"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                type="button"
                onClick={onVoiceChatClick}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:brightness-110 active:scale-95 cursor-pointer bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              >
                <span className="material-symbols-outlined text-[22px]">
                  voice_chat
                </span>
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                type="button"
                onClick={handleWrappedSend}
                disabled={isSendDisabled}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isSendDisabled 
                    ? "opacity-40 cursor-not-allowed text-[var(--md-sys-color-on-surface-variant)]" 
                    : "hover:brightness-110 active:scale-95 cursor-pointer bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${
                  !isSendDisabled ? "fill-[1]" : ""
                }`}>
                  send
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
