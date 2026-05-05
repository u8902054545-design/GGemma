import { KeyboardEvent } from 'react';

export const handleKeyDownEvent = (
  e: KeyboardEvent,
  handleSend: (text?: string, search?: boolean) => void,
  isSearchActive: boolean
) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend(undefined, isSearchActive);
  }
};
