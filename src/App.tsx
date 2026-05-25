import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useUserChats } from './hooks/useUserChats';
import { useSearch } from './hooks/useSearch';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import Snackbar from './components/Snackbar';
import Login from './components/Login';
import { pageVariants } from './motion/transitions';
import { FullscreenImage } from './components/FullscreenImage';
import { handleScrollLogic, scrollToBottomInstant } from './Functions/scrollUtils';
import { handleChatSelection, handleCreateNewChat } from './Functions/chatUtils';
import { toggleState, closeState, handleImagePreview } from './Functions/uiUtils';
import { clearTempMessages } from './TemporaryChat/temporaryStorage';
import { mainContentBackdropVariants } from './motion/modelPageTransitions';
import { SUPABASE_ENDPOINT, supabase } from './config';
import { VoiceSelection } from './components/Settings/voiceSelection';
import { ChatArea } from './components/ChatArea';
import { GemmaBottomSheet } from './components/GemmaBottomSheet';
import { useLanguage } from './hooks/useLanguage';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSearchActive, toggleSearch, resetSearch } = useSearch();
  const { chats, loading: chatsLoading, refreshChats, deleteChat, togglePin } = useUserChats(user?.id);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isTemporary, setIsTemporary] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const {
    messages, setMessages, input, setInput, selectedModel, setSelectedModel,
    isTyping, messagesEndRef, handleSend, handleFeedback, chatId, setChatId,
    chatTitle, setChatTitle, loadChatMessages, stopRequest, snackbarMessage,
    isSnackbarOpen, setIsSnackbarOpen, models
  } = useChat(() => refreshChats(true), isTemporary);

  useEffect(() => {
    const syncSettings = async () => {
      if (!user) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await response.json();
        
        if (data) {
          if (data.selected_model_id && data.selected_model_id !== selectedModel.id) {
            setSelectedModel({ id: data.selected_model_id, name: data.selected_model_name || data.selected_model_id });
          }
          if (data.selected_language && data.selected_language !== language) {
            setLanguage(data.selected_language);
          }
        }
      } catch (err) { console.error('Settings sync error:', err); }
    };
    syncSettings();
  }, [user]);

  const handleScroll = useCallback(() => handleScrollLogic(scrollContainerRef, setShowScrollButton), []);

  const handleTemporaryToggle = () => {
    handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => {}, () => {});
    setIsTemporary(!isTemporary);
    if (isTemporary) clearTempMessages();
  };

  if (authLoading) return <div className="h-screen w-full bg-black" />;

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      <AnimatePresence>
        {!user && (
          <motion.div key="login-screen" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-[200] bg-black">
            <Login onLoginSuccess={signInWithGoogle} />
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <>
          <motion.div variants={mainContentBackdropVariants} animate={isModelSelectorOpen ? "pushed" : "idle"} className="h-full w-full flex flex-col bg-black relative">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => closeState(setIsSidebarOpen)}
              chats={chats}
              loading={chatsLoading}
              error={false}
              currentChatId={chatId}
              onChatSelect={(id) => {
                if (isTemporary) clearTempMessages();
                setIsTemporary(false);
                handleChatSelection(id, chats, setChatTitle, loadChatMessages, () => closeState(setIsSidebarOpen));
              }}
              onNewChat={() => {
                if (isTemporary) clearTempMessages();
                setIsTemporary(false);
                handleCreateNewChat(setMessages, setChatId as (id: string) => void, setChatTitle, resetSearch, () => closeState(setIsSidebarOpen), () => refreshChats(false));
              }}
              deleteChatFromDB={deleteChat}
              setChatTitle={setChatTitle}
              togglePin={togglePin}
            />

            <div className="h-full w-full flex flex-col bg-black relative shadow-2xl">
              <ChatHeader
                messages={messages}
                chatTitle={isTemporary ? t('chat.temporary') : chatTitle}
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
                <ChatArea
                  messages={messages}
                  isTyping={isTyping}
                  isTemporary={isTemporary}
                  user={user}
                  scrollContainerRef={scrollContainerRef}
                  handleScroll={handleScroll}
                  handleSend={handleSend}
                  isSearchActive={isSearchActive}
                  handleFeedback={handleFeedback}
                  handleImagePreview={handleImagePreview}
                  setFullscreenImage={setFullscreenImage}
                  messagesEndRef={messagesEndRef}
                />

                <AnimatePresence>
                  {showScrollButton && messages.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scrollToBottomInstant(messagesEndRef)}
                      className="absolute bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e1e] border border-[#3c4043] text-[#a8c7fa] shadow-2xl hover:bg-[#282a2d] transition-colors cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined">arrow_downward</span>
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
            </div>
          </motion.div>

          <GemmaBottomSheet
            isOpen={isModelSelectorOpen}
            onOpenChange={setIsModelSelectorOpen}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            models={models}
          />

          <AnimatePresence>
            {isVoiceSelectionOpen && (
              <VoiceSelection isOpen={isVoiceSelectionOpen} onClose={() => setIsVoiceSelectionOpen(false)} />
            )}
          </AnimatePresence>

          <FullscreenImage src={fullscreenImage} isOpen={!!fullscreenImage} onClose={() => setFullscreenImage(null)} />
          <Snackbar message={snackbarMessage} isOpen={isSnackbarOpen} onClose={() => closeState(setIsSnackbarOpen)} />
        </>
      )}
    </div>
  );
}
