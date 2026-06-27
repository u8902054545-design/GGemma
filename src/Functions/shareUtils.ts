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
 * Fetches all shared links created by the current authenticated user.
 */
export const getAllUserShares = async (): Promise<SharedChat[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('shared_chats')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user shares:', error);
    throw error;
  }
  return (data as SharedChat[]) || [];
};

/**
 * Creates a public share link (snapshot) of a chat.
 * Generates a new link every time it is called.
 */
export const createChatShare = async (
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
    .insert({
      chat_id: chatId,
      user_id: session.user.id,
      title: chatTitle || 'Shared Chat',
      messages: formattedMessages,
      created_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating chat share:', error);
    throw error;
  }
  return data as SharedChat;
};

/**
 * Deletes a specific share link by its ID.
 */
export const deleteShareById = async (shareId: string): Promise<void> => {
  const { error } = await supabase
    .from('shared_chats')
    .delete()
    .eq('id', shareId);

  if (error) {
    console.error('Error deleting share by id:', error);
    throw error;
  }
};

/**
 * Deletes all share links created by the current authenticated user.
 */
export const deleteAllUserShares = async (): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('shared_chats')
    .delete()
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting all user shares:', error);
    throw error;
  }
};

/**
 * Gets the count of public links created for a specific chat.
 */
export const getChatShareCount = async (chatId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('shared_chats')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error getting chat share count:', error);
    throw error;
  }
  return count || 0;
};

