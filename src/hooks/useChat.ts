import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config';
import { useStopRequest } from './useStopRequest';
import { Message, MODELS } from './chatTypes';
import { useChatScroll } from './useChatScroll';
import { useChatFeedback } from './useChatFeedback';
import { useChatLoader } from './useChatLoader';
import { useChatSender } from './useChatSender';

export const useChat = (onNewChatCreated?: () => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const { createSignal, stopRequest } = useStopRequest();
  const { messagesEndRef, scrollToBottom } = useChatScroll();

  const { handleFeedback } = useChatFeedback(setMessages);

  const { loadChatMessages } = useChatLoader(
    setMessages,
    setChatId,
    setIsTyping,
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
    setChatTitle
  );

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
    isSnackbarOpen,
    setIsSnackbarOpen,
    stopRequest,
    refreshCurrentChatTitle
  };
};
