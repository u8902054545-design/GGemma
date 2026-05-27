import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoPreviewProps {
  url: string;
  onClose: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ url, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={url}
          className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
          playsInline
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <span className="material-symbols-outlined text-white">close</span>
        </button>

        {/* Play/Pause Button Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className={`w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all pointer-events-auto active:scale-90 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
          >
            <span className="material-symbols-outlined text-white text-[48px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
