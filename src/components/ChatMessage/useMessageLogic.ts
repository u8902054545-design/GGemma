import { useState, useMemo, useCallback } from 'react';

export const useMessageLogic = (
  content: string, 
  messageId?: string, 
  initialFeedback?: 'like' | 'dislike' | null,
  onFeedback?: (id: string, type: 'like' | 'dislike' | null) => void
) => {
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [localFeedback, setLocalFeedback] = useState<'like' | 'dislike' | null>(initialFeedback || null);

  const { thought, mainContent } = useMemo(() => {
    const thoughtMatch = content.match(/^\*([\s\S]*?)\*/);
    if (thoughtMatch) {
      const extractedThought = thoughtMatch[1].trim();
      const extractedContent = content.slice(thoughtMatch[0].length).trim();
      return {
        thought: extractedThought,
        mainContent: extractedContent
      };
    }
    return { thought: null, mainContent: content.trim() };
  }, [content]);

  const shouldShowExpandButton = useMemo(() => {
    return mainContent.length > 1000;
  }, [mainContent]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  const handleFeedback = useCallback((type: 'like' | 'dislike' | null) => {
    if (!messageId || !onFeedback) return;
    setLocalFeedback(type);
    onFeedback(messageId, type);
  }, [messageId, onFeedback]);

  return {
    isThoughtExpanded,
    setIsThoughtExpanded,
    isContentExpanded,
    setIsContentExpanded,
    shouldShowExpandButton,
    copiedText,
    handleCopy,
    thought,
    mainContent,
    localFeedback,
    handleFeedback
  };
};
