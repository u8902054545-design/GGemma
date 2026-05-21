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

  const playPcmBuffer = useCallback(async (buffer: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }

      const pcmData = new Int16Array(buffer);
      const float32Data = new Float32Array(pcmData.length);
      
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

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
      console.error('Error playing PCM buffer:', error);
      stop();
    }
  }, [stop]);

  return { playPcmBuffer, stop, isPlaying };
};
