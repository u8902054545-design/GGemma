import { useState, useMemo, useCallback } from 'react';
import { useSpeech } from './useSpeech';

export const useMessageLogic = (
  content: string,
  messageId?: string,
  initialFeedback?: 'like' | 'dislike' | null,
  onFeedback?: (id: string, type: 'like' | 'dislike' | null) => void,
  modelName?: string
) => {
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [localFeedback, setLocalFeedback] = useState<'like' | 'dislike' | null>(initialFeedback || null);

  const { thought, mainContent } = useMemo(() => {
    // 1. Check if content has standard *thought*
    const thoughtMatch = content.match(/^\*([\s\S]*?)\*/);
    if (thoughtMatch) {
      const extractedThought = thoughtMatch[1].trim();
      const extractedContent = content.slice(thoughtMatch[0].length).trim();
      return {
        thought: extractedThought,
        mainContent: extractedContent
      };
    }

    // 2. Check if content starts with "thought" or "thinking" or "<thought>" block
    const hasThoughtHeader = content.match(/^(?:thought|thinking|thought:|<thought>)\s*\n/i);
    if (hasThoughtHeader) {
      const headerLength = hasThoughtHeader[0].length;
      const rest = content.slice(headerLength);
      
      // Look for the end of the thought block (either </thought>, double newline, or [SEARCH_REQUIRED:)
      const endOfThoughtMatch = rest.match(/([\s\S]*?)(?:\n\n|\n\s*\n|<\/thought>|\[SEARCH_REQUIRED:)/i);
      if (endOfThoughtMatch) {
        const thoughtContent = endOfThoughtMatch[1].trim();
        const main = rest.slice(endOfThoughtMatch[1].length).trim();
        // If main starts with </thought> or similar, strip it
        const cleanMain = main.replace(/^(?:<\/thought>|\n\n|\n\s*\n)/i, "").trim();
        return {
          thought: thoughtContent,
          mainContent: cleanMain
        };
      }
      
      // If no end of thought is found yet (still streaming), treat everything as thought
      return {
        thought: rest.trim(),
        mainContent: ""
      };
    }

    return { thought: null, mainContent: content.trim() };
  }, [content]);

  const { speak, isSpeaking, isLoading } = useSpeech(content, modelName);

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
    handleFeedback,
    handleSpeech: speak,
    isSpeaking,
    isLoading
  };
};
