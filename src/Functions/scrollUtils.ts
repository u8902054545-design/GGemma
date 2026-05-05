import { RefObject } from 'react';

export const handleScrollLogic = (
  scrollContainerRef: RefObject<HTMLDivElement>,
  setShowScrollButton: (show: boolean) => void
) => {
  if (scrollContainerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollBottom = scrollHeight - clientHeight - scrollTop;
    setShowScrollButton(scrollBottom > 300);
  }
};

export const scrollToBottomInstant = (
  messagesEndRef: RefObject<HTMLDivElement>
) => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};
