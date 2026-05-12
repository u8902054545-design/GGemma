import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../motion/transitions';

export const TemporaryChatPage: React.FC = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col items-center justify-center p-6 bg-black"
    >
      <div className="flex flex-col items-center max-w-sm text-center mb-20">
        <div className="w-20 h-20 rounded-3xl bg-[#1e1e1e] flex items-center justify-center mb-6 shadow-2xl border border-white/5">
          <span className="material-symbols-outlined text-[#a8c7fa] text-[40px]">
            chat_dashed
          </span>
        </div>

        <h2 className="text-[#e2e2e2] text-2xl font-semibold mb-3 tracking-tight">
          Temporary Chat
        </h2>
        
        <p className="text-[#c4c7c5] text-sm leading-relaxed">
          Temporary chats aren't saved to your history, and won't be used to train our models. They are deleted as soon as you close them.
        </p>
      </div>
    </motion.div>
  );
};
