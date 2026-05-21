import { useState, useCallback, useEffect } from 'react';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

const audioBufferCache: Record<string, ArrayBuffer> = {};

export const setAudioBufferCache = (key: string, buffer: ArrayBuffer) => {
  audioBufferCache[key] = buffer;
};

export const useSpeech = (text: string, modelName?: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { playAudioBuffer, stop: stopPcm, isPlaying: isPcmPlaying } = useVoicePlayer();

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    stopPcm();
    setIsSpeaking(false);
  }, [stopPcm]);

  const speak = useCallback(async () => {
    if (!text && modelName !== 'Gemini 3.1 Flash TTS Preview') return;

    if (isSpeaking || isPcmPlaying) {
      stop();
      return;
    }

    const trimmedText = text.trim();

    if (audioBufferCache[trimmedText]) {
      setIsSpeaking(true);
      await playAudioBuffer(audioBufferCache[trimmedText]);
      return;
    }

    const isAudioUrl = trimmedText.startsWith('http');
    const isAudioModel = modelName === 'Gemini 3.1 Flash TTS Preview';
    setIsSpeaking(true);

    try {
      if (isAudioUrl) {
        const response = await fetch(trimmedText);
        if (!response.ok) throw new Error('Failed to fetch audio file');
        const audioData = await response.arrayBuffer();
        audioBufferCache[trimmedText] = audioData;
        await playAudioBuffer(audioData);
        return;
      }

      const selectedVoice = localStorage.getItem('selected_voice') || 'Zephyr';
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
          publicModelName: modelName || 'Gemini 3.1 Flash TTS Preview',
          voice: selectedVoice,
          isAudioOnly: isAudioModel
        }),
      });

      if (!response.ok) throw new Error('TTS Failed');

      const audioData = await response.arrayBuffer();
      audioBufferCache[trimmedText] = audioData;
      await playAudioBuffer(audioData);

    } catch (error) {
      console.error('TTS Error, falling back to Web Speech API', error);

      if (!isAudioModel && !isAudioUrl) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const russianVoice = voices.find(voice => voice.lang.includes('ru-RU'));
        if (russianVoice) utterance.voice = russianVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  }, [text, modelName, isSpeaking, isPcmPlaying, stop, playPcmBuffer]);

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
