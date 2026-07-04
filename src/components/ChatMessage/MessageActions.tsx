import React from 'react';
import { motion } from 'motion/react';
import { mdEasing, mdDuration } from '../../motion/transitions';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

interface MessageActionsProps {
  isTemporary: boolean;
  localFeedback: 'like' | 'dislike' | null;
  handleFeedback: (type: 'like' | 'dislike' | null) => void;
  handleCopy: (text: string) => void;
  content: string;
  copiedText: string | null;
  isLast: boolean | undefined;
  onSpeech: () => void;
  isSpeaking: boolean;
  isSpeechLoading?: boolean;
  onShowDetails: () => void;
  hideActions?: boolean;
  onRegenerate?: (mode: 'longer' | 'briefly' | 'no_personalization' | 'repeat') => void;
  messageId: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isTemporary,
  localFeedback,
  handleFeedback,
  handleCopy,
  content,
  copiedText,
  isLast,
  onSpeech,
  isSpeaking,
  isSpeechLoading,
  onShowDetails,
  hideActions = false,
  onRegenerate,
  messageId
}) => {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuDirection, setMenuDirection] = React.useState<'down' | 'up'>('down');
  const menuRef = React.useRef<any>(null);
  const anchorId = `regen-btn-${React.useId().replace(/:/g, '')}`;

  React.useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const handleClosed = () => setMenuOpen(false);
    menu.addEventListener('closed', handleClosed);
    return () => {
      menu.removeEventListener('closed', handleClosed);
    };
  }, []);

  React.useEffect(() => {
    if (menuOpen) {
      const bubble = document.getElementById(`msg-bubble-${messageId}`);
      if (bubble) {
        const rect = bubble.getBoundingClientRect();
        const threshold = window.innerHeight - 250;
        if (rect.bottom > threshold) {
          setMenuDirection('up');
        } else {
          setMenuDirection('down');
        }
      }
    }
  }, [menuOpen, messageId]);

  React.useEffect(() => {
    if (!menuOpen) return;
    let active = true;
    const handleDocumentClick = (e: MouseEvent) => {
      if (!active) return;
      const menu = menuRef.current;
      if (menu && !menu.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const timer = setTimeout(() => {
      if (active) {
        document.addEventListener('click', handleDocumentClick);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: mdDuration.medium4, ease: mdEasing.standard }}
      className="mt-4 flex flex-col gap-3 w-full select-none"
    >
      {!hideActions && (
        <div className="flex items-center gap-1 w-full">
        {!isTemporary && (
          <>
            <button
              onClick={() => handleFeedback(localFeedback === 'like' ? null : 'like')}
              className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
                localFeedback === 'like' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${localFeedback === 'like' ? 'FILL' : ''}`} style={{ fontVariationSettings: localFeedback === 'like' ? "'FILL' 1" : "" }}>
                thumb_up
              </span>
            </button>
            <button
              onClick={() => handleFeedback(localFeedback === 'dislike' ? null : 'dislike')}
              className={`p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
                localFeedback === 'dislike' ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${localFeedback === 'dislike' ? 'FILL' : ''}`} style={{ fontVariationSettings: localFeedback === 'dislike' ? "'FILL' 1" : "" }}>
                thumb_down
              </span>
            </button>
          </>
        )}
        {isLast && onRegenerate && (
          <>
            <md-icon-button
              id={anchorId}
              onClick={() => setMenuOpen(prev => !prev)}
              style={{
                '--md-icon-button-icon-color': 'var(--md-sys-color-on-surface-variant)',
                '--md-icon-button-state-layer-color': 'var(--md-sys-color-on-surface-variant)'
              }}
            >
              <md-icon>refresh</md-icon>
            </md-icon-button>
            <md-menu
              ref={menuRef}
              anchor={`msg-bubble-${messageId}`}
              open={menuOpen || undefined}
              anchorCorner={menuDirection === 'up' ? 'start-start' : 'end-start'}
              menuCorner={menuDirection === 'up' ? 'end-start' : 'start-start'}
              yOffset={menuDirection === 'up' ? -4 : 4}
              positioning="fixed"
              style={{
                '--md-menu-container-color': 'var(--md-sys-color-surface-container-high)',
                '--md-menu-item-label-text-color': 'var(--md-sys-color-on-surface)',
                '--md-menu-item-headline-color': 'var(--md-sys-color-on-surface)'
              }}
            >
              <md-menu-item onClick={() => { setMenuOpen(false); onRegenerate('longer'); }}>
                <md-icon slot="start">expand</md-icon>
                <div slot="headline">{t('regenerate.longer')}</div>
              </md-menu-item>
              <md-menu-item onClick={() => { setMenuOpen(false); onRegenerate('briefly'); }}>
                <md-icon slot="start">compress</md-icon>
                <div slot="headline">{t('regenerate.briefly')}</div>
              </md-menu-item>
              <md-menu-item onClick={() => { setMenuOpen(false); onRegenerate('no_personalization'); }}>
                <md-icon slot="start">person_cancel</md-icon>
                <div slot="headline">{t('regenerate.no_personalization')}</div>
              </md-menu-item>
              <md-menu-item onClick={() => { setMenuOpen(false); onRegenerate('repeat'); }}>
                <md-icon slot="start">refresh</md-icon>
                <div slot="headline">{t('regenerate.repeat')}</div>
              </md-menu-item>
            </md-menu>
          </>
        )}
        <button
          onClick={() => handleCopy(content)}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {copiedText === content ? 'check' : 'content_copy'}
          </span>
        </button>

        <button
          onClick={onShowDetails}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            more_horiz
          </span>
        </button>

        <button
          onClick={onSpeech}
          disabled={isSpeechLoading}
          className={`ml-auto p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center relative ${
            isSpeaking
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md scale-105'
              : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
          } ${isSpeechLoading ? 'opacity-80' : ''}`}
          title={isSpeaking ? "Stop" : "Listen"}
        >
          {isSpeechLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
               <md-circular-progress indeterminate style={{ '--md-circular-progress-size': '36px', '--md-circular-progress-active-indicator-width': '3' }}></md-circular-progress>
            </div>
          )}
          <span className="material-symbols-outlined text-[20px]">
            {isSpeaking ? 'pause' : 'volume_up'}
          </span>
        </button>
      </div>
      )}

      {isLast && (
        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70 leading-tight">
          {t('message.warning')}
        </p>
      )}
    </motion.div>
  );
};
