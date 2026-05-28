import React from 'react';
import { AnimatePresence } from 'motion/react';
import { VoiceSelection } from './Settings/voiceSelection';
import { CodeImportPage } from './CodeImport/CodeImportPage';
import { VideoPreview } from './VideoPreview';
import { FullscreenImage } from './FullscreenImage';
import Snackbar from './Snackbar';
import { closeState } from '../Functions/uiUtils';

interface AppModalsProps {
  isVoiceSelectionOpen: boolean;
  setIsVoiceSelectionOpen: (open: boolean) => void;
  isCodeImportOpen: boolean;
  setIsCodeImportOpen: (open: boolean) => void;
  previewVideoUrl: string | null;
  setPreviewVideoUrl: (url: string | null) => void;
  fullscreenImage: string | null;
  setFullscreenImage: (url: string | null) => void;
  snackbarMessage: string;
  isSnackbarOpen: boolean;
  setIsSnackbarOpen: (open: boolean) => void;
  handleImportCode: (filename: string, code: string) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  isVoiceSelectionOpen,
  setIsVoiceSelectionOpen,
  isCodeImportOpen,
  setIsCodeImportOpen,
  previewVideoUrl,
  setPreviewVideoUrl,
  fullscreenImage,
  setFullscreenImage,
  snackbarMessage,
  isSnackbarOpen,
  setIsSnackbarOpen,
  handleImportCode
}) => {
  return (
    <>
      <AnimatePresence>
        {isVoiceSelectionOpen && (
          <VoiceSelection isOpen={isVoiceSelectionOpen} onClose={() => setIsVoiceSelectionOpen(false)} />
        )}
        {isCodeImportOpen && (
          <CodeImportPage 
            onClose={() => setIsCodeImportOpen(false)} 
            onImport={handleImportCode}
          />
        )}
        {previewVideoUrl && (
          <VideoPreview 
            url={previewVideoUrl} 
            onClose={() => setPreviewVideoUrl(null)} 
          />
        )}
      </AnimatePresence>

      <FullscreenImage 
        src={fullscreenImage} 
        isOpen={!!fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
      
      <Snackbar 
        message={snackbarMessage} 
        isOpen={isSnackbarOpen} 
        onClose={() => closeState(setIsSnackbarOpen)} 
      />
    </>
  );
};
