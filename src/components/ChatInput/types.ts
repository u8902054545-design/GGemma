import React from 'react';

export interface ChatInputProps {
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
}
