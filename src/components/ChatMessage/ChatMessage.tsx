import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { GemmaSkeleton } from '../GemmaSkeleton';
import { mdEasing, mdDuration } from '../../motion/transitions';
import { ChatMessageProps } from './types';
import { useMessageLogic } from './useMessageLogic';
import { ChatMessageHeader } from './ChatMessageHeader';
import { CodeBlock } from './CodeBlock';

interface ExtendedChatMessageProps extends ChatMessageProps {
  isLast?: boolean;
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
  isLast 
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
            <div className="mb-3 overflow-hidden rounded-lg">
              <img 
                src={imageUrl} 
                alt="Uploaded" 
                className="max-w-full h-auto object-contain max-h-[400px] rounded-lg"
              />
            </div>
          )}

          <div className={`text-[16px] leading-relaxed markdown-content select-text`}>
            {isAI && isGenerating && !mainContent ? (
              <div className="min-h-[40px] flex items-center">
                <GemmaSkeleton />
              </div>
            ) : (
              <div className="min-h-[1.5em]">
                {isAI ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      pre: ({ children }) => <>{children}</>,
                      code({ inline, className, children }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        return !inline && match ? (
                          <CodeBlock
                            language={match[1]}
                            value={codeString}
                            isCopied={copiedText === codeString}
                            onCopy={handleCopy}
                          />
                        ) : (
                          <code className="bg-[var(--md-sys-color-surface-container-high)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--md-sys-color-primary)]">
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => <p className="mb-4 last:mb-0 break-words">{children}</p>,
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-lg border border-[var(--md-sys-color-outline-variant)]">
                          <table className="w-full border-collapse text-sm text-left">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-[var(--md-sys-color-surface-container-high)]">{children}</thead>,
                      th: ({ children }) => <th className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)] font-semibold">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)]">{children}</td>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--md-sys-color-primary)] hover:underline">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {mainContent}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {mainContent}
                  </div>
                )}

                {isStopped && (
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
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: mdDuration.medium4, ease: mdEasing.standard }}
            className="mt-4 flex flex-col gap-3 w-full select-none"
          >
            <div className="flex items-center gap-1">
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
              <button
                onClick={() => handleCopy(mainContent)}
                className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {copiedText === mainContent ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>

            {isLast && (
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70 leading-tight">
                {modelName || 'Gemma'} is an AI and may make mistakes. Verify its responses.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
