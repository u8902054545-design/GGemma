import React, { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useUserChats } from './hooks/useUserChats';
import { useSearch } from './hooks/useSearch';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import Login from './components/Login';
import { pageVariants } from './motion/transitions';
import { handleScrollLogic } from './Functions/scrollUtils';
import { handleChatSelection, handleCreateNewChat } from './Functions/chatUtils';
import { toggleState, closeState, handleImagePreview } from './Functions/uiUtils';
import { clearTempMessages } from './TemporaryChat/temporaryStorage';
import { mainContentBackdropVariants } from './motion/modelPageTransitions';
import { ChatArea } from './components/ChatArea';
import { GemmaBottomSheet } from './components/GemmaBottomSheet';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { ThemeTransition } from './motion/ThemeTransition';
import { useSettingsSync } from './hooks/useSettingsSync';
import { ScrollToBottomButton } from './components/ScrollToBottomButton';
import { AppModals } from './components/AppModals';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSearchActive, toggleSearch, resetSearch } = useSearch();
  const { chats, loading: chatsLoading, refreshChats, deleteChat, togglePin } = useUserChats(user?.id);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isTemporary, setIsTemporary] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
  const [isCodeImportOpen, setIsCodeImportOpen] = useState(false);
  const [importedCodes, setImportedCodes] = useState<any[]>([]);
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const {
    messages, setMessages, input, setInput, selectedModel, setSelectedModel,
    isTyping, isLoading, messagesEndRef, handleSend, handleFeedback, chatId, setChatId,
    chatTitle, setChatTitle, loadChatMessages, stopRequest, snackbarMessage,
    isSnackbarOpen, setIsSnackbarOpen, models
  } = useChat(() => refreshChats(true), isTemporary);

  useSettingsSync({ user, selectedModelId: selectedModel.id, language, theme, setSelectedModel, setLanguage, setTheme });

  const handleScroll = useCallback(() => handleScrollLogic(scrollContainerRef, setShowScrollButton), []);

  const handleTemporaryToggle = () => {
    handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => {}, () => {});
    setIsTemporary(!isTemporary);
    if (isTemporary) clearTempMessages();
  };

  const handleImportCode = (filename: string, code: string) => {
    const newCode = { id: crypto.randomUUID(), filename, code };
    setImportedCodes(prev => [...prev, newCode]);
    setIsCodeImportOpen(false);
  };

  const handleCustomSend = async (text?: string, isSearch?: boolean, file?: File, codes?: any[]) => {
    let finalInput = text || input;
    if (codes && codes.length > 0) {
      const codesMarkdown = codes.map(c => `File: ${c.filename}\n\`\`\`\n${c.code}\n\`\`\``).join('\n\n');
      finalInput = finalInput ? `${finalInput}\n\n${codesMarkdown}` : codesMarkdown;
    }
    await handleSend(finalInput, isSearch, file);
    setImportedCodes([]);
  };

  if (authLoading) return <div className="h-screen w-full bg-[var(--md-sys-color-background)]" />;

  return (
    <div className="h-screen w-full bg-[var(--md-sys-color-background)] overflow-hidden relative">
      <ThemeTransition />
      <AnimatePresence>
        {!user && (
          <motion.div key="login-screen" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-[200] bg-[var(--md-sys-color-background)]">
            <Login onLoginSuccess={signInWithGoogle} />
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <>
          <motion.div variants={mainContentBackdropVariants} animate={isModelSelectorOpen ? "pushed" : "idle"} className="h-full w-full flex flex-col bg-[var(--md-sys-color-background)] relative">
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

            <div className="h-full w-full flex flex-col bg-[var(--md-sys-color-background)] relative shadow-2xl">
              <ChatHeader
                messages={messages}
                chatTitle={isTemporary ? t('chat.temporary') : chatTitle}
                chatId={chatId}
                isPinned={chats.find(c => c.id === chatId)?.is_pinned || false}
                selectedModel={selectedModel}
                isModelSelectorOpen={isModelSelectorOpen}
                onModelSelectorToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                setMessages={setMessages}
                setChatId={setChatId}
                setChatTitle={setChatTitle}
                onMenuClick={() => toggleState(isSidebarOpen, setIsSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                deleteChatFromDB={deleteChat}
                togglePin={togglePin}
                isTemporary={isTemporary}
                onTemporaryChatClick={handleTemporaryToggle}
                onNewChat={() => {
                  if (isTemporary) clearTempMessages();
                  setIsTemporary(false);
                  handleCreateNewChat(setMessages, setChatId as (id: string) => void, setChatTitle, resetSearch, () => {}, () => refreshChats(false));
                }}
              />

              <div className="flex-1 relative overflow-hidden flex flex-col">
                <ChatArea
                  messages={messages}
                  isTyping={isTyping || isLoading}
                  isTemporary={isTemporary}
                  user={user}
                  scrollContainerRef={scrollContainerRef}
                  handleScroll={handleScroll}
                  handleSend={handleSend}
                  isSearchActive={isSearchActive}
                  handleFeedback={handleFeedback}
                  handleImagePreview={handleImagePreview}
                  setFullscreenImage={setFullscreenImage}
                  onVideoClick={setPreviewVideoUrl}
                  messagesEndRef={messagesEndRef}
                />

                <AnimatePresence>
                  <ScrollToBottomButton show={showScrollButton && messages.length > 0} messagesEndRef={messagesEndRef} />
                </AnimatePresence>
              </div>

              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleCustomSend}
                stopRequest={stopRequest}
                selectedModel={selectedModel}
                isTyping={isTyping}
                isSearchActive={isSearchActive}
                onSearchClick={toggleSearch}
                onCodeImportClick={() => setIsCodeImportOpen(true)}
                onImageClick={(url) => handleImagePreview(url, setFullscreenImage)}
                importedCodes={importedCodes}
                onRemoveCode={(id) => setImportedCodes(prev => prev.filter(c => c.id !== id))}
              />
            </div>
          </motion.div>

          <GemmaBottomSheet isOpen={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen} selectedModel={selectedModel} onModelSelect={setSelectedModel} models={models} />

          <AppModals 
            isVoiceSelectionOpen={isVoiceSelectionOpen}
            setIsVoiceSelectionOpen={setIsVoiceSelectionOpen}
            isCodeImportOpen={isCodeImportOpen}
            setIsCodeImportOpen={setIsCodeImportOpen}
            previewVideoUrl={previewVideoUrl}
            setPreviewVideoUrl={setPreviewVideoUrl}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
            snackbarMessage={snackbarMessage}
            isSnackbarOpen={isSnackbarOpen}
            setIsSnackbarOpen={setIsSnackbarOpen}
            handleImportCode={handleImportCode}
          />
        </>
      )}
    </div>
  );
}
