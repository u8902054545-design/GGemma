import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONNECTOR_DESCRIPTIONS, ConnectorId } from './connectorDescriptions';
import { GoogleWorkspaceIcon } from '../IconsApp/GoogleWorkspaceIcon';
import { GoogleIcon } from '../IconsApp/GoogleIcon';
import { GoogleCalendarIcon } from '../IconsApp/GoogleCalendarIcon';
import { GoogleDriveIcon } from '../IconsApp/GoogleDriveIcon';
import { GoogleDocsIcon } from '../IconsApp/GoogleDocsIcon';
import { GoogleSheetsIcon } from '../IconsApp/GoogleSheetsIcon';
import { GoogleTasksIcon } from '../IconsApp/GoogleTasksIcon';
import { GmailIcon } from '../IconsApp/GmailIcon';
import { GoogleSlidesIcon } from '../IconsApp/GoogleSlidesIcon';
import { GoogleFormsIcon } from '../IconsApp/GoogleFormsIcon';
import { GoogleAppsScriptIcon } from '../IconsApp/GoogleAppsScriptIcon';
import { GoogleChatIcon } from '../IconsApp/GoogleChatIcon';
import { GoogleContactsIcon } from '../IconsApp/GoogleContactsIcon';

interface ConnectorDetailsModalProps {
  connectorId: ConnectorId | null;
  onClose: () => void;
}

export const ConnectorDetailsModal: React.FC<ConnectorDetailsModalProps> = ({
  connectorId,
  onClose,
}) => {
  useEffect(() => {
    if (!connectorId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectorId, onClose]);

  const details = connectorId ? CONNECTOR_DESCRIPTIONS[connectorId] : null;

  const renderIcon = (id: ConnectorId) => {
    switch (id) {
      case 'google_workspace':
        return <GoogleWorkspaceIcon className="w-28 h-6" />;
      case 'google_services':
        return <GoogleIcon className="w-7 h-7" />;
      case 'google_calendar':
        return <GoogleCalendarIcon className="w-7 h-7" />;
      case 'google_drive':
        return <GoogleDriveIcon className="w-7 h-7" />;
      case 'google_docs':
        return <GoogleDocsIcon className="w-7 h-7" />;
      case 'google_sheets':
        return <GoogleSheetsIcon className="w-7 h-7" />;
      case 'google_tasks':
        return <GoogleTasksIcon className="w-7 h-7" />;
      case 'gmail':
        return <GmailIcon className="w-7 h-7" />;
      case 'google_slides':
        return <GoogleSlidesIcon className="w-7 h-7" />;
      case 'google_forms':
        return <GoogleFormsIcon className="w-7 h-7" />;
      case 'google_apps_script':
        return <GoogleAppsScriptIcon className="w-7 h-7" />;
      case 'google_chat':
        return <GoogleChatIcon className="w-7 h-7" />;
      case 'google_contacts':
        return <GoogleContactsIcon className="w-7 h-7" />;
      default:
        return <GoogleIcon className="w-7 h-7" />;
    }
  };

  return (
    <AnimatePresence>
      {details && connectorId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ zIndex: 100005 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 flex items-center justify-center px-5 py-6 font-sans select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] max-h-[82vh] rounded-[28px] bg-[var(--md-sys-color-surface-container-high,#1E1F20)] text-[var(--md-sys-color-on-surface,#E3E3E3)] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 shrink-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  {renderIcon(connectorId)}
                </div>
                <h2 className="text-[22px] font-normal leading-7 text-[var(--md-sys-color-on-surface,#E3E3E3)] truncate">
                  {details.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] hover:bg-white/10 active:scale-90 transition-all -mr-1.5"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
              <p className="text-[14px] leading-[20px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)]">
                {details.description}
              </p>

              <hr className="my-4 border-0 border-t border-[var(--md-sys-color-outline-variant,#444746)]/60" />

              <div>
                <h3 className="text-[14px] font-normal leading-[20px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] mb-3.5">
                  With "{details.title}" Gemma can:
                </h3>

                <div className="flex flex-col gap-3">
                  {details.canDo.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="text-[15px] leading-[22px] text-[var(--md-sys-color-on-surface,#E3E3E3)]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="my-4 border-0 border-t border-[var(--md-sys-color-outline-variant,#444746)]/60" />

              <div>
                <h3 className="text-[14px] font-normal leading-[20px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] mb-3.5">
                  With "{details.title}" Gemma cannot:
                </h3>

                <div className="flex flex-col gap-3">
                  {details.cannotDo.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] shrink-0 mt-0.5">
                        close
                      </span>
                      <span className="text-[15px] leading-[22px] text-[var(--md-sys-color-on-surface,#E3E3E3)]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="my-4 border-0 border-t border-[var(--md-sys-color-outline-variant,#444746)]/60" />

              <div>
                <h3 className="text-[14px] font-normal leading-[20px] text-[var(--md-sys-color-on-surface-variant,#C4C7C5)] mb-2">
                  Example prompts
                </h3>

                <div className="flex flex-col">
                  {details.examplePrompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="py-3 pl-8 pr-2 text-[15px] leading-[22px] text-[var(--md-sys-color-on-surface,#E3E3E3)]"
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
