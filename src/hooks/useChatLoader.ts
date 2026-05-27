import { supabase, SUPABASE_ENDPOINT } from '../config';
import { Message } from './chatTypes';

export const useChatLoader = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setChatId: (id: string) => void,
  setIsLoading: (loading: boolean) => void,
  setSnackbarMessage: (msg: string) => void,
  setIsSnackbarOpen: (open: boolean) => void,
  scrollToBottom: () => void
) => {
  const loadChatMessages = async (id: string) => {
    try {
      setMessages([{ id: 'loading-skeleton', role: 'ai', content: '' }]);
      setIsLoading(true);
      setChatId(id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Unauthorized');

      const response = await fetch(`${SUPABASE_ENDPOINT}?chat_id=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();

      const formattedMessages: Message[] = data.map((m: any) => ({
        id: m.id,
        role: (m.role === 'assistant' || m.role === 'ai' || m.role === 'model') ? 'ai' : 'user',
        content: m.content,
        feedback: m.feedback,
        modelName: m.model_name,
        imageUrl: m.image_url,
        videoUrl: m.video_url
      }));

      setMessages(formattedMessages);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      setMessages([]);
      setSnackbarMessage('Error loading messages');
      setIsSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { loadChatMessages };
};
