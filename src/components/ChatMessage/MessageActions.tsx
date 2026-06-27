import React from 'react';
import { motion } from 'motion/react';
import { mdEasing, mdDuration } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';

interface MessageActionsProps {
  isTemporary: boolean;
  localFeedback: 'like' | 'dislike' | null;
  handleFeedback: (type: 'like' | 'dislike' | null) => void;
  handleCopy: (text: string) => void;
  content: string;
  copiedText: string | null;
  isLast: boolean | undefined;
  onSpeech: () => void;
  isSpeaking: boolean;
  isSpeechLoading?: boolean;
  onShowDetails: () => void;
  hideActions?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isTemporary,
  localFeedback,
  handleFeedback,
  handleCopy,
  content,
  copiedText,
  isLast,
  onSpeech,
  isSpeaking,
  isSpeechLoading,
  onShowDetails,
  hideActions = false
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: mdDuration.medium4, ease: mdEasing.standard }}
      className="mt-4 flex flex-col gap-3 w-full select-none"
    >
      {!hideActions && (
        <div className="flex items-center gap-1 w-full">
        {!isTemporary && (
          <>
            <button
              onClick={() => handleFeedback(localFeedback === 'like' ? null : 'like')}
              className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
                localFeedback === 'like' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${localFeedback === 'like' ? 'FILL' : ''}`} style={{ fontVariationSettings: localFeedback === 'like' ? "'FILL' 1" : "" }}>
                thumb_up
              </span>
            </button>
            <button
              onClick={() => handleFeedback(localFeedback === 'dislike' ? null : 'dislike')}
              className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
                localFeedback === 'dislike' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${localFeedback === 'dislike' ? 'FILL' : ''}`} style={{ fontVariationSettings: localFeedback === 'dislike' ? "'FILL' 1" : "" }}>
                thumb_down
              </span>
            </button>
          </>
        )}
        <button
          onClick={() => handleCopy(content)}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {copiedText === content ? 'check' : 'content_copy'}
          </span>
        </button>

        <button
          onClick={onShowDetails}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            more_horiz
          </span>
        </button>

        <button
          onClick={onSpeech}
          disabled={isSpeechLoading}
          className={`ml-auto p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center relative ${
            isSpeaking
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md scale-105'
              : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
          } ${isSpeechLoading ? 'opacity-80' : ''}`}
          title={isSpeaking ? "Stop" : "Listen"}
        >
          {isSpeechLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
               <md-circular-progress indeterminate style={{ '--md-circular-progress-size': '36px', '--md-circular-progress-active-indicator-width': '3' }}></md-circular-progress>
            </div>
          )}
          <span className="material-symbols-outlined text-[20px]">
            {isSpeaking ? 'pause' : 'volume_up'}
          </span>
        </button>
      </div>
      )}

      {isLast && (
        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70 leading-tight">
          {t('message.warning')}
        </p>
      )}
    </motion.div>
  );
};
