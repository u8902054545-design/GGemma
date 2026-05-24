import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { SUPABASE_ENDPOINT, supabase } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

interface VoiceSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSelection: React.FC<VoiceSelectionProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem('selected_voice') || 'Zephyr';
  });
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const { playPcmBuffer, stop: stopPcm, isPlaying } = useVoicePlayer();

  const PREVIEW_TEXT = t('settings.voice.preview');

  useEffect(() => {
    const fetchRemoteSettings = async () => {
      if (!user) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          }
        });
        const data = await response.json();
        
        if (data?.selected_voice && data.selected_voice !== selectedVoice) {
          setSelectedVoice(data.selected_voice);
          localStorage.setItem('selected_voice', data.selected_voice);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchRemoteSettings();
  }, [user]);

  const updateVoice = async (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('selected_voice', voice);

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            settings: { selected_voice: voice }
          }),
        });
      } catch (err) {
        console.error('Failed to sync voice:', err);
      }
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      setPlayingVoice(null);
    }
  }, [isPlaying]);

  const handlePlayPause = useCallback(async (e: React.MouseEvent, voiceName: string) => {
    e.stopPropagation();
    
    if (playingVoice === voiceName) {
      stopPcm();
      setPlayingVoice(null);
      return;
    }

    stopPcm();
    setPlayingVoice(voiceName);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: PREVIEW_TEXT,
          publicModelName: 'Gemini 3.1 Flash TTS Preview',
          voice: voiceName,
          isAudioOnly: true 
        }),
      });

      if (!response.ok) throw new Error('Preview failed');

      const audioData = await response.arrayBuffer();
      await playPcmBuffer(audioData);

    } catch (error) {
      console.error('Preview error:', error);
      setPlayingVoice(null);
    }
  }, [playingVoice, stopPcm, playPcmBuffer]);

  if (!isOpen) return null;

  const voices = [
    'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 
    'Callirrhoe', 'Autonoe', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 
    'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia', 'Achernar', 
    'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 
    'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat'
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
      className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden"
    >
      <header className="w-full p-4 flex items-center justify-start">
        <button
          onClick={() => { stopPcm(); onClose(); }}
          className="p-3 hover:bg-white/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-start justify-start px-6 pb-8 overflow-y-auto w-full max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-normal text-white mt-2 mb-6 tracking-tight align-left w-full">
          {t('settings.voice.selection.title')}
        </h1>

        <div className="w-full flex flex-col">
          {voices.map((voice) => {
            const isSelected = selectedVoice === voice;
            const isPlayingThis = playingVoice === voice;

            return (
              <button
                key={voice}
                onClick={() => updateVoice(voice)}
                className="ripple-container w-full py-4 px-3 flex items-center justify-between border-b border-[#111111] hover:bg-white/5 rounded-xl transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {isSelected && (
                      <span className="material-symbols-outlined text-[24px] text-[var(--md-sys-color-primary)]">
                        check
                      </span>
                    )}
                  </div>
                  <span className={`text-[16px] font-medium transition-colors ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-white'}`}>
                    {voice}
                  </span>
                </div>

                <div
                  onClick={(e) => handlePlayPause(e, voice)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                >
                  <span className={`material-symbols-outlined text-[22px] ${isPlayingThis ? 'text-[var(--md-sys-color-primary)]' : 'text-[#555555]'}`}>
                    {isPlayingThis ? 'pause' : 'play_arrow'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};
