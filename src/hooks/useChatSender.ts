import { useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';
import { Message } from './chatTypes';

export const useChatSender = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  input: string,
  setInput: (val: string) => void,
  selectedModel: string,
  chatId: string,
  isTyping: boolean,
  setIsTyping: (val: boolean) => void,
  createSignal: () => AbortSignal,
  scrollToBottom: () => void,
  setSnackbarMessage: (msg: string) => void,
  setIsSnackbarOpen: (open: boolean) => void,
  onNewChatCreated?: () => void
) => {
  const handleSend = useCallback(async (overrideInput?: string, isSearchActive: boolean = false) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim() || isTyping) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setSnackbarMessage('Session expired. Please sign in again.');
      setIsSnackbarOpen(true);
      return;
    }

    const isFirstMessage = messages.length === 0;
    const userText = textToSend.trim();
    
    const newUserMsg: Message = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: userText 
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(scrollToBottom, 50);

    const aiMsgId = crypto.randomUUID();
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

      if (isFirstMessage && onNewChatCreated) {
        onNewChatCreated();
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
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom, messages.length, onNewChatCreated, setMessages, setInput, setIsTyping, setSnackbarMessage, setIsSnackbarOpen]);

  return { handleSend };
};
