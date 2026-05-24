import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../motion/transitions';
import { APP_VERSION } from '../versionApp';
import { SettingsApp } from './Settings/settingsApp';
import { useLanguage } from '../hooks/useLanguage';

import '@material/web/progress/circular-progress.js';

const ProfileDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useLanguage();

  if (!user) return null;

  const userAvatar = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0];
  const userEmail = user.email;

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onClose();
      setTimeout(async () => {
        await signOut();
      }, 500);
    }, 800);
  };

  const drawerView = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-drawer"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden"
        >
          <header className="w-full p-4 flex items-center justify-end">
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className="p-3 hover:bg-white/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90 disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </header>

          <main className="flex-1 flex flex-col items-center justify-start pt-8 px-6 overflow-y-auto">
            <div className="w-full max-w-[400px] bg-[#111111] border border-[#222222] rounded-[28px] p-8 flex flex-col items-center shadow-2xl relative">
              <div className="relative mb-6">
                <div className="absolute -inset-4 animate-gradient rounded-full blur-2xl opacity-10"></div>
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#333333] bg-[#1a1a1a] flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--google-blue)] flex items-center justify-center text-white text-4xl font-medium">
                      {userName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-[22px] font-medium text-white mb-1 text-center">
                {userName}
              </h2>
              <p className="text-[#999999] text-sm mb-8">
                {userEmail}
              </p>

              <div className="w-full pt-4 border-t border-[#222222]">
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="ripple-container w-full h-12 flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#333333] rounded-full font-medium transition-all disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <md-circular-progress indeterminate />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span>{t('profile.signout')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-1">
                <p className="text-[11px] text-[#555555] tracking-wide">
                  {t('profile.version')} {APP_VERSION}
                </p>
              </div>
            </div>

            <div className="w-full max-w-[400px] mt-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[28px] p-4 flex flex-col items-center shadow-2xl">
              <button
                onClick={() => setIsSettingsOpen(true)}
                disabled={isLoggingOut}
                className="ripple-container w-full h-12 flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#1a1a1a] text-white border border-[#222222] rounded-full font-medium transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)]">settings</span>
                <span>{t('profile.settings')}</span>
              </button>
            </div>
            
            <p className="mt-8 text-[12px] text-[#555555] font-medium tracking-wide">
              {t('profile.google_account')}
            </p>
          </main>

          <AnimatePresence>
            {isSettingsOpen && (
              <SettingsApp isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerView, document.body);
};

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userAvatar = user.user_metadata?.avatar_url;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full overflow-hidden border border-[#1a1a1a] hover:ring-4 hover:ring-white/5 transition-all active:scale-95 shadow-sm bg-black"
      >
        {userAvatar ? (
          <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[22px] text-gray-400">person_outline</span>
        )}
      </button>

      <ProfileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
