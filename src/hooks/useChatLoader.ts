import { supabase } from '../config';
import { Message } from './chatTypes';

export const useChatLoader = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setChatId: (id: string) => void,
  setIsTyping: (loading: boolean) => void,
  setSnackbarMessage: (msg: string) => void,
  setIsSnackbarOpen: (open: boolean) => void,
  scrollToBottom: () => void
) => {
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
        feedback: m.feedback,
        // Добавляем получение имени модели из базы данных
        modelName: m.model_name 
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

  return { loadChatMessages };
};
