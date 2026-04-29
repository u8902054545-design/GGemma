import { useState, useRef, useEffect, useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';
import { useStopRequest } from './useStopRequest';

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  feedback?: 'like' | 'dislike' | null;
};

export const MODELS = [
  'Gemma 3 1B',
  'Gemma 3 4B',
  'Gemma 3 12B',
  'Gemma 3 27B',
  'Gemma 3n E2B',
  'Gemma 3n E4B',
  'Gemma 4 26B A4B IT',
  'Gemma 4 31B IT',
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { createSignal, stopRequest } = useStopRequest();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

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
          if (interval) clearInterval(interval);
        }
      };
      interval = setInterval(fetchTitle, 3000);
      fetchTitle();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatId, messages.length, chatTitle]);

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

  const loadChatMessages = async (id: string) => {
    try {
      setMessages([{ id: 'loading-skeleton', role: 'ai', content: '' }]);
      setIsTyping(true);
      setChatId(id);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = data.map(m => ({
        id: m.id,
        role: (m.role === 'assistant' || m.role === 'ai' || m.role === 'model') ? 'ai' : 'user',
        content: m.content,
        feedback: m.feedback
      }));

      setMessages(formattedMessages);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      setMessages([]);
      setSnackbarMessage('Error loading messages');
      setIsSnackbarOpen(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = useCallback(async (messageId: string, type: 'like' | 'dislike' | null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));

    try {
      await fetch(SUPABASE_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          feedback: type
        }),
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }, []);

  const handleSend = useCallback(async (overrideInput?: string, isSearchActive: boolean = false) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim() || isTyping) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setSnackbarMessage('Session expired. Please sign in again.');
      setIsSnackbarOpen(true);
      return;
    }

    const userText = textToSend.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(scrollToBottom, 50);

    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = { id: aiMsgId, role: 'ai', content: '' };
    setMessages(prev => [...prev, newAiMsg]);

    try {
      const signal = createSignal();
      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal,
        body: JSON.stringify({
          message: userText,
          model: selectedModel,
          chat_id: chatId,
          isSearchActive: isSearchActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      if (!reader) throw new Error('ReadableStream not supported');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages(prev => {
          if (prev.length === 0) return prev;
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.id === aiMsgId) {
            const updatedMsg = { ...lastMsg, content: accumulatedContent };
            return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.id === aiMsgId) {
            const updatedMsg = { ...lastMsg, content: lastMsg.content + '_STOPPED_' };
            return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
        });
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
        setSnackbarMessage(error.message);
        setIsSnackbarOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom]);

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
