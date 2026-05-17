import React, { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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

  const isTTSModel = selectedModel.id === 'Gemini 3.1 Flash TTS Preview';
  const isImageDisabled = selectedModel.id === 'Gemma 2 27B' || selectedModel.id === 'Gemma 3n E4B' || isTTSModel;
  const isSearchDisabled = isTTSModel;

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
    <footer className="w-full max-w-4xl mx-auto z-50 relative">
      <div className="absolute -inset-[1px] rounded-t-[32px] animate-gradient blur-md opacity-60 pointer-events-none" />
      <div className="relative pt-[1px] px-[1px] rounded-t-[32px] animate-gradient">
        <div className="bg-black rounded-t-[31px] flex flex-col p-2 pb-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {previewUrl && (
            <ImagePreview 
              url={previewUrl} 
              onRemove={clearSelection}
              onImageClick={onImageClick}
            />
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Gemma"
            className="w-full bg-transparent border-none outline-none resize-none max-h-60 min-h-[44px] px-4 py-3 text-[#e2e2e2] placeholder-[#444]"
            rows={1}
          />
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddClick}
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
                {isSearchActive && (
                  <div className="absolute inset-0 rounded-full animate-gradient opacity-20 -z-10" />
                )}
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
                    onClick={handleWrappedSend}
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
        </div>
      </div>
    </footer>
  );
};

export const ChatInput = memo(ChatInputComponent);
