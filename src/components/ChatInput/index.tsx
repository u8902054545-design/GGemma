import React, { memo, useEffect, useRef, useState } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ChatInputProps } from './types';
import { AddAction } from './AddAction';
import { InputArea } from './InputArea';
import { SendAction } from './SendAction';
import { AddBottomSheet } from './AddBottomSheet';

const ChatInputComponent: React.FC<ChatInputProps> = ({
  input, setInput, handleSend, stopRequest,
  selectedModel,
  isTyping,
  isSearchActive = false,
  onSearchClick,
  onImageClick,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
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
    setIsBottomSheetOpen(true);
  };

  const handlePhotoClick = () => {
    if (isImageDisabled) return;
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    if (isImageDisabled) return;
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
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
        <AddAction 
          onAddClick={handleAddClick}
        />

        <InputArea 
          input={input}
          setInput={setInput}
          textareaRef={textareaRef}
          onKeyDown={onKeyDown}
          previewUrl={previewUrl}
          clearSelection={clearSelection}
          onImageClick={onImageClick}
          isSearchActive={isSearchActive}
          isSearchDisabled={isSearchDisabled}
          onSearchClick={onSearchClick}
          isListening={isListening}
          toggleListening={toggleListening}
        />

        <SendAction 
          isTyping={isTyping}
          stopRequest={stopRequest}
          handleWrappedSend={handleWrappedSend}
          isSendDisabled={isSendDisabled}
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <AddBottomSheet 
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onPhotoClick={handlePhotoClick}
        onCameraClick={handleCameraClick}
        isSearchActive={isSearchActive}
        onSearchToggle={onSearchClick || (() => {})}
        isImageDisabled={isImageDisabled}
      />
    </footer>
  );
};

export const ChatInput = memo(ChatInputComponent);
