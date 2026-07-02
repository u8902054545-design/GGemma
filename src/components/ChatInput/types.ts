import React from 'react';
import { Message } from '../../hooks/chatTypes';

export interface ImportedCode {
  id: string;
  filename: string;
  code: string;
}

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (text?: string, isSearch?: boolean, file?: File, codes?: ImportedCode[]) => void;
  stopRequest: () => void;
  selectedModel: { id: string; name: string };
  isTyping: boolean;
  isSearchActive?: boolean;
  onSearchClick?: () => void;
  onCodeImportClick?: () => void;
  onImageClick?: (url: string) => void;
  importedCodes?: ImportedCode[];
  onRemoveCode?: (id: string) => void;
  messages: Message[];
  setSnackbarMessage?: (msg: string) => void;
  setIsSnackbarOpen?: (open: boolean) => void;
}


