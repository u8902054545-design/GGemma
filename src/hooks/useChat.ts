import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_ENDPOINT } from '../config';
import { useStopRequest } from './useStopRequest';
import { Message, MODELS, SelectedModel } from './chatTypes';
import { useChatScroll } from './useChatScroll';
import { useChatFeedback } from './useChatFeedback';
import { useChatLoader } from './useChatLoader';
import { useChatSender } from './useChatSender';
import { useLanguage } from './useLanguage';

export const useChat = (onNewChatCreated?: () => void, isTemporary: boolean = false) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModelState] = useState(MODELS[0]);

  const setSelectedModel = useCallback(async (model: SelectedModel) => {
    setSelectedModelState(model);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            settings: {
              selected_model_id: model.id,
              selected_model_name: model.name
            }
          }),
        });
      }
    } catch (err) {
      console.error('Failed to sync model settings:', err);
    }
  }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [exhaustedModels, setExhaustedModels] = useState<string[]>([]);
  const { t } = useLanguage();

  const refreshLimits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`${SUPABASE_ENDPOINT}?type=limits`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExhaustedModels(data.exhausted || []);
      }
    } catch (err) {
      console.error('Error fetching model limits:', err);
    }
  }, []);

  useEffect(() => {
    if (exhaustedModels.includes(selectedModel.id)) {
      const fallbackOrder = ['Gemma 4 31B', 'Gemma 4 26B', 'Gemma 3 27B', 'Gemma 3 12B'];
      const currentIdx = fallbackOrder.indexOf(selectedModel.id);
      if (currentIdx !== -1) {
        for (let i = currentIdx + 1; i < fallbackOrder.length; i++) {
          const fallbackId = fallbackOrder[i];
          if (!exhaustedModels.includes(fallbackId)) {
            const fallbackModel = MODELS.find(m => m.id === fallbackId);
            if (fallbackModel) {
              setSelectedModel(fallbackModel);
              const warningText = t('model.limit.exceeded')
                .replace('{model}', selectedModel.name)
                .replace('{fallback}', fallbackModel.name);
              setSnackbarMessage(warningText);
              setIsSnackbarOpen(true);
              break;
            }
          }
        }
      }
    }
  }, [exhaustedModels, selectedModel, setSelectedModel, t, setSnackbarMessage, setIsSnackbarOpen]);

  const { createSignal, stopRequest: internalStopRequest } = useStopRequest();
  const { messagesEndRef, scrollContainerRef, scrollToBottom, scrollToMessageTop } = useChatScroll();

  const { handleFeedback } = useChatFeedback(setMessages);

  const { loadChatMessages } = useChatLoader(
    setMessages,
    setChatId,
    setIsLoading,
    setSnackbarMessage,
    setIsSnackbarOpen,
    scrollToMessageTop
  );

  const refreshCurrentChatTitle = useCallback((allChats: any[]) => {
    const currentChat = allChats.find(c => c.id === chatId);
    if (currentChat?.title) {
      setChatTitle(currentChat.title);
    }
  }, [chatId]);

  const { handleSend } = useChatSender(
    messages,
    setMessages,
    input,
    setInput,
    selectedModel,
    chatId,
    isTyping,
    setIsTyping,
    createSignal,
    scrollToBottom,
    scrollToMessageTop,
    setSnackbarMessage,
    setIsSnackbarOpen,
    onNewChatCreated,
    setChatTitle,
    isTemporary,
    refreshLimits
  );

  const stopRequest = useCallback(() => {
    internalStopRequest(() => {
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'ai') {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + '_STOPPED_'
          };
          return newMessages;
        }
        return prev;
      });
    });
  }, [internalStopRequest]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setMessages([]);
        setInput('');
        setIsTyping(false);
        setChatId(crypto.randomUUID());
        setChatTitle('');
        setExhaustedModels([]);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        refreshLimits();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        refreshLimits();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshLimits]);

  const handleKeyDown = (e: React.KeyboardEvent, isSearchActive: boolean) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(undefined, isSearchActive);
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    selectedModel,
    setSelectedModel,
    isDropdownOpen,
    setIsDropdownOpen,
    isTyping,
    isLoading,
    messagesEndRef,
    scrollContainerRef,
    scrollToBottom,
    handleSend,
    handleKeyDown,
    chatId,
    setChatId,
    chatTitle,
    setChatTitle,
    loadChatMessages,
    handleFeedback,
    models: MODELS,
    snackbarMessage,
    setSnackbarMessage,
    isSnackbarOpen,
    setIsSnackbarOpen,
    stopRequest,
    refreshCurrentChatTitle,
    exhaustedModels,
    refreshLimits
  };
};
