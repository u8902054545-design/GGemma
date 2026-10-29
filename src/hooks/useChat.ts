import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_ENDPOINT } from '../config';
import { useStopRequest } from './useStopRequest';
import { Message, MODELS, SelectedModel } from './chatTypes';
import { useChatScroll } from './useChatScroll';
import { useChatFeedback } from './useChatFeedback';
import { useChatLoader } from './useChatLoader';
import { useChatSender } from './useChatSender';
import { useLanguage } from './useLanguage';
import { usePremium } from './usePremium';

const HIERARCHY: string[] = [
  'Gemini 4 Argon',
  'Gemini 3.1 Pro Preview',
  'Gemma 4 31B',
  'Gemma 4 26B',
  'Gemma 4 12B',
  'DiffusionGemma 26B A4B IT',
  'Gemma 3 27B',
  'Gemma 3 12B',
  'Gemma 3 4B',
  'Gemma 3n E4B',
  'Gemma 2 27B',
  'Gemini 3.8 Flash',
  'Gemini 3.7 Flash',
  'Gemini 3.6 Flash',
  'Gemini 3.5 Flash',
  'Gemini 3.5 Flash Lite',
  'Gemini 3 Flash Preview',
  'Gemini 3.1 Flash Lite',
  'Gemini 3.1 Flash Lite Preview',
  'Gemini 2.5 Flash',
  'Gemini 2.5 Flash Lite',
  'Gemini 2.5 Pro'
];

export const useChat = (onNewChatCreated?: () => void, isTemporary: boolean = false) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModelState] = useState(MODELS[0]);
  const [isAllModelsExhausted, setIsAllModelsExhausted] = useState(false);

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
  const { isPremium, isModelPaid } = usePremium();

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

  const isModelUnavailable = useCallback((modelIdentifier: string) => {
    if (!modelIdentifier) return false;
    const norm = modelIdentifier.toLowerCase().trim();
    const isExhausted = exhaustedModels.some(e => e.toLowerCase().trim() === norm);
    const isRestricted = !isPremium && isModelPaid(modelIdentifier);
    return isExhausted || isRestricted;
  }, [exhaustedModels, isPremium, isModelPaid]);

  const isModelBlocked = useCallback((model: SelectedModel) => {
    if (!model) return false;
    return isModelUnavailable(model.id) || isModelUnavailable(model.name);
  }, [isModelUnavailable]);

  const findModelInList = useCallback((target: string) => {
    const norm = target.toLowerCase().trim();
    return MODELS.find(m =>
      m.id.toLowerCase().trim() === norm ||
      m.name.toLowerCase().trim() === norm
    );
  }, []);

  useEffect(() => {
    const currentBlocked = isModelBlocked(selectedModel);

    if (currentBlocked) {
      const currentIdx = HIERARCHY.findIndex(h =>
        h.toLowerCase().trim() === selectedModel.name.toLowerCase().trim() ||
        h.toLowerCase().trim() === selectedModel.id.toLowerCase().trim()
      );

      const startIndex = currentIdx !== -1 ? currentIdx + 1 : 0;
      let nextAvailableModel: SelectedModel | null = null;

      for (let i = startIndex; i < HIERARCHY.length; i++) {
        const candidateName = HIERARCHY[i];
        if (!isModelUnavailable(candidateName)) {
          const matchedModel = findModelInList(candidateName);
          if (matchedModel && !isModelBlocked(matchedModel)) {
            nextAvailableModel = matchedModel;
            break;
          }
        }
      }

      if (nextAvailableModel) {
        setIsAllModelsExhausted(false);
        setSelectedModel(nextAvailableModel);
        const warningTemplate = t('model.limit.exceeded') || 'Модель {model} исчерпана. Переключено на {fallback}.';
        const warningText = warningTemplate
          .replace('{model}', selectedModel.name)
          .replace('{fallback}', nextAvailableModel.name);
        setSnackbarMessage(warningText);
        setIsSnackbarOpen(true);
      } else {
        setIsAllModelsExhausted(true);
      }
    } else {
      setIsAllModelsExhausted(false);
    }
  }, [exhaustedModels, selectedModel, isModelBlocked, isModelUnavailable, findModelInList, setSelectedModel, t]);

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

  const { handleSend: originalHandleSend, handleRegenerate: originalHandleRegenerate } = useChatSender(
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

  const handleSend = useCallback(async (...args: Parameters<typeof originalHandleSend>) => {
    if (isAllModelsExhausted || isModelBlocked(selectedModel)) {
      setSnackbarMessage(t('errors.limit.exceeded') || 'Все доступные модели исчерпали лимит запросов.');
      setIsSnackbarOpen(true);
      return;
    }
    return originalHandleSend(...args);
  }, [isAllModelsExhausted, isModelBlocked, selectedModel, originalHandleSend, setSnackbarMessage, setIsSnackbarOpen, t]);

  const handleRegenerate = useCallback(async (...args: Parameters<typeof originalHandleRegenerate>) => {
    if (isAllModelsExhausted || isModelBlocked(selectedModel)) {
      setSnackbarMessage(t('errors.limit.exceeded') || 'Все доступные модели исчерпали лимит запросов.');
      setIsSnackbarOpen(true);
      return;
    }
    return originalHandleRegenerate(...args);
  }, [isAllModelsExhausted, isModelBlocked, selectedModel, originalHandleRegenerate, setSnackbarMessage, setIsSnackbarOpen, t]);

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
        setIsAllModelsExhausted(false);
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
    handleRegenerate,
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
    refreshLimits,
    isAllModelsExhausted
  };
};
