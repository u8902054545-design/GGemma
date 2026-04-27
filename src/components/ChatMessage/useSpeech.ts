import { useState, useCallback, useEffect } from 'react';

export const useSpeech = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!text) return;

    if (isSpeaking) {
      stop();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const russianVoice = voices.find(voice => voice.lang.includes('ru-RU'));
    if (russianVoice) {
      utterance.voice = russianVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking, stop]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, isSpeaking };
};
