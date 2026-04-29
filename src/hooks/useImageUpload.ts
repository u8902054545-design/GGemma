import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((file: File | undefined) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
    } else {
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [previewUrl]);

  const clearSelection = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  return {
    selectedFile,
    previewUrl,
    handleFileChange,
    clearSelection
  };
};
