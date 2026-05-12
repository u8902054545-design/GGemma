import { Message } from '../hooks/chatTypes';

const TEMP_STORAGE_KEY = 'gemma_temp_chat_history';

export const saveTempMessages = (messages: Message[]) => {
  try {
    sessionStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save temporary chat:', error);
  }
};

export const getTempMessages = (): Message[] => {
  try {
    const saved = sessionStorage.getItem(TEMP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load temporary chat:', error);
    return [];
  }
};

export const clearTempMessages = () => {
  sessionStorage.removeItem(TEMP_STORAGE_KEY);
};
