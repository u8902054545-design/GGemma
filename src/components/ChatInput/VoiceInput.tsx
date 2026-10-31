import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { voiceInputVariants, pulseVariants } from '../../motion/voiceTransition';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

interface VoiceInputProps {
  onCancel: () => void;
  onConfirm: (transcript: string, sendImmediately?: boolean) => void;
  setSnackbarMessage?: (msg: string) => void;
  setIsSnackbarOpen?: (open: boolean) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onCancel, 
  onConfirm,
  setSnackbarMessage,
  setIsSnackbarOpen
}) => {
  const { language } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const recognitionRef = useRef<any>(null);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldSendOnConfirmRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showError = (msg: string) => {
    if (setSnackbarMessage && setIsSnackbarOpen) {
      setSnackbarMessage(msg);
      setIsSnackbarOpen(true);
    }
  };

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
              showError(language === 'ru' ? 'Запись слишком короткая.' : 'Recording too short.');
            }
          };

          recorder.start(100);
          setIsListening(true);
          setIsSpeaking(false);
        } catch (err) {
          console.error("Failed to start MediaRecorder recording:", err);
          if (isComponentMounted) {
            showError(language === 'ru' ? 'Не удалось получить доступ к микрофону.' : 'Could not access microphone.');
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
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("Speech recognition not supported in this browser.");
        showError(language === 'ru' ? 'Распознавание речи не поддерживается.' : 'Speech recognition not supported.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = navigator.language || 'ru-RU';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
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
          showError(language === 'ru' ? 'Доступ к микрофону заблокирован.' : 'Microphone access denied.');
        } else {
          showError(language === 'ru' ? 'Ошибка распознавания речи.' : 'Speech recognition error.');
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
      onConfirm(text, shouldSendOnConfirmRef.current);
    } catch (err: any) {
      console.error("Gemini 3.5 Transcribe error:", err);
      showError(language === 'ru' ? 'Не удалось расшифровать аудио.' : 'Could not transcribe audio.');
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

  const handleStopRecording = (sendAfter: boolean) => {
    if (isTranscribing) return;
    shouldSendOnConfirmRef.current = sendAfter;
    setIsListening(false);

    if (isOnline) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        setIsTranscribing(true);
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          setIsTranscribing(false);
        }
      } else {
        onConfirm('', sendAfter);
      }
    } else {
      setIsTranscribing(true);
      const finalText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setTimeout(() => {
        onConfirm(finalText, sendAfter);
      }, 600);
    }
  };

  return (
    <motion.div
      variants={voiceInputVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col justify-between bg-[var(--md-sys-color-surface-container-high)] rounded-[24px] p-4 min-h-[104px] border border-white/10 shadow-2xl relative overflow-hidden min-w-0 gap-3"
    >
      <AnimatePresence>
        {isListening && !isTranscribing && (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-[var(--md-sys-color-primary)]/5 rounded-[24px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="w-full flex-1 flex items-center justify-between min-h-[48px] relative px-1">
        <AnimatePresence>
          {isListening && !isTranscribing && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-between items-center gap-[3px]"
            >
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isSpeaking 
                      ? [4, Math.random() * 26 + 6, 4] 
                      : 4
                  }}
                  transition={{
                    duration: isSpeaking ? (Math.random() * 0.4 + 0.25) : 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: i * 0.015
                  }}
                  className="w-[3px] rounded-full bg-[var(--md-sys-color-primary)]"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center w-full mt-auto">
        <div className="flex items-center min-w-0 pr-4">
          {isTranscribing ? (
            <span className="text-[var(--md-sys-color-primary)] animate-pulse font-medium text-[14px] flex items-center gap-2 select-none">
              <div className="w-3.5 h-3.5 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              {language === 'ru' ? 'Расшифровка...' : 'Transcribing...'}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors px-2 py-1 rounded-lg"
            >
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 z-10 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleStopRecording(false)}
            disabled={isTranscribing}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
            title={language === 'ru' ? 'Вставить текст в поле' : 'Insert into prompt'}
            aria-label="Stop and insert"
          >
            <span className="material-symbols-outlined text-[24px]">stop_circle</span>
          </button>

          <button
            type="button"
            onClick={() => handleStopRecording(true)}
            disabled={isTranscribing}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[var(--md-sys-color-primary)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--md-sys-color-on-primary)] shadow-md"
            title={language === 'ru' ? 'Отправить сразу' : 'Send immediately'}
            aria-label="Stop and send"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
