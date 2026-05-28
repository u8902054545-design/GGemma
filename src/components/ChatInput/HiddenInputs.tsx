import React, { forwardRef } from 'react';

interface HiddenInputsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HiddenInputs = forwardRef<HTMLInputElement, HiddenInputsProps>(({
  fileInputRef,
  cameraInputRef,
  videoInputRef,
  handleFileChange
}, ref) => {
  return (
    <>
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
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </>
  );
});

HiddenInputs.displayName = 'HiddenInputs';
