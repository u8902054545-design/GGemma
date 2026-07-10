import { useState, useCallback, useRef } from 'react';
import { Message } from '../../hooks/chatTypes';

interface PendingSend {
  text?: string;
  isSearch?: boolean;
  file?: File;
  codes?: any[];
  isTranslationActive?: boolean;
  translationInputLang?: string;
  translationOutputLang?: string;
}

export const useWebSearchConfirmation = (
  messages: Message[],
  isSearchActive: boolean,
  onEnableSearch: () => void,
  onSend: (
    text?: string,
    isSearch?: boolean,
    file?: File,
    codes?: any[],
    isTranslationActive?: boolean,
    translationInputLang?: string,
    translationOutputLang?: string
  ) => Promise<void>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const pendingSendRef = useRef<PendingSend | null>(null);

  const checkAndSend = useCallback(async (
    text?: string,
    isSearch?: boolean,
    file?: File,
    codes?: any[],
    isTranslationActive?: boolean,
    translationInputLang?: string,
    translationOutputLang?: string
  ) => {
    // Find the last AI message in the current chat
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai');
    const wasPreviousManualSearch = !!(lastAiMessage?.searchUsed && lastAiMessage?.searchEnabledBy === 'user');

    // If the previous request used manual search, and current search is not active, prompt the user.
    // Also check that we are not already trying to send a search (isSearch argument isn't true).
    if (wasPreviousManualSearch && !isSearchActive && !isSearch) {
      pendingSendRef.current = { text, isSearch, file, codes, isTranslationActive, translationInputLang, translationOutputLang };
      setIsOpen(true);
      return;
    }

    // Otherwise, send immediately
    await onSend(text, isSearch, file, codes, isTranslationActive, translationInputLang, translationOutputLang);
  }, [messages, isSearchActive, onSend]);

  const handleConfirm = useCallback(async () => {
    setIsOpen(false);
    if (pendingSendRef.current) {
      const { text, file, codes, isTranslationActive, translationInputLang, translationOutputLang } = pendingSendRef.current;
      pendingSendRef.current = null;
      // Enable search manually in the UI
      onEnableSearch();
      // Send message with search=true
      await onSend(text, true, file, codes, isTranslationActive, translationInputLang, translationOutputLang);
    }
  }, [onEnableSearch, onSend]);

  const handleDecline = useCallback(async () => {
    setIsOpen(false);
    if (pendingSendRef.current) {
      const { text, file, codes, isTranslationActive, translationInputLang, translationOutputLang } = pendingSendRef.current;
      pendingSendRef.current = null;
      // Send message with search=false
      await onSend(text, false, file, codes, isTranslationActive, translationInputLang, translationOutputLang);
    }
  }, [onSend]);

  return {
    isOpen,
    setIsOpen,
    checkAndSend,
    handleConfirm,
    handleDecline
  };
};
