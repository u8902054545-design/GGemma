import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { voiceInputVariants, pulseVariants, barVariants } from '../../motion/voiceTransition';
import '@material/web/iconbutton/icon-button.js';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

interface VoiceInputProps {
  onCancel: () => void;
  onConfirm: (transcript: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onCancel, onConfirm }) => {
  const { language } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Online recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll the transcript to the bottom if it grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript, isTranscribing, errorMessage]);

  // Clean up function for audio recording
  const cleanupRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    if (isOnline) {
      // ONLINE MODE: MediaRecorder & OpenRouter Chirp-3
      let isComponentMounted = true;

      const startRecording = async () => {
        try {
          cleanupRecording();
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!isComponentMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;

          // Set up Web Audio API visualizer
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            try {
              const audioContext = new AudioContextClass();
              audioContextRef.current = audioContext;
              const source = audioContext.createMediaStreamSource(stream);
              const analyser = audioContext.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);
              analyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateVolume = () => {
                if (!analyserRef.current || !isComponentMounted) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const normVolume = average / 100;
                setIsSpeaking(normVolume > 0.04);
                animationFrameRef.current = requestAnimationFrame(updateVolume);
              };
              updateVolume();
            } catch (err) {
              console.warn("Failed to initialize AudioContext for visualizer:", err);
            }
          }

          // Choose supported mimeType
          let mimeType = 'audio/webm';
          let options: MediaRecorderOptions = {};
          if (typeof MediaRecorder !== 'undefined') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              options = { mimeType: 'audio/webm;codecs=opus' };
              mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
              options = { mimeType: 'audio/webm' };
              mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
              options = { mimeType: 'audio/ogg' };
              mimeType = 'audio/ogg';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
              options = { mimeType: 'audio/mp4' };
              mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
              options = { mimeType: 'audio/aac' };
              mimeType = 'audio/aac';
            }
          }
          mimeTypeRef.current = mimeType;

          audioChunksRef.current = [];
          const recorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            cleanupRecording();
            if (audioBlob.size > 1000) {
              await uploadAndTranscribe(audioBlob, mimeType);
            } else {
              setIsTranscribing(false);
              setErrorMessage(language === 'ru' ? 'Запись слишком короткая.' : 'Recording too short.');
            }
          };

          recorder.start(100);
          setIsListening(true);
          setIsSpeaking(false);
        } catch (err) {
          console.error("Failed to start MediaRecorder recording:", err);
          if (isComponentMounted) {
            setErrorMessage(language === 'ru' ? 'Не удалось получить доступ к микрофону.' : 'Could not access microphone.');
            setIsListening(false);
          }
        }
      };

      startRecording();

      return () => {
        isComponentMounted = false;
        cleanupRecording();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          try {
            mediaRecorderRef.current.stop();
          } catch (e) {}
        }
      };
    } else {
      // OFFLINE MODE: Fallback to Browser SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("Speech recognition not supported in this browser.");
        setErrorMessage(language === 'ru' ? 'Распознавание речи не поддерживается.' : 'Speech recognition not supported.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = navigator.language || 'ru-RU';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onspeechstart = () => {
        setIsSpeaking(true);
      };

      recognition.onsoundstart = () => {
        setIsSpeaking(true);
      };

      recognition.onspeechend = () => {
        setIsSpeaking(false);
      };

      recognition.onsoundend = () => {
        setIsSpeaking(false);
      };

      recognition.onresult = (event: any) => {
        setIsSpeaking(true);
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 1200);

        let finalSpeech = '';
        let interimSpeech = '';

        for (let i = 0; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalSpeech += (finalSpeech ? ' ' : '') + text;
          } else {
            interimSpeech += (interimSpeech ? ' ' : '') + text;
          }
        }

        if (finalSpeech) {
          setTranscript(finalSpeech);
        }
        setInterimTranscript(interimSpeech);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(language === 'ru' ? 'Доступ к микрофону заблокирован.' : 'Microphone access denied.');
        } else {
          setErrorMessage(language === 'ru' ? 'Ошибка распознавания речи.' : 'Speech recognition error.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsSpeaking(false);
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }

      return () => {
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        if (recognitionRef.current) {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onspeechstart = null;
          recognitionRef.current.onspeechend = null;
          recognitionRef.current.onsoundstart = null;
          recognitionRef.current.onsoundend = null;
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }
      };
    }
  }, [language, isOnline]);

  const uploadAndTranscribe = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const formData = new FormData();
      let ext = 'webm';
      if (mimeType.includes('wav')) ext = 'wav';
      else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';
      else if (mimeType.includes('m4a')) ext = 'm4a';
      else if (mimeType.includes('flac')) ext = 'flac';
      else if (mimeType.includes('ogg')) ext = 'ogg';
      else if (mimeType.includes('aac')) ext = 'aac';
      else if (mimeType.includes('mp4')) ext = 'mp4';

      formData.append('file', audioBlob, `audio.${ext}`);

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription request failed: ${response.status}`);
      }

      const result = await response.json();
      const text = result.text || '';
      onConfirm(text);
    } catch (err: any) {
      console.error("OpenRouter chirp-3 transcription error:", err);
      setErrorMessage(language === 'ru' ? 'Не удалось расшифровать аудио. Попробуйте еще раз.' : 'Could not transcribe audio. Please try again.');
      setIsTranscribing(false);
    }
  };

  const handleCancel = () => {
    if (isOnline) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null;
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      cleanupRecording();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    }
    onCancel();
  };

  const handleConfirm = () => {
    if (isOnline) {
      if (isTranscribing) return;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        setIsTranscribing(true);
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          setIsTranscribing(false);
        }
      } else {
        onConfirm('');
      }
    } else {
      const finalText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      onConfirm(finalText);
    }
  };

  return (
    <motion.div
      variants={voiceInputVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex items-center gap-3 bg-[var(--md-sys-color-surface-container-high)] rounded-[32px] px-3 py-2 min-h-[52px] border border-[var(--md-sys-color-primary)]/10 shadow-lg relative overflow-hidden min-w-0"
    >
      {/* Visual background ripple/pulse when listening */}
      <AnimatePresence>
        {isListening && !isTranscribing && (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-[var(--md-sys-color-primary)]/5 rounded-[32px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Close button on the left (Material Web Component) */}
      <div className="flex-shrink-0 z-10">
        <md-icon-button
          onClick={handleCancel}
          disabled={isTranscribing}
          style={{
            '--md-icon-button-icon-color': 'var(--md-sys-color-on-surface-variant)',
            '--md-icon-button-hover-state-layer-color': 'var(--md-sys-color-on-surface-variant)',
            '--md-icon-button-pressed-state-layer-color': 'var(--md-sys-color-primary)',
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </md-icon-button>
      </div>

      {/* Transcript / Listening state in the center */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-start gap-3 px-2 max-h-[120px] overflow-y-auto select-none z-10"
      >
        {/* Pulsing indicator - Google Assistant style visualizer */}
        <div className="flex items-center gap-[3.5px] h-5 w-6 shrink-0 justify-center">
          {isListening && !isTranscribing ? (
            [0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barVariants}
                animate={isSpeaking ? "animate" : "idle"}
                initial="idle"
                className="w-[3px] rounded-full bg-[var(--md-sys-color-primary)]"
                style={{
                  height: '100%',
                  transformOrigin: 'center',
                }}
              />
            ))
          ) : isTranscribing ? (
            <div className="w-4 h-4 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin flex-shrink-0 opacity-70" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-outline)]" />
          )}
        </div>

        {/* Text Area / Transcript display */}
        <div className="flex-1 text-[15px] leading-relaxed overflow-hidden text-ellipsis">
          {errorMessage ? (
            <span className="text-[var(--md-sys-color-error)] break-words font-medium text-sm">
              {errorMessage}
            </span>
          ) : isTranscribing ? (
            <span className="text-[var(--md-sys-color-primary)] animate-pulse font-medium text-sm flex items-center gap-1.5">
              {language === 'ru' ? 'Распознавание...' : 'Transcribing...'}
            </span>
          ) : !isOnline ? (
            transcript || interimTranscript ? (
              <p className="text-[var(--md-sys-color-on-surface)] break-words">
                {transcript}
                {interimTranscript && (
                  <span className="text-[var(--md-sys-color-on-surface-variant)]/60 italic ml-1">
                    {interimTranscript}
                  </span>
                )}
              </p>
            ) : (
              <span className="text-[var(--md-sys-color-on-surface-variant)] animate-pulse">
                {language === 'ru' ? 'Слушаю... (Оффлайн)' : 'Listening... (Offline)'}
              </span>
            )
          ) : (
            <span className="text-[var(--md-sys-color-on-surface-variant)] animate-pulse">
              {language === 'ru' ? 'Говорите...' : 'Speak...'}
            </span>
          )}
        </div>
      </div>

      {/* Check button on the right (Material Web Component) - Always enabled */}
      <div className="flex-shrink-0 z-10">
        <md-icon-button
          onClick={handleConfirm}
          disabled={isTranscribing || (!isOnline && !transcript && !interimTranscript)}
          style={{
            '--md-icon-button-icon-color': 'var(--md-sys-color-primary)',
            '--md-icon-button-hover-state-layer-color': 'var(--md-sys-color-primary)',
            '--md-icon-button-pressed-state-layer-color': 'var(--md-sys-color-primary)',
          }}
        >
          <span className="material-symbols-outlined">check</span>
        </md-icon-button>
      </div>
    </motion.div>
  );
};
