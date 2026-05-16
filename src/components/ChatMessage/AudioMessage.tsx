import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessageHeader } from './ChatMessageHeader';
import { playerVariants, iconVariants } from '../../motion/audioAnimations';

interface AudioMessageProps {
  isSpeaking: boolean;
  onSpeech: () => void;
  modelName?: string;
  hasThought?: boolean;
  isThoughtExpanded?: boolean;
  onToggleThought?: () => void;
  isGenerating?: boolean;
  localFeedback?: 'like' | 'dislike' | null;
  handleFeedback?: (type: 'like' | 'dislike' | null) => void;
  isTemporary?: boolean;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({
  isSpeaking,
  onSpeech,
  modelName,
  hasThought = false,
  isThoughtExpanded = false,
  onToggleThought = () => {},
  isGenerating = false,
  localFeedback,
  handleFeedback,
  isTemporary = false
}) => {
  return (
    <div className="flex flex-col w-full">
      <ChatMessageHeader
        hasThought={hasThought}
        isExpanded={isThoughtExpanded}
        onToggleThought={onToggleThought}
        onSpeech={onSpeech}
        isSpeaking={isSpeaking}
        modelName={modelName}
        isGenerating={isGenerating}
      />

      <motion.div
        variants={playerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 bg-[var(--md-sys-color-surface-container-high)] px-4 py-3 rounded-[24px] rounded-tl-[4px] border border-[var(--md-sys-color-outline-variant)] shadow-sm min-w-[200px] w-fit"
        style={{ willChange: 'transform, opacity' }}
      >
        <button
          onClick={onSpeech}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95 overflow-hidden relative"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isSpeaking ? 'pause' : 'play'}
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="material-symbols-outlined text-[32px] absolute"
            >
              {isSpeaking ? 'pause' : 'play_arrow'}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="flex flex-col flex-1">
          <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
            {isSpeaking ? 'Playing audio...' : 'Voice message'}
          </span>
          {modelName && (
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
              {modelName}
            </span>
          )}
        </div>

        <div className="flex items-center px-2">
          <span className={`material-symbols-outlined text-[24px] transition-opacity duration-300 ${isSpeaking ? 'text-[var(--md-sys-color-primary)] opacity-100' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-40'}`}>
            graphic_eq
          </span>
        </div>
      </motion.div>

      {!isGenerating && !isTemporary && handleFeedback && (
        <div className="mt-4 flex items-center gap-1">
          <button
            onClick={() => handleFeedback(localFeedback === 'like' ? null : 'like')}
            className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
              localFeedback === 'like' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px]`}
              style={{ fontVariationSettings: localFeedback === 'like' ? "'FILL' 1" : "" }}
            >
              thumb_up
            </span>
          </button>
          <button
            onClick={() => handleFeedback(localFeedback === 'dislike' ? null : 'dislike')}
            className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
              localFeedback === 'dislike' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px]`}
              style={{ fontVariationSettings: localFeedback === 'dislike' ? "'FILL' 1" : "" }}
            >
              thumb_down
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
