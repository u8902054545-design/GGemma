import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GemmaIcon } from './IconsApp/GemmaIcon';
import { GoogleIcon } from './IconsApp/GoogleIcon';
import Snackbar from './Snackbar';
import { pageVariants, mdEasing, mdDuration } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';

import '@material/web/progress/circular-progress.js';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSnack, setShowSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const { t } = useLanguage();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await onLoginSuccess();
    } catch (error: any) {
      console.error(error);
      setSnackMessage(error.message || t('login.error'));
      setShowSnack(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[var(--md-sys-color-background)] p-4 overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-primary)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--md-sys-color-tertiary)] blur-[120px]" />
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full max-w-[400px] bg-[var(--md-sys-color-surface)] rounded-[28px] p-8 flex flex-col items-center border border-[var(--md-sys-color-outline-variant)]/20 shadow-2xl z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="mb-6"
        >
          <GemmaIcon className="w-16 h-16" />
        </motion.div>

        <h1 className="text-2xl font-medium tracking-tight mb-2 text-[var(--md-sys-color-on-surface)] text-center">
          {t('login.title')}
        </h1>
        
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mb-10 text-center">
          {t('login.subtitle')}
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-[52px] flex items-center justify-center gap-3 bg-[var(--md-sys-color-primary)] hover:opacity-90 text-[var(--md-sys-color-on-primary)] rounded-full px-6 text-[14px] font-medium transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <md-circular-progress 
              indeterminate 
              style={{ 
                '--md-circular-progress-size': '24px',
                '--md-circular-progress-active-indicator-color': 'var(--md-sys-color-primary)' 
              } as any}
            />
          ) : (
            <>
              <GoogleIcon className="w-5 h-5" />
              <span>{t('login.button')}</span>
            </>
          )}
        </button>

        <div className="mt-10 pt-6 border-t border-[var(--md-sys-color-outline-variant)]/10 w-full flex justify-center">
          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]/30 uppercase tracking-[2px]">
            Material Design 3
          </span>
        </div>
      </motion.div>

      <Snackbar
        message={snackMessage}
        isOpen={showSnack}
        onClose={() => setShowSnack(false)}
      />
    </div>
  );
}
