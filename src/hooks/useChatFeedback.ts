import { useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';
import { Message } from './chatTypes';

export const useChatFeedback = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
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
  }, [setMessages]);

  return { handleFeedback };
};
