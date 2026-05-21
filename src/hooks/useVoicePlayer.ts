import { useState, useCallback, useRef } from 'react';

export const useVoicePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  const playAudioBuffer = useCallback(async (buffer: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }

      // decodeAudioData handles MP3, WAV, etc.
      const audioBuffer = await audioContextRef.current.decodeAudioData(buffer.slice(0));

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
      source.start(startTime);
      
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      setIsPlaying(true);

      source.onended = () => {
        if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
          setIsPlaying(false);
        }
      };

    } catch (error) {
      console.error('Error playing audio buffer:', error);
      stop();
    }
  }, [stop]);

  return { playAudioBuffer, stop, isPlaying };
};
