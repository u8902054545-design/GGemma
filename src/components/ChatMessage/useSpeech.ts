import { useState, useCallback, useEffect } from 'react';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

export const useSpeech = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { playPcmBuffer, stop: stopPcm, isPlaying: isPcmPlaying } = useVoicePlayer();

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    stopPcm();
    setIsSpeaking(false);
  }, [stopPcm]);

  const speak = useCallback(async () => {
    if (!text) return;

    if (isSpeaking || isPcmPlaying) {
      stop();
      return;
    }

    const selectedVoice = localStorage.getItem('selected_voice') || 'Zephyr';
    setIsSpeaking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: text,
          publicModelName: 'Gemini 3.1 Flash TTS Preview',
          voice: selectedVoice,
          isAudioOnly: true 
        }),
      });

      if (!response.ok) throw new Error('TTS Failed');

      const audioData = await response.arrayBuffer();
      await playPcmBuffer(audioData);

    } catch (error) {
      console.error('TTS Error, falling back to Web Speech API', error);
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.includes('ru-RU'));
      if (russianVoice) utterance.voice = russianVoice;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [text, isSpeaking, isPcmPlaying, stop, playPcmBuffer]);

  useEffect(() => {
    setIsSpeaking(isPcmPlaying);
  }, [isPcmPlaying]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopPcm();
    };
  }, [stopPcm]);

  return { speak, stop, isSpeaking };
};
