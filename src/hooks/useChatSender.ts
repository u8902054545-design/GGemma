import { useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';
import { Message } from './chatTypes';
import { saveTempMessages } from '../TemporaryChat/temporaryStorage';
import { setAudioBufferCache } from '../components/ChatMessage/useSpeech';

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
  setSnackbarMessage: (msg: string) => void,
  setIsSnackbarOpen: (open: boolean) => void,
  onNewChatCreated?: () => void,
  setChatTitle?: (title: string) => void,
  isTemporary: boolean = false
) => {
  const handleSend = useCallback(async (overrideInput?: string, isSearchActive: boolean = false, file?: File) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if ((!textToSend.trim() && !file) || isTyping) return;

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
      imageUrl: localImageUrl,
      voice: currentVoice
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    if (isTemporary) {
      saveTempMessages(updatedMessages);
    }

    setInput('');
    setIsTyping(true);
    scrollToBottom();

    const aiMsgId = crypto.randomUUID();
    const newAiMsg: Message = { id: aiMsgId, role: 'ai', content: '', voice: currentVoice };
    setMessages(prev => [...prev, newAiMsg]);

    try {
      const signal = createSignal();
      const isAudioModel = selectedModel.name === 'Gemini 3.1 Flash TTS Preview';

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
          isTemporary: isTemporary,
          history: isTemporary ? updatedMessages : undefined,
          voice: currentVoice,
          isAudioOnly: isAudioModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const modelNameFromServer = response.headers.get('x-model-name') || selectedModel.name;
      const serverMessageId = response.headers.get('x-ai-message-id');

      if (isAudioModel) {
        const audioBuffer = await response.arrayBuffer();
        const userId = session?.user?.id || 'temp';
        
        const { data: { publicUrl } } = supabase.storage
          .from('chat-audio')
          .getPublicUrl(`${userId}/${serverMessageId || aiMsgId}.pcm`);

        setAudioBufferCache(publicUrl, audioBuffer);

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].id === aiMsgId) {
            newMessages[lastIdx] = {
              id: serverMessageId || aiMsgId,
              role: 'ai',
              content: publicUrl,
              modelName: modelNameFromServer,
              voice: currentVoice
            };
            if (isTemporary) {
              saveTempMessages(newMessages);
            }
          }
          return newMessages;
        });
      } else {
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
              if (isTemporary) {
                saveTempMessages(newMessages);
              }
            }
            return newMessages;
          });
        }
      }

      if (isFirstMessage && !isTemporary) {
        let attempts = 0;
        const maxAttempts = 5;

        const updateTitle = async () => {
          const { data } = await supabase
            .from('chats')
            .select('title')
            .eq('id', chatId)
            .maybeSingle();

          if (data?.title && data.title !== 'Untitled Chat') {
            if (setChatTitle) setChatTitle(data.title);
            if (onNewChatCreated) onNewChatCreated();
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(updateTitle, 1000);
          } else {
            if (onNewChatCreated) onNewChatCreated();
          }
        };

        await updateTitle();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
        setSnackbarMessage(error.message);
        setIsSnackbarOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, selectedModel, chatId, createSignal, scrollToBottom, messages, onNewChatCreated, setMessages, setInput, setIsTyping, setSnackbarMessage, setIsSnackbarOpen, setChatTitle, isTemporary]);

  return { handleSend };
};
