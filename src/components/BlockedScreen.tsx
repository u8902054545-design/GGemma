import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../motion/transitions';

export default function BlockedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[var(--md-sys-color-background)] p-4 overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-error)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-primary)] blur-[120px]" />
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full max-w-[420px] bg-[var(--md-sys-color-surface)] rounded-[28px] p-8 flex flex-col items-center border border-[var(--md-sys-color-outline-variant)]/20 shadow-2xl z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="mb-6 text-[var(--md-sys-color-error)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
            />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-semibold tracking-tight mb-3 text-[var(--md-sys-color-on-surface)] text-center">
          Access Restricted
        </h1>
        
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mb-6 text-center leading-relaxed">
          Unfortunately, the Gemma application is not available in your country. Access from your region has been blocked. We apologize for any inconvenience.
        </p>

        <div className="w-full pt-6 border-t border-[var(--md-sys-color-outline-variant)]/10 flex flex-col items-center gap-2">
          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]/30 uppercase tracking-[2px]">
            Geoblocking Enabled
          </span>
          <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)]/20 font-mono">
            IPINFO Security Shield
          </span>
        </div>
      </motion.div>
    </div>
  );
}
