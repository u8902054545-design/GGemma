import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GemmaSkeleton } from '../GemmaSkeleton';
import { mdEasing, mdDuration } from '../../motion/transitions';
import { ChatMessageProps } from './types';
import { useMessageLogic } from './useMessageLogic';
import { ChatMessageHeader } from './ChatMessageHeader';
import { MarkdownContent } from './MarkdownContent';
import { MessageActions } from './MessageActions';

interface ExtendedChatMessageProps extends ChatMessageProps {
  isLast?: boolean;
  onImageClick?: (url: string) => void;
  isTemporary?: boolean;
  imageUrl?: string;
}

const ChatMessageComponent: React.FC<ExtendedChatMessageProps> = ({
  role,
  content,
  imageUrl,
  modelName,
  isGenerating,
  messageId,
  feedback,
  onFeedback,
  isLast,
  onImageClick,
  isTemporary = false
}) => {
  const isAI = role === 'ai';
  const isStopped = content.includes('_STOPPED_');
  const cleanContent = content.replace('_STOPPED_', '');

  const {
    isThoughtExpanded,
    setIsThoughtExpanded,
    isContentExpanded,
    setIsContentExpanded,
    shouldShowExpandButton,
    copiedText,
    handleCopy,
    thought,
    mainContent,
    localFeedback,
    handleFeedback,
    handleSpeech,
    isSpeaking
  } = useMessageLogic(cleanContent, messageId, feedback, onFeedback);

  const canShowExpand = !isAI && shouldShowExpandButton;

  const handleImageClick = () => {
    if (imageUrl && onImageClick) {
      onImageClick(imageUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: mdDuration.short4, ease: mdEasing.decelerate }}
      className={`flex flex-col mb-8 ${isAI ? 'items-start w-full' : 'items-end'}`}
    >
      {isAI && (
        <ChatMessageHeader
          hasThought={!!thought}
          isExpanded={isThoughtExpanded}
          onToggleThought={() => setIsThoughtExpanded(!isThoughtExpanded)}
          onSpeech={handleSpeech}
          isSpeaking={isSpeaking}
          modelName={modelName}
          isGenerating={isGenerating}
        />
      )}

      <div className={`w-full flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        <AnimatePresence>
          {isAI && thought && isThoughtExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full"
            >
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] italic border-l-2 border-[var(--md-sys-color-outline)] pl-4 py-1 mb-4 select-text">
                {thought}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`relative transition-all duration-300 ease-in-out ${
            isAI
              ? 'text-[var(--md-sys-color-on-background)] w-full'
              : 'max-w-[85%] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] px-5 py-3 rounded-[24px] rounded-tr-[4px] shadow-sm inline-block'
          } ${!isContentExpanded && canShowExpand ? 'max-h-[300px] overflow-hidden' : 'max-h-full'}`}
        >
          {imageUrl && (
            <div
              className="mb-3 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            >
              <img
                src={imageUrl}
                alt="Uploaded"
                className="max-w-full h-auto object-contain max-h-[400px] rounded-lg"
                onError={(e) => console.error("Image load error:", imageUrl)}
              />
            </div>
          )}

          <div className={`text-[16px] leading-relaxed markdown-content select-text`}>
            {isAI && isGenerating && !mainContent ? (
              <div className="min-h-[40px] flex items-center">
                <GemmaSkeleton />
              </div>
            ) : (
              <MarkdownContent
                content={mainContent}
                isAI={isAI}
                copiedText={copiedText}
                handleCopy={handleCopy}
              />
            )}
            
            {isAI && isStopped && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] w-fit select-none"
              >
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
                  info
                </span>
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
                  Generation stopped by user
                </span>
              </motion.div>
            )}
          </div>

          {!isContentExpanded && canShowExpand && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--md-sys-color-background)] to-transparent pointer-events-none" />
          )}
        </div>

        {canShowExpand && (
          <button
            onClick={() => setIsContentExpanded(!isContentExpanded)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] transition-all cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isContentExpanded ? 'keyboard_control_key' : 'stat_minus_1'}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider">
              {isContentExpanded ? 'Collapse' : 'Expand'}
            </span>
          </button>
        )}

        {isAI && !isGenerating && mainContent && (
          <MessageActions
            isTemporary={isTemporary}
            localFeedback={localFeedback}
            handleFeedback={handleFeedback}
            handleCopy={handleCopy}
            content={mainContent}
            copiedText={copiedText}
            isLast={isLast}
          />
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
