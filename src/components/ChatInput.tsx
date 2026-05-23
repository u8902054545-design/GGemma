import React, { memo, useEffect, useRef, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { useImageUpload } from '../hooks/useImageUpload';
import { InputActions } from './ChatInputParts/InputActions';

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
          
          <InputActions
            isImageDisabled={isImageDisabled}
            isSearchDisabled={isSearchDisabled}
            isSearchActive={isSearchActive}
            onImageAdd={handleAddClick}
            onSearchClick={onSearchClick || (() => {})}
            onModelConfigClick={onModelConfigClick || (() => {})}
            isListening={isListening}
            toggleListening={toggleListening}
            isTyping={isTyping}
            stopRequest={stopRequest}
            handleSend={handleWrappedSend}
            isSendDisabled={isSendDisabled}
          />
        </div>
      </div>
    </footer>
  );
};

export const ChatInput = memo(ChatInputComponent);
