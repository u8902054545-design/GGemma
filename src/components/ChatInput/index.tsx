import React, { memo, useEffect, useRef, useState } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ChatInputProps } from './types';
import { AddAction } from './AddAction';
import { InputArea } from './InputArea';
import { SendAction } from './SendAction';
import { AddBottomSheet } from './AddBottomSheet';
import { VideoPreview } from '../VideoPreview';
import { motion, AnimatePresence } from 'motion/react';
import { ImportedCodesList } from './ImportedCodesList';
import { HiddenInputs } from './HiddenInputs';
import { VoiceInput } from './VoiceInput';
import { GemmaLive } from './GemmaLive';
import { playLiveOpenSound, playLiveCloseSound } from './sounds';
import { initLiveAudioContext } from './liveTTS';


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
  messages,
  setSnackbarMessage,
  setIsSnackbarOpen,
  isTranslationActive = false,
  translationInputLang = 'English',
  translationOutputLang = 'Russian',
  onTranslationToggle,
  onChangeInputLang,
  onChangeOutputLang,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const isImageDisabled = selectedModel.id === 'Gemma 2 27B' || selectedModel.id === 'Gemma 3n E4B';
  const isVideoDisabled = !(
    selectedModel.id.startsWith('google/gemini') ||
    selectedModel.id === 'Gemma 4 31B' ||
    selectedModel.id === 'Gemma 4 26B' ||
    selectedModel.id === 'Gemma 4 12B' ||
    selectedModel.id === 'DiffusionGemma 26B A4B IT'
  );
  const isSearchDisabled = false;

  const { 
    selectedFile, 
    previewUrl, 
    handleFileChange: onFileSelect, 
    clearSelection 
  } = useImageUpload();

  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);


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
    handleSend(
      undefined, 
      isSearchActive, 
      selectedFile || undefined, 
      importedCodes, 
      undefined, 
      undefined, 
      isTranslationActive, 
      translationInputLang, 
      translationOutputLang
    );
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
      
      <AnimatePresence mode="wait">
        {isLiveActive ? (
          <motion.div
            key="live-container"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between min-h-[52px] w-full gap-3"
          >
            <GemmaLive 
              messages={messages}
              isTyping={isTyping}
              handleSend={handleSend}
              onClose={() => {
                playLiveCloseSound();
                setIsLiveActive(false);
              }} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="standard-input-container"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25 }}
            className="flex items-end gap-3 justify-center min-h-[52px] w-full"
          >
            {!isVoiceInputActive && (
              <AddAction onAddClick={() => setIsBottomSheetOpen(true)} />
            )}

            <AnimatePresence mode="wait">
              {!isVoiceInputActive ? (
                <motion.div
                  key="input-area-wrapper"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.0, 0, 1.0] }}
                  className="flex-1 flex min-w-0"
                >
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
                    isListening={false}
                    toggleListening={() => setIsVoiceInputActive(true)}
                    isTranslationActive={isTranslationActive}
                    translationInputLang={translationInputLang}
                    translationOutputLang={translationOutputLang}
                    onTranslationToggle={onTranslationToggle}
                    onChangeInputLang={onChangeInputLang}
                    onChangeOutputLang={onChangeOutputLang}
                  />
                </motion.div>
              ) : (
                <VoiceInput 
                  key="voice-input"
                  onCancel={() => setIsVoiceInputActive(false)}
                  onConfirm={(text, sendImmediately) => {
                    if (text) {
                      const newText = input + (input ? " " : "") + text;
                      if (sendImmediately) {
                        handleSend(
                          newText, 
                          isSearchActive, 
                          selectedFile || undefined, 
                          importedCodes, 
                          undefined, 
                          undefined, 
                          isTranslationActive, 
                          translationInputLang, 
                          translationOutputLang
                        );
                        clearSelection();
                      } else {
                        setInput(newText);
                      }
                    }
                    setIsVoiceInputActive(false);
                    if (!sendImmediately) {
                      setTimeout(() => {
                        textareaRef.current?.focus();
                      }, 100);
                    }
                  }}
                  setSnackbarMessage={setSnackbarMessage}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                />
              )}
            </AnimatePresence>

            {!isVoiceInputActive && (
              <SendAction 
                isTyping={isTyping}
                stopRequest={stopRequest}
                handleWrappedSend={handleWrappedSend}
                isSendDisabled={isSendDisabled}
                showVoiceChat={!input.trim() && !selectedFile && importedCodes.length === 0}
                onVoiceChatClick={() => {
                  initLiveAudioContext();
                  playLiveOpenSound();
                  setIsLiveActive(true);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
        isTranslationActive={isTranslationActive}
        onTranslationToggle={onTranslationToggle}
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
