import React, { useState } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';

interface VoiceSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSelection: React.FC<VoiceSelectionProps> = ({ isOpen, onClose }) => {
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  if (!isOpen) return null;

  const voices = [
    'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 
    'Callirrhoe', 'Autonoe', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 
    'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia', 'Achernar', 
    'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenube', 
    'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat'
  ];

  const handlePlayPause = (e: React.MouseEvent, voiceName: string) => {
    e.stopPropagation();
    if (playingVoice === voiceName) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceName);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
      className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden"
    >
      <header className="w-full p-4 flex items-center justify-start">
        <button
          onClick={onClose}
          className="p-3 hover:bg-white/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-start justify-start px-6 pb-8 overflow-y-auto w-full max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-normal text-white mt-2 mb-6 tracking-tight align-left w-full">
          Choose a voice
        </h1>

        <div className="w-full flex flex-col">
          {voices.map((voice) => {
            const isSelected = selectedVoice === voice;
            const isPlaying = playingVoice === voice;

            return (
              <button
                key={voice}
                onClick={() => setSelectedVoice(voice)}
                className="ripple-container w-full py-4 px-3 flex items-center justify-between border-b border-[#111111] hover:bg-white/5 rounded-xl transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {isSelected && (
                      <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-primary)]">
                        check
                      </span>
                    )}
                  </div>
                  <span className={`text-[16px] font-medium transition-colors ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-white'}`}>
                    {voice}
                  </span>
                </div>

                <div
                  onClick={(e) => handlePlayPause(e, voice)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                >
                  <span className={`material-symbols-outlined text-[22px] ${isPlaying ? 'text-[var(--md-sys-color-primary)]' : 'text-[#555555]'}`}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};
