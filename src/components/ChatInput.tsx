import React, { memo, useEffect, useRef, useState } from 'react';
import { ModelSelector } from './ModelSelector';

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  stopRequest: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  isTyping: boolean;
  models: string[];
  isSearchActive?: boolean;
  onSearchClick?: () => void;
};

const ChatInputComponent: React.FC<ChatInputProps> = ({
  input, setInput, handleSend, stopRequest, selectedModel, setSelectedModel,
  isDropdownOpen, setIsDropdownOpen, isTyping, models,
  isSearchActive = false,
  onSearchClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  return (
    <footer className="w-full max-w-4xl mx-auto fixed bottom-0 left-1/2 -translate-x-1/2 z-50">
      <div className="pt-[1px] px-[1px] rounded-t-[32px] animate-gradient">
        <div className="bg-black rounded-t-[31px] flex flex-col p-2 pb-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Gemma..."
            className="w-full bg-transparent border-none outline-none resize-none max-h-60 min-h-[44px] px-4 py-3 text-[#e2e2e2] placeholder-[#444]"
            rows={1}
          />
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center">
              <button
                type="button"
                onClick={onSearchClick}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 active:scale-95 group ${
                  isSearchActive
                  ? "bg-[#8ab4f8]/10 ring-1 ring-[#8ab4f8]/50"
                  : "hover:bg-[#1a1a1a]"
                }`}
              >
                {isSearchActive && (
                  <div className="absolute inset-0 rounded-full animate-gradient opacity-20 -z-10" />
                )}
                <span className={`material-symbols-outlined text-[20px] transition-colors ${
                  isSearchActive ? "text-[#8ab4f8]" : "text-[#808080] group-hover:text-[#e2e2e2]"
                }`}>
                  search
                </span>
                <span className={`text-sm font-medium transition-colors ${
                  isSearchActive ? "text-[#8ab4f8]" : "text-[#808080] group-hover:text-[#e2e2e2]"
                }`}>
                  Search
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                models={models}
              />
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
                    className="p-2 rounded-full hover:bg-[#1a1a1a] transition-transform active:scale-90 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[24px] text-[#EA4335]">
                      stop_circle
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 rounded-full hover:bg-[#1a1a1a] disabled:opacity-10 transition-transform active:scale-90 flex items-center justify-center"
                  >
                    <span className={`material-symbols-outlined text-[24px] ${input.trim() ? "text-[#8ab4f8]" : "text-[#808080]"}`}>
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
