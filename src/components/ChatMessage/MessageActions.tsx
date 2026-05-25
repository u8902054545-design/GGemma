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
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isTemporary,
  localFeedback,
  handleFeedback,
  handleCopy,
  content,
  copiedText,
  isLast
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: mdDuration.medium4, ease: mdEasing.standard }}
      className="mt-4 flex flex-col gap-3 w-full select-none"
    >
      <div className="flex items-center gap-1">
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
      </div>

      {isLast && (
        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70 leading-tight">
          {t('message.warning')}
        </p>
      )}
    </motion.div>
  );
};
