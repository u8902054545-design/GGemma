import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config';
import { useStopRequest } from './useStopRequest';
import { Message, MODELS } from './chatTypes';
import { useChatScroll } from './useChatScroll';
import { useChatFeedback } from './useChatFeedback';
import { useChatLoader } from './useChatLoader';
import { useChatSender } from './useChatSender';

export const useChat = (onNewChatCreated?: () => void, isTemporary: boolean = false) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const { createSignal, stopRequest: internalStopRequest } = useStopRequest();
  const { messagesEndRef, scrollToBottom } = useChatScroll();

  const { handleFeedback } = useChatFeedback(setMessages);

  const { loadChatMessages } = useChatLoader(
    setMessages,
    setChatId,
    setIsLoading,
    setSnackbarMessage,
    setIsSnackbarOpen,
    scrollToBottom
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
    setSnackbarMessage,
    setIsSnackbarOpen,
    onNewChatCreated,
    setChatTitle,
    isTemporary
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
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    refreshCurrentChatTitle
  };
};
