import { useState, useEffect } from 'react';
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
    onNewChatCreated
  );

  useEffect(() => {
    let interval: any;
    if (messages.length > 0 && !chatTitle) {
      const fetchTitle = async () => {
        const { data } = await supabase
          .from('chats')
          .select('title')
          .eq('id', chatId)
          .maybeSingle();
        if (data?.title) {
          setChatTitle(data.title);
          if (onNewChatCreated) onNewChatCreated();
          if (interval) clearInterval(interval);
        }
      };
      interval = setInterval(fetchTitle, 3000);
      fetchTitle();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatId, messages.length, chatTitle, onNewChatCreated]);

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
    stopRequest
  };
};
