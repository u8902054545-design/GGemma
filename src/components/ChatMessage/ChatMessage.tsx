import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TypingAnimation } from './TypingAnimation';
import { mdEasing, mdDuration } from '../../motion/transitions';
import { ChatMessageProps } from './types';
import { useMessageLogic } from './useMessageLogic';
import { ChatMessageHeader } from './ChatMessageHeader';
import { MarkdownContent } from './MarkdownContent';
import { MessageActions } from './MessageActions';
import { GenerationDetails } from './GenerationDetails';
import { ImportedCode } from '../../hooks/chatTypes';
import { MessageMedia } from './MessageMedia';
import { StoppedIndicator } from './StoppedIndicator';
import { ExpandButton } from './ExpandButton';
import { ImportedCodes } from './ImportedCodes';
import { SearchProgress } from './SearchProgress';
import { SearchSources } from './SearchSources';

interface ExtendedChatMessageProps extends ChatMessageProps {
  isLast?: boolean;
  onImageClick?: (url: string) => void;
  onVideoClick?: (url: string) => void;
  isTemporary?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  codes?: ImportedCode[];
  isSearching?: boolean;
}

const ChatMessageComponent: React.FC<ExtendedChatMessageProps> = ({
  role,
  content,
  imageUrl,
  videoUrl,
  codes,
  modelName,
  isGenerating,
  messageId,
  feedback,
  onFeedback,
  isLast,
  onImageClick,
  onVideoClick,
  isTemporary = false,
  searchUsed,
  isSearching,
  searchSources
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
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
    isSpeaking,
    isLoading
  } = useMessageLogic(cleanContent, messageId, feedback, onFeedback);

  const canShowExpand = !isAI && shouldShowExpandButton;

  return (
    <motion.div
      id={`msg-${messageId}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: mdDuration.medium1, ease: mdEasing.decelerate }}
      className={`flex flex-col mb-8 ${isAI ? 'items-start w-full' : 'items-end'}`}
    >
      {isAI && (
        <ChatMessageHeader
          hasThought={!!thought}
          isExpanded={isThoughtExpanded}
          onToggleThought={() => setIsThoughtExpanded(!isThoughtExpanded)}
        />
      )}

      <AnimatePresence mode="wait">
        {isAI && isSearching && (
          <SearchProgress />
        )}
      </AnimatePresence>

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
          <MessageMedia 
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            onImageClick={() => imageUrl && onImageClick?.(imageUrl)}
            onVideoClick={() => videoUrl && onVideoClick?.(videoUrl)}
          />

          <div className={`text-[16px] leading-relaxed markdown-content select-text`}>
            {isAI && isGenerating && !mainContent ? (
              <div className="min-h-[40px] flex items-center">
                <TypingAnimation />
              </div>
            ) : (
              <MarkdownContent
                content={mainContent}
                isAI={isAI}
                copiedText={copiedText}
                handleCopy={handleCopy}
              />
            )}

            <ImportedCodes codes={codes || []} />
            
            {isAI && isStopped && <StoppedIndicator />}
          </div>

          {!isContentExpanded && canShowExpand && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--md-sys-color-background)] to-transparent pointer-events-none" />
          )}
        </div>

        {isAI && (
          <SearchSources sources={searchSources} />
        )}

        {canShowExpand && (
          <ExpandButton 
            isExpanded={isContentExpanded} 
            onToggle={() => setIsContentExpanded(!isContentExpanded)} 
          />
        )}

        {isAI && !isGenerating && mainContent && (
          <>
            <MessageActions
              isTemporary={isTemporary}
              localFeedback={localFeedback}
              handleFeedback={handleFeedback}
              handleCopy={handleCopy}
              content={mainContent}
              copiedText={copiedText}
              isLast={isLast}
              onSpeech={handleSpeech}
              isSpeaking={isSpeaking}
              isSpeechLoading={isLoading}
              onShowDetails={() => setIsDetailsOpen(true)}
            />
            <GenerationDetails
              isOpen={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              modelName={modelName}
              searchUsed={searchUsed}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
