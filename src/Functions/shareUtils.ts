import { supabase } from '../config';

export interface SharedChat {
  id: string;
  chat_id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
}

/**
 * Fetches a public shared chat snapshot by its sharing ID.
 * Accessible by anyone (unauthenticated).
 */
export const getSharedChat = async (shareId: string): Promise<SharedChat | null> => {
  const { data, error } = await supabase
    .from('shared_chats')
    .select('*')
    .eq('id', shareId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching shared chat:', error);
    throw error;
  }
  return data as SharedChat | null;
};

/**
 * Checks if a chat is currently shared and returns the share record if it exists.
 */
export const getChatShareStatus = async (chatId: string): Promise<SharedChat | null> => {
  const { data, error } = await supabase
    .from('shared_chats')
    .select('*')
    .eq('chat_id', chatId)
    .maybeSingle();

  if (error) {
    console.error('Error checking chat share status:', error);
    throw error;
  }
  return data as SharedChat | null;
};

/**
 * Creates a public share link (snapshot) of a chat or updates an existing one.
 */
export const createOrUpdateChatShare = async (
  chatId: string,
  chatTitle: string,
  messages: any[]
): Promise<SharedChat> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Format messages to store in snapshot
  const formattedMessages = messages.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'ai',
    content: m.content,
    image_url: m.image_url || m.imageUrl || null,
    video_url: m.video_url || m.videoUrl || null,
    created_at: m.created_at || new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('shared_chats')
    .upsert({
      chat_id: chatId,
      user_id: session.user.id,
      title: chatTitle || 'Shared Chat',
      messages: formattedMessages,
      created_at: new Date().toISOString()
    }, { onConflict: 'chat_id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating/updating chat share:', error);
    throw error;
  }
  return data as SharedChat;
};

/**
 * Disables sharing for a chat by deleting its shared_chats entry.
 */
export const deleteChatShare = async (chatId: string): Promise<void> => {
  const { error } = await supabase
    .from('shared_chats')
    .delete()
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error deleting chat share:', error);
    throw error;
  }
};
