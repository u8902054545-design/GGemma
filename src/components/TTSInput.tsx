import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoicePlayer } from '../hooks/useVoicePlayer';
import { SUPABASE_ENDPOINT, supabase } from '../config';

interface TTSInputProps {
  onVoice: (text: string) => void;
  onOpenVoiceSelection: () => void;
  isTyping: boolean;
  selectedModel: { id: string; name: string };
}

export const TTSInput: React.FC<TTSInputProps> = ({
  onVoice,
  onOpenVoiceSelection,
  isTyping,
  selectedModel
}) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');

  useEffect(() => {
    const voice = localStorage.getItem('selected_voice') || 'Zephyr';
    setSelectedVoice(voice);
  }, []);

  const handleVoiceClick = () => {
    if (text.trim() && !isTyping) {
      onVoice(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium text-[#e2e2e2] tracking-tight">
          Text to Speech
        </h2>
        <p className="text-sm text-[#808080]">
          Enter the text you want to convert to audio using {selectedModel.name}.
        </p>
      </div>

      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something here..."
          className="w-full min-h-[200px] p-5 bg-[#1e1e1e] border border-[#3c4043] rounded-2xl text-[#e2e2e2] placeholder-[#5f6368] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none transition-all resize-none text-lg leading-relaxed"
        />
        <div className="absolute bottom-4 right-4 text-xs text-[#5f6368]">
          {text.length} characters
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <button
          onClick={onOpenVoiceSelection}
          className="flex items-center gap-3 px-5 py-3 rounded-full hover:bg-[#1a1c1e] border border-[#3c4043] transition-all active:scale-95 group w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[24px] text-[#8ab4f8]">
            record_voice_over
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-[#808080] font-medium uppercase tracking-wider">Voice Selection</span>
            <span className="text-sm text-[#e2e2e2] font-semibold">{selectedVoice}</span>
          </div>
          <span className="material-symbols-outlined text-[20px] text-[#808080] group-hover:translate-x-0.5 transition-transform ml-1">
            chevron_right
          </span>
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVoiceClick}
          disabled={!text.trim() || isTyping}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all w-full sm:w-auto ${
            !text.trim() || isTyping
              ? 'bg-[#3c4043] text-[#808080] cursor-not-allowed'
              : 'bg-[#8ab4f8] text-[#000] hover:bg-[#a8c7fa] shadow-lg shadow-[#8ab4f8]/10'
          }`}
        >
          {isTyping ? (
            <div className="w-6 h-6 border-2 border-[#000]/30 border-t-[#000] rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">
                play_circle
              </span>
              Voice the text
            </>
          )}
        </motion.button>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#3c4043] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8ab4f8]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#8ab4f8]">high_quality</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#e2e2e2]">High Quality</span>
            <span className="text-xs text-[#808080]">Crystal clear audio output</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#3c4043] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#f28b82]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#f28b82]">speed</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#e2e2e2]">Fast Generation</span>
            <span className="text-xs text-[#808080]">Instant voice conversion</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
