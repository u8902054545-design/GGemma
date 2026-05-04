import React, { useState, useRef, useCallback } from 'react';
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

export default function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSearchActive, toggleSearch, resetSearch } = useSearch();
  const { chats, loading: chatsLoading, error: chatsError, refreshChats, deleteChat } = useUserChats(user?.id);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    input,
    setInput,
    selectedModel,
    setSelectedModel,
    isDropdownOpen,
    setIsDropdownOpen,
    isTyping,
    messagesEndRef,
    handleSend,
    handleKeyDown,
    handleFeedback,
    models,
    snackbarMessage,
    isSnackbarOpen,
    setIsSnackbarOpen,
    chatId,
    setChatId,
    chatTitle,
    setChatTitle,
    loadChatMessages,
    stopRequest
  } = useChat(refreshChats);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const scrollBottom = scrollHeight - clientHeight - scrollTop;
      setShowScrollButton(scrollBottom > 300);
    }
  }, []);

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading) {
    return <div className="h-screen w-full bg-black" />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="login-screen"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-screen w-full bg-black overflow-hidden"
        >
          <Login onLoginSuccess={signInWithGoogle} />
        </motion.div>
      ) : (
        <div className="h-screen w-full bg-black overflow-hidden relative">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            chats={chats}
            loading={chatsLoading}
            error={!!chatsError}
            currentChatId={chatId}
            onChatSelect={(id) => {
              const selectedChat = chats.find(c => c.id === id);
              if (selectedChat) {
                setChatTitle(selectedChat.title);
              }
              loadChatMessages(id);
              closeSidebar();
            }}
            onNewChat={() => {
              setMessages([]);
              setChatId(crypto.randomUUID());
              setChatTitle('');
              resetSearch();
              closeSidebar();
              refreshChats();
            }}
          />

          <motion.div
            variants={mainContentVariants}
            initial="closed"
            animate={isSidebarOpen ? "open" : "closed"}
            className="h-full w-full flex flex-col bg-black relative shadow-2xl"
          >
            <ChatHeader
              messages={messages}
              chatTitle={chatTitle}
              chatId={chatId}
              setMessages={setMessages}
              setChatId={setChatId}
              setChatTitle={setChatTitle}
              onMenuClick={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              deleteChatFromDB={deleteChat}
            />

            <div className="flex-1 relative overflow-hidden flex flex-col">
              <main
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto w-full mx-auto flex flex-col scroll-smooth"
              >
                <AnimatePresence mode="wait">
                  {messages.length === 0 ? (
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
                          onImageClick={(url) => {
                            if (url) setFullscreenImage(url);
                          }}
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
                    onClick={scrollToBottomInstant}
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
              setSelectedModel={setSelectedModel}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              isTyping={isTyping}
              models={models}
              isSearchActive={isSearchActive}
              onSearchClick={toggleSearch}
              onImageClick={(url) => {
                if (url) setFullscreenImage(url);
              }}
            />
          </motion.div>

          <FullscreenImage
            src={fullscreenImage}
            isOpen={!!fullscreenImage}
            onClose={() => setFullscreenImage(null)}
          />

          <Snackbar
            message={snackbarMessage}
            isOpen={isSnackbarOpen}
            onClose={() => setIsSnackbarOpen(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
