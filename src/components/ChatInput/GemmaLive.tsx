import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useGemmaLiveSpeech } from './useGemmaLiveSpeech';
import { Message } from '../../hooks/chatTypes';

interface GemmaLiveProps {
  onClose: () => void;
  messages: Message[];
  isTyping: boolean;
  handleSend: (text?: string, isSearch?: boolean, file?: File, codes?: any[]) => void;
}

export const GemmaLive: React.FC<GemmaLiveProps> = ({
  onClose,
  messages,
  isTyping,
  handleSend,
}) => {
  const {
    isListening,
    isMuted,
    isSpeaking,
    isProcessing,
    volume,
    toggleMute,
    startLiveConversation,
    stopLiveConversation,
  } = useGemmaLiveSpeech({ messages, isTyping, handleSend });

  // Start the conversation loop when mounted, and ensure clean stop on unmount
  useEffect(() => {
    startLiveConversation();
    return () => {
      stopLiveConversation();
    };
  }, [startLiveConversation, stopLiveConversation]);

  // Scale of the blob:
  // - If listening to user: scales up with mic input volume (1 to 1.8)
  // - If AI is speaking: gentle constant vibration or pulse (around 1.15)
  // - Otherwise: resting scale 1
  let blobScale = 1;
  if (isListening && !isMuted) {
    blobScale = 1 + volume * 0.8;
  } else if (isSpeaking) {
    blobScale = 1.15;
  }

  // Determine state class for helper animations
  const getStateClass = () => {
    if (isMuted) return 'state-muted';
    if (isTyping || isProcessing) return 'state-thinking';
    if (isSpeaking) return 'state-speaking';
    return 'state-listening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex-1 flex items-center justify-between bg-[var(--md-sys-color-surface-container-high)] rounded-[32px] px-4 py-3 min-h-[72px] border border-[var(--md-sys-color-primary)]/10 shadow-2xl relative overflow-hidden select-none"
    >
      {/* Morphing blob CSS style injection for all conversation states */}
      <style>{`
        @keyframes gemma-live-morph {
          0% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          33% {
            border-radius: 53% 47% 45% 55% / 40% 60% 40% 60%;
          }
          66% {
            border-radius: 40% 60% 70% 30% / 50% 45% 55% 50%;
          }
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }
        @keyframes gemma-live-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes gemma-live-pulse-glow {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.15);
          }
        }
        @keyframes gemma-live-thinking-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.2);
            filter: brightness(1.2);
          }
        }
        @keyframes gemma-live-speaking-pulse {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%;
          }
        }
        
        .state-thinking .gemma-blob-core {
          animation: gemma-live-thinking-pulse 1.8s ease-in-out infinite !important;
        }
        .state-speaking .gemma-blob-core {
          animation: gemma-live-morph 3s ease-in-out infinite, gemma-live-spin 6s linear infinite !important;
        }
        .state-listening .gemma-blob-core {
          animation: gemma-live-morph 6s ease-in-out infinite, gemma-live-spin 12s linear infinite !important;
        }
      `}</style>

      {/* Left Mic Button */}
      <div className="z-10">
        <button
          type="button"
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
            isMuted 
              ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' 
              : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isMuted ? 'mic_off' : 'mic'}
          </span>
        </button>
      </div>

      {/* Center Liquid Gemma Blob with State styles */}
      <div className={`flex-1 flex items-center justify-center relative min-h-[60px] ${getStateClass()}`}>
        {/* Glow Ring backdrop */}
        {!isMuted && (
          <div 
            className="absolute w-16 h-16 rounded-full blur-xl pointer-events-none transition-all duration-300"
            style={{
              background: isTyping
                ? 'radial-gradient(circle, rgba(66,133,244,0.6) 0%, rgba(155,114,203,0) 70%)'
                : 'radial-gradient(circle, rgba(155,114,203,0.6) 0%, rgba(217,101,112,0) 70%)',
              transform: `scale(${blobScale * 1.3})`,
              animation: 'gemma-live-pulse-glow 2.5s ease-in-out infinite'
            }}
          />
        )}

        {/* Morphing Blob wrapper */}
        <div 
          className="relative w-14 h-14 transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${blobScale})`,
          }}
        >
          {/* Inner animated gradient droplet */}
          <div 
            className="gemma-blob-core absolute inset-0 transition-all duration-500 ease-in-out"
            style={{
              background: isMuted 
                ? 'linear-gradient(135deg, #757575 0%, #424242 100%)' 
                : isTyping 
                  ? 'linear-gradient(135deg, #4285F4 0%, #9B72CB 100%)'
                  : 'linear-gradient(135deg, #4285F4 0%, #9B72CB 45%, #D96570 100%)',
              borderRadius: isMuted ? '50%' : '60% 40% 30% 70% / 60% 30% 70% 40%',
              boxShadow: isMuted 
                ? 'none' 
                : isTyping
                  ? '0 0 15px rgba(66, 133, 244, 0.4), inset 0 -3px 8px rgba(0, 0, 0, 0.15)'
                  : '0 0 15px rgba(155, 114, 203, 0.4), inset 0 -3px 8px rgba(0, 0, 0, 0.15)',
            }}
          />

          {/* Liquid Glass shine effect */}
          {!isMuted && (
            <div 
              className="absolute top-1 left-2 w-4 h-2 bg-white/20 rounded-full rotate-[-15deg] blur-[0.5px]"
            />
          )}
        </div>
      </div>

      {/* Right Close Button */}
      <div className="z-10">
        <button
          type="button"
          onClick={onClose}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 shadow-md cursor-pointer border border-red-500/20"
        >
          <span className="material-symbols-outlined text-[24px]">
            close
          </span>
        </button>
      </div>
    </motion.div>
  );
};
