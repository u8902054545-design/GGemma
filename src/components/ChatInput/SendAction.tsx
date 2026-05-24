import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SendActionProps {
  isTyping: boolean;
  stopRequest: () => void;
  handleWrappedSend: () => void;
  isSendDisabled: boolean;
}

export const SendAction: React.FC<SendActionProps> = ({
  isTyping,
  stopRequest,
  handleWrappedSend,
  isSendDisabled,
}) => {
  return (
    <div className="flex-shrink-0">
      <AnimatePresence mode="wait">
        {isTyping ? (
          <motion.button
            key="stop"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            type="button"
            onClick={stopRequest}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:brightness-125 active:scale-95 shadow-xl"
            style={{ backgroundColor: '#0f0f0f' }}
          >
            <span 
              className="material-symbols-outlined text-[26px]" 
              style={{ color: 'var(--gemma-blue-bright)', fontVariationSettings: "'FILL' 1" }}
            >
              stop_circle
            </span>
          </motion.button>
        ) : (
          <motion.button
            key="send"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            type="button"
            onClick={handleWrappedSend}
            disabled={isSendDisabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isSendDisabled 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:brightness-110 active:scale-95"
            }`}
            style={{ 
              backgroundColor: isSendDisabled ? '#0f0f0f' : 'var(--md-sys-color-primary)',
              color: isSendDisabled ? '#9aa0a6' : 'var(--md-sys-color-on-primary)'
            }}
          >
            <span className={`material-symbols-outlined text-[26px] ${
              !isSendDisabled ? "fill-[1]" : ""
            }`}>
              send
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
