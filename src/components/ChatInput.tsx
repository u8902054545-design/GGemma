import React, { memo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePreview } from './ImagePreview';
import { useImageUpload } from '../hooks/useImageUpload';
import { searchButtonVariants, searchTextVariants } from '../motion/searchTransition';

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  handleSend: (overrideInput?: string, isSearchActive?: boolean, file?: File) => void;
  stopRequest: () => void;
  selectedModel: { id: string; name: string };
  isTyping: boolean;
  isSearchActive?: boolean;
  onSearchClick?: () => void;
  onImageClick?: (url: string) => void;
  onModelConfigClick?: () => void;
};

const ChatInputComponent: React.FC<ChatInputProps> = ({
  input, setInput, handleSend, stopRequest,
  selectedModel,
  isTyping,
  isSearchActive = false,
  onSearchClick,
  onImageClick,
  onModelConfigClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isImageDisabled = selectedModel.id === 'Gemma 2 27B' || selectedModel.id === 'Gemma 3n E4B';
  const isSearchDisabled = false;

  const { 
    selectedFile, 
    previewUrl, 
    handleFileChange: onFileSelect, 
    clearSelection 
  } = useImageUpload();

  useEffect(() => {
    if (isImageDisabled && selectedFile) {
      clearSelection();
    }
  }, [isImageDisabled, selectedFile, clearSelection]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleWrappedSend();
    }
  };

  const handleAddClick = () => {
    if (isImageDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleWrappedSend = () => {
    if (!input.trim() && !selectedFile) return;
    
    handleSend(undefined, isSearchActive, selectedFile || undefined);
    clearSelection();
  };

  const toggleListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        const newInput = input + (input ? " " : "") + transcript;
        setInput(newInput);
        setTimeout(() => handleSend(), 150);
      }
    };
    recognition.start();
  };

  const isSendDisabled = !input.trim() && !selectedFile;

  return (
    <footer className="w-full max-w-[1200px] mx-auto z-50 relative pb-8 px-2">
      <div className="flex items-end gap-3 justify-center">
        {/* Left: Add Container */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleAddClick}
            disabled={isImageDisabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isImageDisabled 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:bg-[#1a1a1a] active:scale-95 group'
            }`}
            style={{ backgroundColor: '#0f0f0f' }}
          >
            <span 
              className="material-symbols-outlined text-[24px] group-hover:text-[#8ab4f8]"
              style={{ color: '#e2e2e2' }}
            >
              {isImageDisabled ? 'attach_file_off' : 'add'}
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Center: Main Input Container (Oval, Large, Dark) */}
        <div 
          className="flex-1 rounded-[32px] shadow-2xl flex flex-col overflow-hidden min-h-[52px] transition-all duration-300 ease-[var(--md-sys-motion-easing-emphasized)]"
          style={{ backgroundColor: '#0f0f0f' }}
        >
          {previewUrl && (
            <div className="px-5 pt-3">
              <ImagePreview 
                url={previewUrl} 
                onRemove={clearSelection}
                onImageClick={onImageClick}
              />
            </div>
          )}

          <div className="flex items-end w-full px-2">
            <div className="flex items-center pb-2 pl-2">
              <motion.button
                type="button"
                onClick={!isSearchDisabled ? onSearchClick : undefined}
                variants={searchButtonVariants}
                initial="inactive"
                animate={isSearchActive ? "active" : "inactive"}
                disabled={isSearchDisabled}
                className={`relative flex items-center h-9 px-3.5 overflow-hidden rounded-full group transition-all ${
                  isSearchDisabled 
                    ? "cursor-not-allowed opacity-40" 
                    : isSearchActive
                    ? "bg-[#8ab4f8]/20 ring-1 ring-[#8ab4f8]/30"
                    : "hover:bg-[#1a1a1a]"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
                  isSearchActive ? "text-[#8ab4f8]" : "text-[#9aa0a6] group-hover:text-[#e2e2e2]"
                }`}>
                  {isSearchDisabled ? 'search_off' : 'search'}
                </span>
                <motion.span
                  variants={searchTextVariants}
                  initial="hidden"
                  animate={isSearchActive ? "visible" : "hidden"}
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden ml-2 ${
                    isSearchActive ? "text-[#8ab4f8]" : "text-[#9aa0a6]"
                  }`}
                >
                  Search
                </motion.span>
              </motion.button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask Gemma"
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-60 min-h-[52px] px-4 py-3.5 text-[#e2e2e2] placeholder-[#757575] text-[16px] leading-relaxed select-text"
              rows={1}
            />

            <div className="flex items-center gap-1 pr-2 pb-2">
              <button
                type="button"
                onClick={onModelConfigClick}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[#1a1a1a] active:scale-90 group"
              >
                <span 
                  className="material-symbols-outlined text-[20px] group-hover:text-[#8ab4f8]"
                  style={{ color: '#9aa0a6' }}
                >
                  tune
                </span>
              </button>
              
              <button
                type="button"
                onClick={toggleListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isListening ? "bg-[#EA4335]/20" : "hover:bg-[#1a1a1a]"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${
                  isListening ? "text-[#EA4335]" : "text-[#9aa0a6]"
                }`}>
                  mic
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Send Container */}
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
      </div>
    </footer>


  );
};

export const ChatInput = memo(ChatInputComponent);

