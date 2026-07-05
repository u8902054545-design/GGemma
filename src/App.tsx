import React, { useState, useCallback } from 'react';
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
import { useChatHistory } from './hooks/useChatHistory';
import { WebSearchConfirmationBottomSheet, useWebSearchConfirmation } from './components/WebSearchConfirmation';
import { SharedChatView } from './sharing/SharedChatView';
import { EditMessagePage } from './components/EditMessagePage';
import BlockedScreen from './components/BlockedScreen';
import { GeoblockDialog } from './components/GeoblockDialog';
import { BlockedAccountDialog } from './components/BlockedAccountDialog';
import { SUPABASE_ENDPOINT, supabase } from './config';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signInWithGitHub, signOut } = useAuth();
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [showGeoblockDialog, setShowGeoblockDialog] = useState(false);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  React.useEffect(() => {
    const checkIp = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json');
        if (response.ok) {
          const data = await response.json();
          if (data.country === 'RU') {
            setIsBlocked(true);
            return;
          }
        }
      } catch (err) {
        console.error('IP block check failed:', err);
      }
      setIsBlocked(false);
    };
    checkIp();

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 403) {
        try {
          const cloned = response.clone();
          const data = await cloned.json();
          if (data && data.error === 'Access denied from this location.') {
            setShowGeoblockDialog(true);
          } else if (data && data.error === 'ACCOUNT_BLOCKED') {
            await signOut();
            setShowBlockedDialog(true);
          }
        } catch (e) {
          // Not JSON or error body doesn't match
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [signOut]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSearchActive, toggleSearch, resetSearch } = useSearch();
  const { chats, loading: chatsLoading, error, refreshChats, deleteChat, togglePin } = useUserChats(user?.id);
  const [showScrollButton, setShowScrollButton] = useState(false);
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
    isTyping, isLoading, messagesEndRef, scrollContainerRef, handleSend, handleRegenerate, handleFeedback, chatId, setChatId,
    chatTitle, setChatTitle, loadChatMessages, stopRequest, snackbarMessage,
    isSnackbarOpen, setIsSnackbarOpen, models, setSnackbarMessage, exhaustedModels
  } = useChat(() => refreshChats(true), isTemporary);

  const [isRegenModelSelectorOpen, setIsRegenModelSelectorOpen] = useState(false);

  const handleRegenerateWithModelSelection = useCallback((mode: 'longer' | 'briefly' | 'no_personalization' | 'repeat') => {
    if (mode === 'repeat') {
      setIsRegenModelSelectorOpen(true);
    } else {
      handleRegenerate(mode);
    }
  }, [handleRegenerate]);

  const { isChatHistoryEnabled } = useChatHistory();
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);

  const handleApplyEdit = useCallback(async (newText: string) => {
    if (!editingMessage) return;
    const messageId = editingMessage.id;
    setEditingMessage(null);
    await handleSend(newText, isSearchActive, undefined, undefined, true, messageId);
  }, [editingMessage, handleSend, isSearchActive]);

  const handleCreateBranch = useCallback(async (aiMessageId: string) => {
    const aiIndex = messages.findIndex(m => m.id === aiMessageId);
    if (aiIndex === -1) return;
    
    // Find the user message preceding this AI message
    let userMsg = null;
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsg = messages[i];
        break;
      }
    }
    
    if (!userMsg) {
      setSnackbarMessage(language === 'ru' ? 'Не найдено сообщение пользователя для ветвления.' : 'No user message found to branch from.');
      setIsSnackbarOpen(true);
      return;
    }

    const aiMsg = messages[aiIndex];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSnackbarMessage(language === 'ru' ? 'Сессия истекла. Пожалуйста, войдите снова.' : 'Session expired. Please sign in again.');
        setIsSnackbarOpen(true);
        return;
      }

      const newChatId = crypto.randomUUID();
      const branchTitle = language === 'ru' 
        ? `Ветвь «${chatTitle}»` 
        : `The branch «${chatTitle}»`;

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'create_branch',
          new_chat_id: newChatId,
          branch_title: branchTitle,
          parent_chat_title: chatTitle,
          user_message: {
            content: userMsg.content,
            image_url: userMsg.imageUrl,
            video_url: userMsg.videoUrl,
            codes: userMsg.codes
          },
          ai_message: {
            content: aiMsg.content,
            model_name: aiMsg.modelName,
            search_used: aiMsg.searchUsed,
            search_sources: aiMsg.searchSources,
            search_enabled_by: aiMsg.searchEnabledBy
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create branch' }));
        throw new Error(errorData.error || 'Server error');
      }

      // Success! Refresh chats list, switch to the new chat, and load its messages
      await refreshChats(true);
      setChatTitle(branchTitle);
      setChatId(newChatId);
      loadChatMessages(newChatId);
      
      setSnackbarMessage(language === 'ru' ? 'Ветвь создана' : 'Branch created');
      setIsSnackbarOpen(true);

    } catch (err: any) {
      console.error('Failed to create branch:', err);
      setSnackbarMessage(language === 'ru' ? 'Не удалось создать ветвь' : 'Failed to create branch');
      setIsSnackbarOpen(true);
    }
  }, [messages, chatTitle, language, refreshChats, setChatTitle, setChatId, loadChatMessages, setSnackbarMessage, setIsSnackbarOpen]);

  React.useEffect(() => {
    if (!isChatHistoryEnabled && isTemporary) {
      setIsTemporary(false);
      clearTempMessages();
      handleCreateNewChat(setMessages, setChatId, setChatTitle, resetSearch, () => {}, () => {});
    }
  }, [isChatHistoryEnabled, isTemporary, setMessages, setChatId, setChatTitle, resetSearch]);

  useSettingsSync({ user, selectedModelId: selectedModel.id, language, theme, setSelectedModel, setLanguage, setTheme });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlChatId = params.get('chat_id');
    if (urlChatId && user && chats.length > 0) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      const foundChat = chats.find(c => c.id === urlChatId);
      if (foundChat) {
        setChatTitle(foundChat.title);
      }
      loadChatMessages(urlChatId);
    }
  }, [user, chats, isChatHistoryEnabled, loadChatMessages, setChatTitle]);

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

  const executeSend = useCallback(async (text?: string, isSearch?: boolean, file?: File, codes?: any[]) => {
    let finalInput = text || input;
    const targetCodes = codes !== undefined ? codes : importedCodes;
    if (targetCodes && targetCodes.length > 0) {
      const codesMarkdown = targetCodes.map(c => `File: ${c.filename}\n\`\`\`\n${c.code}\n\`\`\``).join('\n\n');
      finalInput = finalInput ? `${finalInput}\n\n${codesMarkdown}` : codesMarkdown;
    }
    await handleSend(finalInput, isSearch, file);
    setImportedCodes([]);
    if (isSearch) {
      resetSearch();
    }
  }, [input, handleSend, resetSearch, importedCodes]);

  const {
    isOpen: isSearchConfirmOpen,
    setIsOpen: setIsSearchConfirmOpen,
    checkAndSend,
    handleConfirm: handleSearchConfirm,
    handleDecline: handleSearchDecline
  } = useWebSearchConfirmation(
    messages,
    isSearchActive,
    () => {
      if (!isSearchActive) toggleSearch();
    },
    executeSend
  );

  const handleCustomSend = async (text?: string, isSearch?: boolean, file?: File, codes?: any[]) => {
    if (!isChatHistoryEnabled && chats.some(c => c.id === chatId)) {
      setSnackbarMessage(t('errors.historyDisabled.send'));
      setIsSnackbarOpen(true);
      return;
    }

    await checkAndSend(text, isSearch, file, codes);
  };

  const pathname = window.location.pathname;
  const isSharedRoute = pathname.startsWith('/shared/') || pathname.startsWith('/share/');
  const shareId = isSharedRoute ? pathname.split('/').pop() : null;

  if (isSharedRoute && shareId) {
    return (
      <SharedChatView 
        shareId={shareId} 
        onImportSuccess={(newChatId) => {
          window.location.href = `/?chat_id=${newChatId}`;
        }} 
      />
    );
  }

  if (isBlocked === null || authLoading) return <div className="h-screen w-full bg-[var(--md-sys-color-background)]" />;

  if (isBlocked) return <BlockedScreen />;

  return (
    <div className="h-screen w-full bg-[var(--md-sys-color-background)] overflow-hidden relative">
      <ThemeTransition />
      <AnimatePresence>
        {!user && (
          <motion.div key="login-screen" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-[200] bg-[var(--md-sys-color-background)]">
            <Login 
              onLoginGoogle={signInWithGoogle} 
              onLoginGitHub={signInWithGitHub} 
              isAccountBlocked={showBlockedDialog}
              onCloseBlocked={() => setShowBlockedDialog(false)}
            />
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
              error={error}
              onRefresh={() => refreshChats(false)}
              currentChatId={chatId}
              onChatSelect={(id) => {
                if (!isChatHistoryEnabled) {
                  setSnackbarMessage(t('errors.historyDisabled.chat'));
                  setIsSnackbarOpen(true);
                  return;
                }
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
              setSnackbarMessage={setSnackbarMessage}
              setIsSnackbarOpen={setIsSnackbarOpen}
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
                setSnackbarMessage={setSnackbarMessage}
                setIsSnackbarOpen={setIsSnackbarOpen}
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
                  handleRegenerate={handleRegenerateWithModelSelection}
                  isSearchActive={isSearchActive}
                  handleFeedback={handleFeedback}
                  handleImagePreview={handleImagePreview}
                  setFullscreenImage={setFullscreenImage}
                  onVideoClick={setPreviewVideoUrl}
                  messagesEndRef={messagesEndRef}
                  onEditClick={(id, content) => setEditingMessage({ id, content })}
                  parentChatTitle={chats.find(c => c.id === chatId)?.parent_chat_title}
                  onCreateBranch={handleCreateBranch}
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
                messages={messages}
                setSnackbarMessage={setSnackbarMessage}
                setIsSnackbarOpen={setIsSnackbarOpen}
              />
            </div>
          </motion.div>

          <GemmaBottomSheet isOpen={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen} selectedModel={selectedModel} onModelSelect={setSelectedModel} models={models} exhaustedModels={exhaustedModels} />
          <GemmaBottomSheet 
            isOpen={isRegenModelSelectorOpen} 
            onOpenChange={setIsRegenModelSelectorOpen} 
            selectedModel={selectedModel} 
            onModelSelect={(model) => {
              setSelectedModel(model);
              handleRegenerate('repeat', model);
            }} 
            models={models} 
            exhaustedModels={exhaustedModels} 
          />

          <WebSearchConfirmationBottomSheet
            isOpen={isSearchConfirmOpen}
            onOpenChange={setIsSearchConfirmOpen}
            onConfirm={handleSearchConfirm}
            onDecline={handleSearchDecline}
          />

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

          <EditMessagePage
            isOpen={editingMessage !== null}
            initialText={editingMessage?.content || ''}
            onClose={() => setEditingMessage(null)}
            onApply={handleApplyEdit}
          />

          <GeoblockDialog
            isOpen={showGeoblockDialog}
            onConfirm={() => {
              setShowGeoblockDialog(false);
              setIsBlocked(true);
            }}
          />
        </>
      )}
    </div>
  );
}
