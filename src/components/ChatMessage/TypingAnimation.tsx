import React from 'react';
import { motion } from 'motion/react';

export const TypingAnimation: React.FC = () => {
  return (
    <div className="flex items-center justify-start py-2">
      <div className="relative flex items-center justify-center w-[70px] h-[40px]">
        {/* Larger Oval Gradient Line with soft glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            padding: '2.5px',
            background: 'linear-gradient(90deg, #446eff, #2e96ff, #b1c5ff, #446eff)',
            backgroundSize: '200% 100%',
            boxShadow: '0 0 15px rgba(68, 110, 255, 0.2)',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {/* Inner hole matches theme background surface */}
          <div className="w-full h-full rounded-full bg-[var(--md-sys-color-surface-container-lowest)]" />
        </motion.div>

        {/* Dots optimized for both themes: Primary color in light, White in dark */}
        <div className="relative flex gap-1.5 items-center justify-center z-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-[var(--md-sys-color-primary)] dark:bg-white"
              style={{
                boxShadow: '0 0 4px rgba(68, 110, 255, 0.2)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
