import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FullscreenImageProps {
  src: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FullscreenImage: React.FC<FullscreenImageProps> = ({ src, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="absolute top-6 right-6 z-[10001]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center justify-center w-12 h-12 bg-[#2a2a2a] border border-[#444] rounded-full shadow-lg hover:bg-[#333] transition-all active:scale-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[28px] text-white">
                close
              </span>
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt="Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
