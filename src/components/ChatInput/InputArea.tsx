import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePreview } from '../ImagePreview';
import { YouTubeIcon } from '../IconsApp/YouTubeIcon';
import { useLanguage } from '../../hooks/useLanguage';
import { AddAction } from './AddAction';
import { SendAction } from './SendAction';

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
  isYouTubeSearchActive?: boolean;
  onYouTubeSearchClick?: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isTranslationActive?: boolean;
  translationInputLang?: string;
  translationOutputLang?: string;
  onTranslationToggle?: () => void;
  onChangeInputLang?: (lang: string) => void;
  onChangeOutputLang?: (lang: string) => void;
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
  isYouTubeSearchActive = false,
  onYouTubeSearchClick,
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

  const [isFocused, setIsFocused] = useState(false);
  const [dimensions, setDimensions] = useState({
    textHeight: 54,
    shellHeight: 56,
  });

  const shellRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const topContentRef = useRef<HTMLDivElement>(null);
  const pastedFlagRef = useRef(false);

  const hasText = input.length > 0;
  const hasSendState = !showVoiceChat;
  const hasExtras = Boolean(previewUrl || isSearchActive || isYouTubeSearchActive || isTranslationActive);
  const isRectangular = isFocused || hasText || hasExtras;

  const recalculateGeometry = useCallback(() => {
    const shellEl = shellRef.current;
    const mirrorEl = mirrorRef.current;
    const textareaEl = textareaRef.current;

    if (!shellEl || !mirrorEl || !textareaEl) return;

    if (shellEl.scrollTop !== 0) {
      shellEl.scrollTop = 0;
    }

    if (!isRectangular) {
      setDimensions((prev) =>
        prev.textHeight === 54 && prev.shellHeight === 56
          ? prev
          : { textHeight: 54, shellHeight: 56 }
      );
      return;
    }

    const availableWidth = Math.max(200, shellEl.clientWidth - 32);
    mirrorEl.style.width = `${availableWidth}px`;
    mirrorEl.textContent = input ? (input.endsWith('\n') ? `${input} ` : input) : ' ';

    const rawMirrorHeight = mirrorEl.scrollHeight;
    const clampedTextHeight = Math.min(Math.max(36, rawMirrorHeight), 180);

    const extrasHeight = hasExtras && topContentRef.current ? topContentRef.current.offsetHeight + 8 : 0;
    const bottomControlsReserve = 54;
    const topPaddingReserve = 12;
    const targetShellHeight = Math.max(
      102,
      clampedTextHeight + extrasHeight + bottomControlsReserve + topPaddingReserve
    );

    setDimensions((prev) => {
      if (prev.textHeight === clampedTextHeight && prev.shellHeight === targetShellHeight) {
        return prev;
      }
      return {
        textHeight: clampedTextHeight,
        shellHeight: targetShellHeight,
      };
    });

    if (pastedFlagRef.current) {
      pastedFlagRef.current = false;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
        if (shellRef.current) {
          shellRef.current.scrollTop = 0;
        }
      });
    }
  }, [input, isRectangular, hasExtras, textareaRef]);

  useLayoutEffect(() => {
    recalculateGeometry();
  }, [recalculateGeometry]);

  useEffect(() => {
    const handleResize = () => recalculateGeometry();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculateGeometry]);

  useEffect(() => {
    if (!topContentRef.current || !hasExtras) return;
    const observer = new ResizeObserver(() => {
      recalculateGeometry();
    });
    observer.observe(topContentRef.current);
    return () => observer.disconnect();
  }, [recalculateGeometry, hasExtras]);

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleShellMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('button') &&
      !target.closest('select') &&
      !target.closest('input') &&
      target !== textareaRef.current
    ) {
      e.preventDefault();
      setIsFocused(true);
      textareaRef.current?.focus();
    }
  };

  const handlePaste = () => {
    pastedFlagRef.current = true;
    setIsFocused(true);
  };

  return (
    <div className="w-full relative">
      <div ref={mirrorRef} className="textarea-mirror" aria-hidden="true" />

      <div
        ref={shellRef}
        onMouseDown={handleShellMouseDown}
        onScroll={(e) => {
          if (e.currentTarget.scrollTop !== 0) {
            e.currentTarget.scrollTop = 0;
          }
        }}
        style={{ height: `${dimensions.shellHeight}px` }}
        className={`ai-input-shell ${isRectangular ? 'is-rectangular' : ''} ${
          hasSendState ? 'has-text' : ''
        }`}
        role="region"
        aria-label="Поле ввода сообщения"
      >
        <AddAction
          onAddClick={onAddClick}
          preventFocusLoss={preventFocusLoss}
          title={t('chat.add.photo') || 'Add'}
        />

        <div className="textarea-stage">
          {hasExtras && (
            <div ref={topContentRef} className="space-y-2 mb-2">
              {previewUrl && (
                <div>
                  <ImagePreview
                    url={previewUrl}
                    onRemove={clearSelection}
                    onMediaClick={onMediaClick}
                    type={mediaType}
                  />
                </div>
              )}

              <AnimatePresence>
                {(isYouTubeSearchActive || isSearchActive) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 6 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    {isYouTubeSearchActive ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm">
                        <div className="w-[18px] h-[18px] flex items-center justify-center">
                          <YouTubeIcon className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-[13px] font-medium text-[var(--md-sys-color-on-primary-container)]">
                          {t('chat.add.youtube_search') || t('message.generation_details.youtube_search') || 'YouTube Search'}
                        </span>
                        <button
                          type="button"
                          onMouseDown={preventFocusLoss}
                          onClick={(e) => {
                            e.stopPropagation();
                            onYouTubeSearchClick?.();
                          }}
                          className="flex items-center justify-center ml-1 hover:bg-[var(--md-sys-color-on-primary-container)]/10 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-primary-container)]">
                            close
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
                          search
                        </span>
                        <span className="text-[13px] font-medium text-[var(--md-sys-color-on-primary-container)]">
                          {t('chat.add.search')}
                        </span>
                        <button
                          type="button"
                          onMouseDown={preventFocusLoss}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSearchClick?.();
                          }}
                          className="flex items-center justify-center ml-1 hover:bg-[var(--md-sys-color-on-primary-container)]/10 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-primary-container)]">
                            close
                          </span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isTranslationActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 6 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-secondary-container)] border border-[var(--md-sys-color-secondary)]/20 shadow-sm min-w-0 flex-1 justify-center">
                        <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-secondary)] flex-shrink-0">
                          translate
                        </span>
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
                            <option
                              key={lang}
                              value={lang}
                              className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                            >
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-on-surface-variant)] select-none flex-shrink-0">
                        arrow_forward
                      </span>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm min-w-0 flex-1 justify-center">
                        <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-primary)] flex-shrink-0">
                          g_translate
                        </span>
                        <select
                          value={translationOutputLang}
                          onChange={(e) => onChangeOutputLang?.(e.target.value)}
                          className="bg-transparent text-[12px] font-semibold text-[var(--md-sys-color-on-primary-container)] outline-none border-none cursor-pointer pr-1 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" disabled hidden>
                            {t('chat.translation.output_lang') || 'Translated Output'}
                          </option>
                          {TRANSLATION_LANGUAGES.filter((lang) => lang !== 'Auto Detect').map((lang) => (
                            <option
                              key={lang}
                              value={lang}
                              className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                            >
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onMouseDown={preventFocusLoss}
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
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onPaste={handlePaste}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={onKeyDown}
            style={{ height: `${dimensions.textHeight}px` }}
            className="ai-textarea"
            placeholder={t('chat.input.placeholder.gemma')}
            aria-label="Введите сообщение"
          />
        </div>

        <div className="actions-bottomright">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={toggleListening}
            className={`btn-mic-action ${isListening ? 'is-recording' : ''}`}
            title="Голосовой ввод"
            aria-label="Голосовой ввод"
          >
            <span className="material-symbols-outlined text-[22px]">mic</span>
          </button>

          <SendAction
            isTyping={isTyping}
            stopRequest={stopRequest}
            handleWrappedSend={handleWrappedSend}
            isSendDisabled={isSendDisabled}
            showVoiceChat={showVoiceChat}
            onVoiceChatClick={onVoiceChatClick}
            preventFocusLoss={preventFocusLoss}
          />
        </div>
      </div>
    </div>
  );
};

