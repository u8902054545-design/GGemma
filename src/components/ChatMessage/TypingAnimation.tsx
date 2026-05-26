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
            padding: '2px',
            background: 'linear-gradient(90deg, #446eff, #2e96ff, #b1c5ff, #446eff)',
            backgroundSize: '200% 100%',
            boxShadow: '0 0 12px rgba(68, 110, 255, 0.3)',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
            opacity: [0.6, 1, 0.6],
            filter: ['brightness(1) blur(0.5px)', 'brightness(1.3) blur(1px)', 'brightness(1) blur(0.5px)'],
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
            },
            filter: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {/* Inner hole matches theme background */}
          <div className="w-full h-full rounded-full bg-[var(--md-sys-color-background)]" />
        </motion.div>

        {/* Dots: Black in light theme, White in dark theme */}
        <div className="relative flex gap-1.5 items-center justify-center z-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-black dark:bg-white"
              style={{
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.1) dark:rgba(255, 255, 255, 0.4)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
