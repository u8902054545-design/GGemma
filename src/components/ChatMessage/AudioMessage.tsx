import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessageHeader } from './ChatMessageHeader';
import { playerVariants, iconVariants } from '../../motion/audioAnimations';

interface AudioMessageProps {
  isSpeaking: boolean;
  onSpeech: () => void;
  modelName?: string;
  hasThought?: boolean;
  isThoughtExpanded?: boolean;
  onToggleThought?: () => void;
  isGenerating?: boolean;
  localFeedback?: 'like' | 'dislike' | null;
  handleFeedback?: (type: 'like' | 'dislike' | null) => void;
  isTemporary?: boolean;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({
  isSpeaking,
  onSpeech,
  modelName,
  hasThought = false,
  isThoughtExpanded = false,
  onToggleThought = () => {},
  isGenerating = false,
  localFeedback,
  handleFeedback,
  isTemporary = false
}) => {
  const bars = Array.from({ length: 12 });

  return (
    <div className="flex flex-col w-full group/audio">
      <ChatMessageHeader
        hasThought={hasThought}
        isExpanded={isThoughtExpanded}
        onToggleThought={onToggleThought}
        onSpeech={onSpeech}
        isSpeaking={isSpeaking}
        modelName={modelName}
        isGenerating={isGenerating}
      />

      <motion.div
        variants={playerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative mt-2 p-[1px] rounded-[32px] rounded-tl-[8px] overflow-hidden w-fit min-w-[280px] max-w-full shadow-2xl shadow-black/40"
      >
        {/* Animated Gradient Border */}
        <div className={`absolute inset-0 animate-gradient opacity-40 transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'group-hover/audio:opacity-70'}`} />
        
        <div className="relative bg-[#1a1c1e]/80 backdrop-blur-3xl rounded-[31px] rounded-tl-[7px] px-5 py-4 flex items-center gap-5">
          {/* Main Play Button with Pulsing Effect */}
          <div className="relative flex-shrink-0">
            <AnimatePresence>
              {isSpeaking && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-[var(--gemma-blue-bright)]/40 blur-sm"
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.4 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-0 rounded-full bg-[var(--gemma-blue-deep)]/30 blur-md"
                  />
                </>
              )}
            </AnimatePresence>
            
            <button
              onClick={onSpeech}
              className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg active:scale-90 transition-all duration-300 cursor-pointer relative z-10 overflow-hidden ${
                isSpeaking 
                ? 'bg-white text-[var(--gemma-blue-deep)] scale-105 shadow-[0_0_20px_rgba(46,150,255,0.4)]' 
                : 'bg-gradient-to-br from-[var(--gemma-blue-deep)] via-[var(--gemma-blue-bright)] to-[var(--gemma-blue-light)] text-white hover:scale-105'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isSpeaking ? 'pause' : 'play'}
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="material-symbols-outlined text-[36px] absolute"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isSpeaking ? 'pause' : 'play_arrow'}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[15px] font-bold tracking-tight transition-colors duration-300 ${isSpeaking ? 'text-[var(--gemma-blue-light)]' : 'text-white/90'}`}>
                {isSpeaking ? 'Playing Audio' : 'Voice Message'}
              </span>
              {isGenerating && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gemma-blue-bright)] animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center gap-2 h-6 mt-0.5">
              {isSpeaking ? (
                <div className="flex items-end gap-[2px] h-4">
                  {bars.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [4, 14, 8, 18, 6, 12, 4],
                        opacity: [0.5, 1, 0.7, 1, 0.6, 1, 0.5]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + Math.random() * 0.7,
                        ease: "easeInOut",
                        delay: i * 0.08
                      }}
                      className="w-[3px] bg-gradient-to-t from-[var(--gemma-blue-deep)] to-[var(--gemma-blue-bright)] rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[12px] text-white/40 font-medium truncate">
                  {modelName || 'Gemma AI Intelligence'}
                </span>
              )}
            </div>
          </div>

          {/* End Decoration / Mode Icon */}
          <div className="flex-shrink-0 ml-2">
            <motion.div
              animate={isSpeaking ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                isSpeaking 
                ? 'bg-[var(--gemma-blue-bright)]/10 text-[var(--gemma-blue-bright)]' 
                : 'bg-white/5 text-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isSpeaking ? "'FILL' 1" : "" }}>
                {isSpeaking ? 'waves' : 'graphic_eq'}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Modernized Feedback Controls */}
      {!isGenerating && !isTemporary && handleFeedback && (
        <div className="mt-4 flex items-center gap-3 px-2">
          <button
            onClick={() => handleFeedback(localFeedback === 'like' ? null : 'like')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
              localFeedback === 'like' 
              ? 'bg-[var(--gemma-blue-bright)]/10 border-[var(--gemma-blue-bright)] text-[var(--gemma-blue-bright)] shadow-[0_0_12px_rgba(46,150,255,0.2)]' 
              : 'bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:border-white/20'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: localFeedback === 'like' ? "'FILL' 1" : "" }}
            >
              thumb_up
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Helpful</span>
          </button>
          
          <button
            onClick={() => handleFeedback(localFeedback === 'dislike' ? null : 'dislike')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
              localFeedback === 'dislike' 
              ? 'bg-red-500/10 border-red-500/50 text-red-400' 
              : 'bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:border-white/20'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: localFeedback === 'dislike' ? "'FILL' 1" : "" }}
            >
              thumb_down
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

