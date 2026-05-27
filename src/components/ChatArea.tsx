import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChatMessage } from './ChatMessage';
import { TemporaryChatPage } from '../TemporaryChat/TemporaryChatPage';
import { StartScreen } from './MainScreen/StartScreen';
import { pageVariants } from '../motion/transitions';

interface ChatAreaProps {
  messages: any[];
  isTyping: boolean;
  isTemporary: boolean;
  user: any;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  handleSend: (text: string, isSearchActive?: boolean) => void;
  isSearchActive: boolean;
  handleFeedback: (id: string, type: 'like' | 'dislike' | null) => void;
  handleImagePreview: (url: string, setFullscreenImage: (url: string | null) => void) => void;
  setFullscreenImage: (url: string | null) => void;
  onVideoClick?: (url: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages, isTyping, isTemporary, user, scrollContainerRef, handleScroll,
  handleSend, isSearchActive, handleFeedback, handleImagePreview, setFullscreenImage, 
  onVideoClick,
  messagesEndRef
}) => {
  return (
    <main
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto w-full mx-auto flex flex-col scroll-smooth"
    >
      <AnimatePresence mode="wait">
        {isTemporary && messages.length === 0 ? (
          <TemporaryChatPage key="temp-page" />
        ) : messages.length === 0 ? (
          <motion.div
            key="start-screen-anim"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            <StartScreen
              userName={user.user_metadata?.full_name || user.email}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat-content-anim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6 pb-20 max-w-[1200px] w-full mx-auto flex flex-col"
          >
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                messageId={msg.id}
                role={msg.role}
                content={msg.content}
                imageUrl={msg.imageUrl}
                videoUrl={msg.videoUrl}
                codes={msg.codes}
                modelName={msg.modelName}
                feedback={msg.feedback}
                onFeedback={handleFeedback}
                isGenerating={isTyping && (msg.id === 'loading-skeleton' || index === messages.length - 1)}
                isLast={index === messages.length - 1}
                onImageClick={(url) => handleImagePreview(url, setFullscreenImage)}
                onVideoClick={onVideoClick}
                isTemporary={isTemporary}
              />
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
