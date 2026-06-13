import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { voiceInputVariants, pulseVariants, barVariants } from '../../motion/voiceTransition';
import '@material/web/iconbutton/icon-button.js';

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
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll the transcript to the bottom if it grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    // Force OS language for better native speech recognition, fallback to ru-RU
    recognition.lang = navigator.language || 'ru-RU';
    recognition.interimResults = true;
    // Set continuous to false to avoid the notorious Android Chrome duplication bug
    // where event.results populates with overlapping or duplicate phrases.
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
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language]);

  const handleCancel = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    onCancel();
  };

  const handleConfirm = () => {
    const finalText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    onConfirm(finalText);
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
        {isListening && (
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
          {isListening ? (
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
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-outline)]" />
          )}
        </div>

        {/* Text Area / Transcript display */}
        <div className="flex-1 text-[15px] leading-relaxed overflow-hidden text-ellipsis">
          {transcript || interimTranscript ? (
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
              {language === 'ru' ? 'Слушаю...' : 'Listening...'}
            </span>
          )}
        </div>
      </div>

      {/* Check button on the right (Material Web Component) - Always enabled */}
      <div className="flex-shrink-0 z-10">
        <md-icon-button
          onClick={handleConfirm}
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
