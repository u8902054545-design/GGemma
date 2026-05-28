import React, { memo, useEffect, useRef, useState } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ChatInputProps } from './types';
import { AddAction } from './AddAction';
import { InputArea } from './InputArea';
import { SendAction } from './SendAction';
import { AddBottomSheet } from './AddBottomSheet';
import { VideoPreview } from '../VideoPreview';
import { AnimatePresence } from 'motion/react';
import { ImportedCodesList } from './ImportedCodesList';
import { HiddenInputs } from './HiddenInputs';
import { useSpeechRecognition } from './useSpeechRecognition';

const ChatInputComponent: React.FC<ChatInputProps> = ({
  input, setInput, handleSend, stopRequest,
  selectedModel,
  isTyping,
  isSearchActive = false,
  onSearchClick,
  onCodeImportClick,
  onImageClick,
  importedCodes = [],
  onRemoveCode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const isImageDisabled = selectedModel.id === 'Gemma 2 27B' || selectedModel.id === 'Gemma 3n E4B';
  const isVideoDisabled = !(selectedModel.id === 'Gemma 4 31B' || selectedModel.id === 'Gemma 4 26B');
  const isSearchDisabled = false;

  const { 
    selectedFile, 
    previewUrl, 
    handleFileChange: onFileSelect, 
    clearSelection 
  } = useImageUpload();

  const { isListening, toggleListening } = useSpeechRecognition((transcript) => {
    const newInput = input + (input ? " " : "") + transcript;
    setInput(newInput);
    setTimeout(() => handleSend(), 150);
  });

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

  const handleWrappedSend = () => {
    if (!input.trim() && !selectedFile && importedCodes.length === 0) return;
    handleSend(undefined, isSearchActive, selectedFile || undefined, importedCodes);
    clearSelection();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleMediaClick = (url: string) => {
    if (selectedFile?.type.startsWith('video/')) {
      setPreviewVideoUrl(url);
    } else {
      onImageClick?.(url);
    }
  };

  const isSendDisabled = !input.trim() && !selectedFile && importedCodes.length === 0;

  return (
    <footer className="w-full max-w-[1200px] mx-auto z-50 relative pb-8 px-2">
      <ImportedCodesList 
        importedCodes={importedCodes} 
        onRemoveCode={onRemoveCode} 
      />
      
      <div className="flex items-end gap-3 justify-center">
        <AddAction onAddClick={() => setIsBottomSheetOpen(true)} />

        <InputArea 
          input={input}
          setInput={setInput}
          textareaRef={textareaRef}
          onKeyDown={onKeyDown}
          previewUrl={previewUrl}
          selectedFile={selectedFile}
          clearSelection={clearSelection}
          onMediaClick={handleMediaClick}
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

      <HiddenInputs 
        fileInputRef={fileInputRef}
        cameraInputRef={cameraInputRef}
        videoInputRef={videoInputRef}
        handleFileChange={handleFileChange}
      />

      <AddBottomSheet 
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onPhotoClick={() => !isImageDisabled && fileInputRef.current?.click()}
        onCameraClick={() => !isImageDisabled && cameraInputRef.current?.click()}
        onVideoClick={() => !isVideoDisabled && videoInputRef.current?.click()}
        isSearchActive={isSearchActive}
        onSearchToggle={onSearchClick || (() => {})}
        onCodeImportClick={onCodeImportClick || (() => {})}
        isImageDisabled={isImageDisabled}
        isVideoDisabled={isVideoDisabled}
      />

      <AnimatePresence>
        {previewVideoUrl && (
          <VideoPreview 
            url={previewVideoUrl} 
            onClose={() => setPreviewVideoUrl(null)} 
          />
        )}
      </AnimatePresence>
    </footer>
  );
};

export const ChatInput = memo(ChatInputComponent);
