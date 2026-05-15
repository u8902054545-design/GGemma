import React, { useState, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useUserChats } from './hooks/useUserChats';
import { useSearch } from './hooks/useSearch';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { StartScreen } from './components/StartScreen';
import { Sidebar } from './components/Sidebar';
import Snackbar from './components/Snackbar';
import Login from './components/Login';
import { pageVariants } from './motion/transitions';
import { mainContentVariants } from './motion/drawer';
import { FullscreenImage } from './components/FullscreenImage';
import { handleScrollLogic, scrollToBottomInstant } from './Functions/scrollUtils';
import { handleChatSelection, handleCreateNewChat } from './Functions/chatUtils';
import { toggleState, closeState, handleImagePreview } from './Functions/uiUtils';
import { TemporaryChatPage } from './TemporaryChat/TemporaryChatPage';
import { clearTempMessages } from './TemporaryChat/temporaryStorage';
import { ModelSelectorPage } from './components/ModelSelectorPage';
import { modelPageVariants, mainContentBackdropVariants } from './motion/modelPageTransitions';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { isSearchActive, toggleSearch, resetSearch } = useSearch();
  
  const { chats, loading: chatsLoading, error: chatsError, refreshChats, deleteChat, togglePin } = useUserChats(user?.id);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [isTemporary, setIsTemporary] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  const {
    messages,
    setMessages,
    input,
    setInput,
    selectedModel,
    setSelectedModel,
    isTyping,
    messagesEndRef,
    handleSend,
    handleFeedback,
    chatId,
    setChatId,
    chatTitle,
    setChatTitle,
    loadChatMessages,
    stopRequest,
    snackbarMessage,
    isSnackbarOpen,
    setIsSnackbarOpen
  } = useChat(() => refreshChats(true), isTemporary);

  const isAutoGemma = useMemo(() => selectedModel.id === 'auto', [selectedModel.id]);

  const handleScroll = useCallback(() => {
    handleScrollLogic(scrollContainerRef, setShowScrollButton);
  }, []);

  const handleTemporaryToggle = () => {
    if (!isTemporary) {
      handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => {}, () => {});
      setIsTemporary(true);
    } else {
      setIsTemporary(false);
      clearTempMessages();
      handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => {}, () => {});
    }
  };

  if (authLoading) {
    return <div className="h-screen w-full bg-black" />;
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      <AnimatePresence>
        {!user && (
          <motion.div
            key="login-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[200] bg-black"
          >
            <Login onLoginSuccess={signInWithGoogle} />
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <>
          <motion.div
            variants={mainContentBackdropVariants}
            animate={isModelSelectorOpen ? "pushed" : "idle"}
            className="h-full w-full flex flex-col bg-black relative"
            style={{ willChange: 'transform' }}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => closeState(setIsSidebarOpen)}
              chats={chats}
              loading={chatsLoading}
              error={!!chatsError}
              currentChatId={chatId}
              onChatSelect={(id) => {
                if (isTemporary) clearTempMessages();
                setIsTemporary(false);
                handleChatSelection(id, chats, setChatTitle, loadChatMessages, () => closeState(setIsSidebarOpen));
              }}
              onNewChat={() => {
                if (isTemporary) clearTempMessages();
                setIsTemporary(false);
                handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => closeState(setIsSidebarOpen), () => refreshChats(false));
              }}
              deleteChatFromDB={deleteChat}
              setChatTitle={setChatTitle}
              togglePin={togglePin}
            />

            <motion.div
              variants={mainContentVariants}
              initial="closed"
              animate={isSidebarOpen ? "open" : "closed"}
              className="h-full w-full flex flex-col bg-black relative shadow-2xl"
            >
              <ChatHeader
                messages={messages}
                chatTitle={isTemporary ? "Temporary Chat" : chatTitle}
                chatId={chatId}
                isPinned={chats.find(c => c.id === chatId)?.is_pinned || false}
                setMessages={setMessages}
                setChatId={setChatId}
                setChatTitle={setChatTitle}
                onMenuClick={() => toggleState(isSidebarOpen, setIsSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                deleteChatFromDB={deleteChat}
                togglePin={togglePin}
                isTemporary={isTemporary}
                onTemporaryChatClick={handleTemporaryToggle}
              />

              <div className="flex-1 relative overflow-hidden flex flex-col">
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
                          onSelectSuggestion={(text) => handleSend(text, isSearchActive)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat-content-anim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 pb-20 max-w-4xl w-full mx-auto flex flex-col"
                      >
                        {messages.map((msg, index) => (
                          <ChatMessage
                            key={msg.id}
                            messageId={msg.id}
                            role={msg.role}
                            content={msg.content}
                            imageUrl={msg.imageUrl}
                            modelName={msg.modelName}
                            feedback={msg.feedback}
                            onFeedback={handleFeedback}
                            isGenerating={isTyping && (msg.id === 'loading-skeleton' || index === messages.length - 1)}
                            isLast={index === messages.length - 1}
                            onImageClick={(url) => handleImagePreview(url, setFullscreenImage)}
                            isTemporary={isTemporary}
                          />
                        ))}
                        <div ref={messagesEndRef} className="h-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>

                <AnimatePresence>
                  {showScrollButton && messages.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scrollToBottomInstant(messagesEndRef)}
                      className="absolute bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e1e] border border-[#444746] text-[#a8c7fa] shadow-2xl hover:bg-[#282a2d] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">
                        arrow_downward
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                stopRequest={stopRequest}
                selectedModel={selectedModel}
                isTyping={isTyping}
                isSearchActive={isSearchActive}
                onSearchClick={toggleSearch}
                onImageClick={(url) => handleImagePreview(url, setFullscreenImage)}
                onModelConfigClick={() => setIsModelSelectorOpen(true)}
              />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isModelSelectorOpen && (
              <motion.div
                key="model-selector-overlay"
                variants={modelPageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ willChange: 'transform' }}
                className="fixed inset-0 z-[150] bg-black"
              >
                <ModelSelectorPage
                  selectedModel={selectedModel}
                  setSelectedModel={(model) => {
                    setSelectedModel(model);
                    if (model.id !== 'auto') {
                       setIsModelSelectorOpen(false);
                    }
                  }}
                  isAutoGemma={isAutoGemma}
                  onClose={() => setIsModelSelectorOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <FullscreenImage
            src={fullscreenImage}
            isOpen={!!fullscreenImage}
            onClose={() => closeState(setFullscreenImage)}
          />

          <Snackbar
            message={snackbarMessage}
            isOpen={isSnackbarOpen}
            onClose={() => closeState(setIsSnackbarOpen)}
          />
        </>
      )}
    </div>
  );
}
