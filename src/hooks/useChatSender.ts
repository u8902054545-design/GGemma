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
  isTemporary: boolean = false,
  refreshLimits?: () => void
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
      base64Image: base64Image || undefined,
      base64Video: base64Video || undefined,
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
      const searchUsedFromServer = response.headers.get('x-search-used') === 'true';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let searchTriggeredFlag = false;

      if (!reader) throw new Error('ReadableStream not supported');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });

        if (accumulatedContent.includes("[SEARCH_IN_PROGRESS]")) {
          searchTriggeredFlag = true;
        }

        let displayContent = accumulatedContent;
        let searchUsed = searchUsedFromServer;
        let isSearching = false;

        if (searchTriggeredFlag) {
          const index = displayContent.indexOf("[SEARCH_IN_PROGRESS]");
          if (index !== -1) {
            displayContent = displayContent.substring(index + 20);
          }
          
          const cleanText = displayContent
            .replace(/\[SEARCH_SOURCES:[^\]]*\]/g, "")
            .replace(/\[SEARCH_USED\]/g, "")
            .trim();
            
          if (cleanText.length === 0) {
            isSearching = true;
          }
        }

        if (displayContent.includes("[SEARCH_REQUIRED:")) {
          const index = displayContent.indexOf("[SEARCH_REQUIRED:");
          const before = displayContent.substring(0, index);
          const after = displayContent.substring(index);
          const closingIdx = after.indexOf("]");
          if (closingIdx !== -1) {
            displayContent = before + after.substring(closingIdx + 1);
          } else {
            displayContent = before;
          }
        }

        let searchSourcesList = undefined;
        if (displayContent.includes("[SEARCH_SOURCES:")) {
          const index = displayContent.indexOf("[SEARCH_SOURCES:");
          const before = displayContent.substring(0, index);
          const after = displayContent.substring(index);
          const closingIdx = after.indexOf("]");
          if (closingIdx !== -1) {
            const base64Str = after.substring(16, closingIdx);
            try {
              const decodedStr = decodeURIComponent(atob(base64Str));
              searchSourcesList = JSON.parse(decodedStr);
            } catch (e) {
              console.error("Failed to parse search sources", e);
            }
            displayContent = before + after.substring(closingIdx + 1);
          } else {
            displayContent = before;
          }
        }

        if (displayContent.endsWith("[SEARCH_USED]")) {
          displayContent = displayContent.slice(0, -13);
          searchUsed = true;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].id === aiMsgId) {
            const existingSources = newMessages[lastIdx].searchSources;
            newMessages[lastIdx] = { 
              ...newMessages[lastIdx], 
              content: displayContent, 
              modelName: modelNameFromServer,
              searchUsed: searchUsed,
              isSearching: isSearching,
              searchSources: searchSourcesList || existingSources,
              searchEnabledBy: searchUsed ? (isSearchActive ? 'user' : 'model') : undefined
            };
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
      if (refreshLimits) {
        refreshLimits();
      }
    }
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom, scrollToMessageTop, messages, onNewChatCreated, setMessages, setInput, setIsTyping, setSnackbarMessage, setIsSnackbarOpen, setChatTitle, isTemporary, refreshLimits]);

  const handleRegenerate = useCallback(async (mode?: 'longer' | 'briefly' | 'no_personalization' | 'repeat') => {
    if (isTyping || messages.length < 2) return;

    const lastAiMsg = messages[messages.length - 1];
    const userMsg = messages[messages.length - 2];

    if (lastAiMsg.role !== 'ai' || userMsg.role !== 'user') return;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!isTemporary && !accessToken) {
      setSnackbarMessage('Session expired. Please sign in again.');
      setIsSnackbarOpen(true);
      return;
    }

    const currentVoice = localStorage.getItem('selected_voice') || 'Zephyr';
    const regeneratedAiMsgId = crypto.randomUUID();
    const cleanMessages = messages.slice(0, -1);

    const newAiMsg: Message = { id: regeneratedAiMsgId, role: 'ai', content: '', voice: currentVoice };
    setMessages([...cleanMessages, newAiMsg]);

    setIsTyping(true);

    requestAnimationFrame(() => {
      scrollToMessageTop(newAiMsg.id);
    });

    try {
      const signal = createSignal();
      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-message-id': regeneratedAiMsgId,
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        signal,
        body: JSON.stringify({
          message: userMsg.content,
          publicModelName: selectedModel.name,
          chat_id: isTemporary ? `temp_${chatId}` : chatId,
          isSearchActive: userMsg.searchEnabledBy === 'user',
          image: userMsg.base64Image || null,
          video: userMsg.base64Video || null,
          codes: userMsg.codes || null,
          isTemporary: isTemporary || !isChatHistoryEnabled,
          history: (isTemporary || !isChatHistoryEnabled) 
            ? cleanMessages.slice(0, -1)
            : undefined,
          voice: currentVoice,
          isRegenerate: true,
          regenerateMode: mode || 'repeat'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const modelNameFromServer = response.headers.get('x-model-name') || selectedModel.name;
      const searchUsedFromServer = response.headers.get('x-search-used') === 'true';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let searchTriggeredFlag = false;

      if (!reader) throw new Error('ReadableStream not supported');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });

        if (accumulatedContent.includes("[SEARCH_IN_PROGRESS]")) {
          searchTriggeredFlag = true;
        }

        let displayContent = accumulatedContent;
        let searchUsed = searchUsedFromServer;
        let isSearching = false;

        if (searchTriggeredFlag) {
          const index = displayContent.indexOf("[SEARCH_IN_PROGRESS]");
          if (index !== -1) {
            displayContent = displayContent.substring(index + 20);
          }
          
          const cleanText = displayContent
            .replace(/\[SEARCH_SOURCES:[^\]]*\]/g, "")
            .replace(/\[SEARCH_USED\]/g, "")
            .trim();
            
          if (cleanText.length === 0) {
            isSearching = true;
          }
        }

        if (displayContent.includes("[SEARCH_REQUIRED:")) {
          const index = displayContent.indexOf("[SEARCH_REQUIRED:");
          const before = displayContent.substring(0, index);
          const after = displayContent.substring(index);
          const closingIdx = after.indexOf("]");
          if (closingIdx !== -1) {
            displayContent = before + after.substring(closingIdx + 1);
          } else {
            displayContent = before;
          }
        }

        let searchSourcesList = undefined;
        if (displayContent.includes("[SEARCH_SOURCES:")) {
          const index = displayContent.indexOf("[SEARCH_SOURCES:");
          const before = displayContent.substring(0, index);
          const after = displayContent.substring(index);
          const closingIdx = after.indexOf("]");
          if (closingIdx !== -1) {
            const base64Str = after.substring(16, closingIdx);
            try {
              const decodedStr = decodeURIComponent(atob(base64Str));
              searchSourcesList = JSON.parse(decodedStr);
            } catch (e) {
              console.error("Failed to parse search sources", e);
            }
            displayContent = before + after.substring(closingIdx + 1);
          } else {
            displayContent = before;
          }
        }

        if (displayContent.endsWith("[SEARCH_USED]")) {
          displayContent = displayContent.slice(0, -13);
          searchUsed = true;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].id === regeneratedAiMsgId) {
            const existingSources = newMessages[lastIdx].searchSources;
            newMessages[lastIdx] = { 
              ...newMessages[lastIdx], 
              content: displayContent, 
              modelName: modelNameFromServer,
              searchUsed: searchUsed,
              isSearching: isSearching,
              searchSources: searchSourcesList || existingSources,
              searchEnabledBy: searchUsed ? (userMsg.searchEnabledBy || 'model') : undefined
            };
            if (isTemporary) saveTempMessages(newMessages);
          }
          return newMessages;
        });
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(cleanMessages);
        setSnackbarMessage(error.message);
        setIsSnackbarOpen(true);
      }
    } finally {
      setIsTyping(false);
      if (refreshLimits) {
        refreshLimits();
      }
    }
  }, [messages, isTyping, selectedModel, chatId, createSignal, scrollToMessageTop, setMessages, setSnackbarMessage, setIsSnackbarOpen, isTemporary, refreshLimits, isChatHistoryEnabled]);

  return { handleSend, handleRegenerate };
};
