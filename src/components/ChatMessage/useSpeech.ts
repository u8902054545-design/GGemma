import { useState, useCallback, useEffect } from 'react';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

const audioBufferCache: Record<string, ArrayBuffer> = {};

export const setAudioBufferCache = (key: string, buffer: ArrayBuffer) => {
  audioBufferCache[key] = buffer;
};

export const useSpeech = (text: string, modelName?: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingWebSpeech, setIsPlayingWebSpeech] = useState(false);
  const { playPcmBuffer, stop: stopPcm, isPlaying: isPcmPlaying } = useVoicePlayer();

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    stopPcm();
    setIsSpeaking(false);
    setIsLoading(false);
    setIsPlayingWebSpeech(false);
  }, [stopPcm]);

  const speak = useCallback(async () => {
    if (!text) return;

    if (isSpeaking || isPcmPlaying || isLoading) {
      stop();
      return;
    }

    const trimmedText = text.trim();
    const selectedVoice = localStorage.getItem('selected_voice') || 'Zephyr';

    if (selectedVoice === 'Chrome Web Speech') {
      window.speechSynthesis.cancel();
      setIsPlayingWebSpeech(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.includes('ru-RU'));
      if (russianVoice) utterance.voice = russianVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPlayingWebSpeech(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPlayingWebSpeech(false);
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    if (audioBufferCache[trimmedText]) {
      setIsSpeaking(true);
      await playPcmBuffer(audioBufferCache[trimmedText]);
      return;
    }

    setIsLoading(true);

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
          publicModelName: modelName,
          voice: selectedVoice,
          isAudioOnly: true
        }),
      });

      if (!response.ok) throw new Error('TTS Failed');

      const audioData = await response.arrayBuffer();
      audioBufferCache[trimmedText] = audioData;
      setIsLoading(false);
      setIsSpeaking(true);
      await playPcmBuffer(audioData);

    } catch (error) {
      console.error('TTS Error, falling back to Web Speech API', error);
      setIsLoading(false);
      setIsPlayingWebSpeech(true);

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.includes('ru-RU'));
      if (russianVoice) utterance.voice = russianVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPlayingWebSpeech(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPlayingWebSpeech(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [text, modelName, isSpeaking, isPcmPlaying, isLoading, stop, playPcmBuffer]);

  useEffect(() => {
    if (!isPlayingWebSpeech) {
      setIsSpeaking(isPcmPlaying);
    }
  }, [isPcmPlaying, isPlayingWebSpeech]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopPcm();
    };
  }, [stopPcm]);

  return { speak, stop, isSpeaking, isLoading };
};
