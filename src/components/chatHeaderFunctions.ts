import { supabase, SUPABASE_ENDPOINT } from '../config';

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

    if (!response.ok) throw new Error('Failed to rename chat');
    
    setChatTitle(newTitle);
  } catch (error) {
    console.error('Error renaming chat:', error);
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
