import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase, SUPABASE_ENDPOINT } from '../config';

interface ChatHistoryContextType {
  isChatHistoryEnabled: boolean;
  setChatHistoryEnabled: (enabled: boolean) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatHistoryEnabled, setIsChatHistoryEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_chat_history_enabled');
    return saved ? JSON.parse(saved) : false; // Default is false
  });

  const { user } = useAuth();

  const setChatHistoryEnabled = async (enabled: boolean) => {
    setIsChatHistoryEnabledState(enabled);
    localStorage.setItem('app_chat_history_enabled', JSON.stringify(enabled));

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            settings: { chat_history_enabled: enabled }
          }),
        });
      } catch (err) {
        console.error('Failed to sync chat history setting:', err);
      }
    }
  };

  useEffect(() => {
    const syncSetting = async () => {
      if (!user) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await response.json();
        if (data && data.chat_history_enabled !== undefined) {
           setIsChatHistoryEnabledState(data.chat_history_enabled);
           localStorage.setItem('app_chat_history_enabled', JSON.stringify(data.chat_history_enabled));
        }
      } catch (err) {
        console.error('Settings sync error:', err);
      }
    };
    syncSetting();
  }, [user]);

  return (
    <ChatHistoryContext.Provider value={{ isChatHistoryEnabled, setChatHistoryEnabled }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
