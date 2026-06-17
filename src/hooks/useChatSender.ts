import { useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';
import { Message, ImportedCode } from './chatTypes';
import { saveTempMessages } from '../TemporaryChat/temporaryStorage';
import { processImage, updateChatTitle } from './useChatSenderUtils';
import { useChatHistory } from './useChatHistory';

interface SelectedModel {
  id: string;
  name: string;
}

export const useChatSender = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  input: string,
  setInput: (val: string) => void,
  selectedModel: SelectedModel,
  chatId: string,
  isTyping: boolean,
  setIsTyping: (val: boolean) => void,
  createSignal: () => AbortSignal,
  scrollToBottom: () => void,
  scrollToMessageTop: (messageId: string) => void,
  setSnackbarMessage: (msg: string) => void,
  setIsSnackbarOpen: (open: boolean) => void,
  onNewChatCreated?: () => void,
  setChatTitle?: (title: string) => void,
  isTemporary: boolean = false
) => {
  const { isChatHistoryEnabled } = useChatHistory();

  const handleSend = useCallback(async (
    overrideInput?: string, 
    isSearchActive: boolean = false, 
    file?: File,
    codes?: ImportedCode[]
  ) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if ((!textToSend.trim() && !file && (!codes || codes.length === 0)) || isTyping) return;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!isTemporary && !accessToken) {
      setSnackbarMessage('Session expired. Please sign in again.');
      setIsSnackbarOpen(true);
      return;
    }

    const isFirstMessage = messages.length === 0;
    const userText = textToSend.trim();
    const currentVoice = localStorage.getItem('selected_voice') || 'Zephyr';

    let base64Image = '';
    let base64Video = '';
    let localMediaUrl = '';

    if (file) {
      const processed = await processImage(file);
      if (file.type.startsWith('video/')) {
        base64Video = processed.base64;
      } else {
        base64Image = processed.base64;
      }
      localMediaUrl = processed.localUrl;
    }

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      imageUrl: file && !file.type.startsWith('video/') ? localMediaUrl : undefined,
      videoUrl: file && file.type.startsWith('video/') ? localMediaUrl : undefined,
      codes: codes,
      voice: currentVoice
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    if (isTemporary) saveTempMessages(updatedMessages);

    setInput('');
    setIsTyping(true);

    requestAnimationFrame(() => {
      scrollToMessageTop(newUserMsg.id);
    });

    const aiMsgId = crypto.randomUUID();
    const newAiMsg: Message = { id: aiMsgId, role: 'ai', content: '', voice: currentVoice };
    setMessages(prev => [...prev, newAiMsg]);

    try {
      const signal = createSignal();
      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-message-id': aiMsgId,
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal,
        body: JSON.stringify({
          message: userText,
          publicModelName: selectedModel.name,
          chat_id: isTemporary ? `temp_${chatId}` : chatId,
          isSearchActive: isSearchActive,
          image: base64Image || null,
          video: base64Video || null,
          codes: codes || null,
          isTemporary: isTemporary || !isChatHistoryEnabled,
          history: (isTemporary || !isChatHistoryEnabled) ? updatedMessages : undefined,
          voice: currentVoice
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const modelNameFromServer = response.headers.get('x-model-name') || selectedModel.name;
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (!reader) throw new Error('ReadableStream not supported');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].id === aiMsgId) {
            newMessages[lastIdx] = { ...newMessages[lastIdx], content: accumulatedContent, modelName: modelNameFromServer };
            if (isTemporary) saveTempMessages(newMessages);
          }
          return newMessages;
        });
      }

      if (isFirstMessage && !isTemporary) {
        await updateChatTitle(chatId, setChatTitle, onNewChatCreated);
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
        setSnackbarMessage(error.message);
        setIsSnackbarOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom, scrollToMessageTop, messages, onNewChatCreated, setMessages, setInput, setIsTyping, setSnackbarMessage, setIsSnackbarOpen, setChatTitle, isTemporary]);

  return { handleSend };
};
