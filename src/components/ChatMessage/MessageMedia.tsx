import React from 'react';

interface MessageMediaProps {
  imageUrl?: string;
  videoUrl?: string;
  onImageClick?: () => void;
  onVideoClick?: () => void;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({
  imageUrl,
  videoUrl,
  onImageClick,
  onVideoClick
}) => {
  if (!imageUrl && !videoUrl) return null;

  return (
    <>
      {imageUrl && (
        <div
          className="mb-3 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onImageClick}
        >
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-full h-auto object-contain max-h-[400px] rounded-lg"
            onError={(e) => console.error("Image load error:", imageUrl)}
          />
        </div>
      )}

      {videoUrl && (
        <div
          className="mb-3 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity relative group"
          onClick={onVideoClick}
        >
          <video
            src={videoUrl}
            className="max-w-full h-auto object-contain max-h-[400px] rounded-lg opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[48px] bg-black/20 rounded-full p-2">play_circle</span>
          </div>
        </div>
      )}
    </>
  );
};
