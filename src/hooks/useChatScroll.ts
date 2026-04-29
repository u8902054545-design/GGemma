import { useCallback, useRef } from 'react';

export const useChatScroll = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  return { messagesEndRef, scrollToBottom };
};
