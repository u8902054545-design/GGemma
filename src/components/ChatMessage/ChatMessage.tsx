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
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/icon/icon.js';

interface ExtendedChatMessageProps extends ChatMessageProps {
  isLast?: boolean;
  onImageClick?: (url: string) => void;
  onVideoClick?: (url: string) => void;
  isTemporary?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  codes?: ImportedCode[];
  isSearching?: boolean;
  onRegenerate?: (mode: 'longer' | 'briefly' | 'no_personalization' | 'repeat') => void;
  isLastUserMessage?: boolean;
  onEditClick?: (messageId: string, content: string) => void;
  parentChatTitle?: string;
  onCreateBranch?: (messageId: string) => void;
  userHasImage?: boolean;
  userHasVideo?: boolean;
  isTranslationActive?: boolean;
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
  isAnalyzingImage,
  isAnalyzingVideo,
  searchSources,
  hideActions = false,
  onRegenerate,
  isLastUserMessage = false,
  onEditClick,
  parentChatTitle,
  onCreateBranch,
  userHasImage,
  userHasVideo,
  isTranslationActive
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

  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuDirection, setMenuDirection] = React.useState<'down' | 'up'>('down');
  const menuRef = React.useRef<any>(null);
  const timerRef = React.useRef<any>(null);

  React.useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const handleClosed = () => setMenuOpen(false);
    menu.addEventListener('closed', handleClosed);
    return () => {
      menu.removeEventListener('closed', handleClosed);
    };
  }, []);

  React.useEffect(() => {
    if (menuOpen) {
      const bubble = document.getElementById(`msg-bubble-${messageId}`);
      if (bubble) {
        const rect = bubble.getBoundingClientRect();
        const threshold = window.innerHeight - 250;
        if (rect.bottom > threshold) {
          setMenuDirection('up');
        } else {
          setMenuDirection('down');
        }
      }
    }
  }, [menuOpen, messageId]);

  React.useEffect(() => {
    if (!menuOpen) return;
    let active = true;
    const handleDocumentClick = (e: MouseEvent) => {
      if (!active) return;
      const menu = menuRef.current;
      if (menu && !menu.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const timer = setTimeout(() => {
      if (active) {
        document.addEventListener('click', handleDocumentClick);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [menuOpen]);

  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    if (isAI) return;
    e.preventDefault();
    setMenuOpen(true);
  }, [isAI]);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (isAI) return;
    if (e.button !== 0) return; // Only primary clicks
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setMenuOpen(true);
    }, 600);
  }, [isAI]);

  const handlePointerUp = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePointerMove = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleCopyAction = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    handleCopy(mainContent);
  }, [handleCopy, mainContent]);

  const handleEditAction = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEditClick && messageId) {
      onEditClick(messageId, mainContent);
    }
  }, [onEditClick, messageId, mainContent]);

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
          <SearchProgress statusText={t('message.search_progress')} key="search-progress" />
        )}
        {isAI && isAnalyzingImage && (
          <SearchProgress statusText={t('message.image_analysis_progress')} key="image-progress" />
        )}
        {isAI && isAnalyzingVideo && (
          <SearchProgress statusText={t('message.video_analysis_progress')} key="video-progress" />
        )}
      </AnimatePresence>

      <div className={`relative w-full flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
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

        <div 
          id={`msg-bubble-${messageId}`}
          onContextMenu={handleContextMenu}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          className={`relative transition-all duration-300 ease-in-out cursor-pointer ${
            isAI
              ? 'text-[var(--md-sys-color-on-background)] w-full'
              : 'max-w-[85%] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] px-5 py-3 rounded-[24px] rounded-tr-[4px] shadow-sm inline-block active:scale-[0.99] select-none'
          } ${!isContentExpanded && canShowExpand ? 'max-h-[300px] overflow-hidden' : 'max-h-full'}`}
        >
          <MessageMedia 
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            onImageClick={() => imageUrl && onImageClick?.(imageUrl)}
            onVideoClick={() => videoUrl && onVideoClick?.(videoUrl)}
          />

          <div className={`text-[16px] leading-relaxed markdown-content ${isAI ? 'select-text' : 'select-none'}`}>
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

        {!isAI && (
          <md-menu
            ref={menuRef}
            anchor={`msg-bubble-${messageId}`}
            open={menuOpen || undefined}
            anchorCorner={menuDirection === 'up' ? 'start-end' : 'end-end'}
            menuCorner={menuDirection === 'up' ? 'end-end' : 'start-end'}
            yOffset={menuDirection === 'up' ? -4 : 4}
            positioning="fixed"
            style={{
              '--md-menu-container-color': 'var(--md-sys-color-surface-container-high)',
              '--md-menu-item-label-text-color': 'var(--md-sys-color-on-surface)',
              '--md-menu-item-headline-color': 'var(--md-sys-color-on-surface)',
              'z-index': 9999
            } as any}
          >
            <md-menu-item onClick={handleCopyAction}>
              <md-icon slot="start">content_copy</md-icon>
              <div slot="headline">{t('menu.copy')}</div>
            </md-menu-item>
            {isLastUserMessage && (
              <md-menu-item onClick={handleEditAction}>
                <md-icon slot="start">edit</md-icon>
                <div slot="headline">{t('menu.edit')}</div>
              </md-menu-item>
            )}
          </md-menu>
        )}

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
              hideActions={hideActions}
              onRegenerate={onRegenerate}
              messageId={messageId || ''}
              parentChatTitle={parentChatTitle}
              onCreateBranch={onCreateBranch ? () => onCreateBranch(messageId || '') : undefined}
              isTranslationActive={isTranslationActive}
            />
            <GenerationDetails
              isOpen={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              modelName={modelName}
              searchUsed={searchUsed}
              imageUsed={userHasImage}
              videoUsed={userHasVideo}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
