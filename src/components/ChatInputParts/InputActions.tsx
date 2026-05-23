import React from 'react';
import { motion } from 'motion/react';
import { searchButtonVariants, searchTextVariants } from '../../motion/searchTransition';

interface InputActionsProps {
  isImageDisabled: boolean;
  isSearchDisabled: boolean;
  isSearchActive: boolean;
  onImageAdd: () => void;
  onSearchClick: () => void;
  onModelConfigClick: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isTyping: boolean;
  stopRequest: () => void;
  handleSend: () => void;
  isSendDisabled: boolean;
}

export const InputActions: React.FC<InputActionsProps> = ({
  isImageDisabled,
  isSearchDisabled,
  isSearchActive,
  onImageAdd,
  onSearchClick,
  onModelConfigClick,
  isListening,
  toggleListening,
  isTyping,
  stopRequest,
  handleSend,
  isSendDisabled
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onImageAdd}
          disabled={isImageDisabled}
          className={`p-2 rounded-full transition-colors flex items-center justify-center group ${
            isImageDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#1a1a1a] active:scale-90'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] text-[#808080] group-hover:text-[#e2e2e2]">
            {isImageDisabled ? 'attach_file_off' : 'add'}
          </span>
        </button>

        <motion.button
          type="button"
          onClick={!isSearchDisabled ? onSearchClick : undefined}
          variants={searchButtonVariants}
          initial="inactive"
          animate={isSearchActive ? "active" : "inactive"}
          disabled={isSearchDisabled}
          className={`relative flex items-center h-[36px] overflow-hidden rounded-full group ${
            isSearchDisabled 
              ? "cursor-not-allowed opacity-50" 
              : isSearchActive
              ? "bg-[#8ab4f8]/10 ring-1 ring-[#8ab4f8]/50"
              : "hover:bg-[#1a1a1a]"
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
            isSearchActive ? "text-[#8ab4f8]" : "text-[#808080] group-hover:text-[#e2e2e2]"
          }`}>
            {isSearchDisabled ? 'search_off' : 'search'}
          </span>
          <motion.span
            variants={searchTextVariants}
            initial="hidden"
            animate={isSearchActive ? "visible" : "hidden"}
            className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-colors ${
              isSearchActive ? "text-[#8ab4f8]" : "text-[#808080] group-hover:text-[#e2e2e2]"
            }`}
          >
            Search
          </motion.span>
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onModelConfigClick}
          className="p-2 rounded-full hover:bg-[#1a1a1a] transition-all active:scale-90 flex items-center justify-center group"
        >
          <span className="material-symbols-outlined text-[24px] text-[#808080] group-hover:text-[#8ab4f8]">
            tune
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors active:scale-90 flex items-center justify-center ${isListening ? "bg-[#EA4335]/20" : "hover:bg-[#1a1a1a]"}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${isListening ? "text-[#EA4335]" : "text-[#808080]"}`}>
              mic
            </span>
          </button>

          {isTyping ? (
            <button
              type="button"
              onClick={stopRequest}
              className="p-2 rounded-full bg-[#282a2d] hover:bg-[#333537] transition-all active:scale-90 flex items-center justify-center"
            >
              <span 
                className="material-symbols-outlined text-[24px]" 
                style={{ color: 'var(--gemma-blue-bright)', fontVariationSettings: "'FILL' 1" }}
              >
                stop_circle
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={isSendDisabled}
              className="p-2 rounded-full hover:bg-[#1a1a1a] transition-transform active:scale-90 flex items-center justify-center"
            >
              <span className={`material-symbols-outlined text-[24px] ${!isSendDisabled ? "text-[#8ab4f8]" : "text-[#808080]"}`}>
                send
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
