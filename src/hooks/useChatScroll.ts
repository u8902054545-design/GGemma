import { useCallback, useRef } from 'react';

export const useChatScroll = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollToMessageTop = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elTop = el.offsetTop;
      const headerHeight = 64;
      const targetScroll = Math.max(0, elTop - headerHeight);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, []);

  return { messagesEndRef, scrollContainerRef, scrollToBottom, scrollToTop, scrollToMessageTop };
};
