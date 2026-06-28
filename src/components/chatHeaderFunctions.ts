import { supabase, SUPABASE_ENDPOINT } from '../config';

const getApiErrorMessage = async (response: Response, fallback: string) => {
  if (response.status === 403) {
    return 'Доступ запрещен из вашего региона.';
  }
  try {
    const data = await response.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
};

export const handleNewChat = (
  setMessages: (m: any[]) => void, 
  setChatId: (id: string) => void, 
  setChatTitle: (t: string) => void
) => {
  setMessages([]);
  setChatId(crypto.randomUUID());
  setChatTitle('');
};

export const renameChat = async (
  chatId: string, 
  newTitle: string, 
  setChatTitle: (t: string) => void
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Unauthorized');

    const response = await fetch(SUPABASE_ENDPOINT, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        chat_id: chatId, 
        new_title: newTitle 
      }),
    });

    if (!response.ok) throw new Error(await getApiErrorMessage(response, 'Failed to rename chat'));
    
    setChatTitle(newTitle);
  } catch (error) {
    console.error('Error renaming chat:', error);
    throw error;
  }
};

export const togglePinChat = async (
  chatId: string,
  isPinned: boolean,
  togglePin: (id: string, pinned: boolean) => Promise<void>
) => {
  try {
    await togglePin(chatId, isPinned);
  } catch (error) {
    console.error('Error in togglePinChat function:', error);
    throw error;
  }
};

export const downloadHistory = (messages: any[], format: 'txt' | 'json') => {
  let content = "";
  if (format === 'json') {
    content = JSON.stringify(messages, null, 2);
  } else {
    content = messages.map(m => `${m.role === 'user' ? 'Вы' : 'ИИ'}: ${m.content}`).join('\n\n');
  }
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-history.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};

export const fetchChatMessages = async (chatId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Unauthorized');

    const response = await fetch(`${SUPABASE_ENDPOINT}?chat_id=${chatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(await getApiErrorMessage(response, 'Failed to fetch messages'));

    const data = await response.json();
    return data.map((m: any) => ({
      role: (m.role === 'assistant' || m.role === 'ai' || m.role === 'model') ? 'ai' : 'user',
      content: m.content,
      image_url: m.image_url || m.imageUrl || null,
      video_url: m.video_url || m.videoUrl || null,
      codes: m.codes || null,
      created_at: m.created_at || null
    }));
  } catch (error) {
    console.error('Error fetching messages for export:', error);
    return [];
  }
};
