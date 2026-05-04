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
  onNewChatCreated?: () => void,
  setChatTitle?: (title: string) => void
) => {
  const handleSend = useCallback(async (overrideInput?: string, isSearchActive: boolean = false, file?: File) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if ((!textToSend.trim() && !file) || isTyping) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setSnackbarMessage('Session expired. Please sign in again.');
      setIsSnackbarOpen(true);
      return;
    }

    const isFirstMessage = messages.length === 0;
    const userText = textToSend.trim();

    let base64Image = '';
    let localImageUrl = '';

    if (file) {
      localImageUrl = URL.createObjectURL(file);
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      imageUrl: localImageUrl
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    scrollToBottom();

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
          isSearchActive: isSearchActive,
          image: base64Image || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const modelNameFromServer = response.headers.get('x-model-name') || selectedModel;
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
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].id === aiMsgId) {
            newMessages[lastIdx] = {
              ...newMessages[lastIdx],
              content: accumulatedContent,
              modelName: modelNameFromServer
            };
          }
          return newMessages;
        });
      }

      if (isFirstMessage && onNewChatCreated) {
        onNewChatCreated();
        if (setChatTitle) {
          setTimeout(async () => {
            const { data } = await supabase
              .from('chats')
              .select('title')
              .eq('id', chatId)
              .maybeSingle();
            if (data?.title) setChatTitle(data.title);
          }, 1500);
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: m.content } : m));
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
        setSnackbarMessage(error.message);
        setIsSnackbarOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom, messages.length, onNewChatCreated, setMessages, setInput, setIsTyping, setSnackbarMessage, setIsSnackbarOpen, setChatTitle]);

  return { handleSend };
};
