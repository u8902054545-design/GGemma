import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useConnectors } from '../../hooks/useConnectors';
import { ConnectorGoogleWorkspacePage } from './ConnectorGoogleWorkspacePage';
import { ConnectorGoogleContactsPage } from './ConnectorGoogleContactsPage';
import { GoogleWorkspaceIcon } from '../IconsApp/GoogleWorkspaceIcon';

interface ConnectorsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectorsPage: React.FC<ConnectorsPageProps> = ({ isOpen, onClose }) => {
  const { status: workspaceStatus, loading: workspaceLoading, error: workspaceError } = useConnectors('google');
  const { status: contactsStatus, loading: contactsLoading, error: contactsError } = useConnectors('google_contacts');

  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState(false);
  const [isGoogleContactsOpen, setIsGoogleContactsOpen] = useState(false);

  const error = workspaceError || contactsError;

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ zIndex: 100001 }}
        className="fixed inset-0 bg-[var(--md-sys-color-background,#000000)] text-[var(--md-sys-color-on-surface,#E6E0E9)] flex flex-col font-sans select-none overflow-hidden"
      >
        <header className="w-full">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-2 pt-1.5 pb-1.5 min-h-[52px]">
            <div className="flex w-12 items-center justify-start">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--md-sys-color-on-surface,#E6E0E9)] hover:bg-[var(--md-sys-color-on-surface-variant)]/10 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            </div>

            <h1 className="text-[22px] font-normal leading-7 tracking-normal text-[var(--md-sys-color-on-surface,#E6E0E9)] text-center truncate">
              Connectors
            </h1>

            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl w-full px-4 pt-2 pb-8 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="px-1">
              <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant,#938F99)] leading-5">
                Connect external apps and services to expand Gemma's capabilities and access your workflow data on demand.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-error-container,#93000A)]/30 border border-[var(--md-sys-color-error,#FFB4AB)]/40 text-[var(--md-sys-color-error,#FFB4AB)] text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <section aria-label="Google Workspace" className="flex flex-col gap-2.5">
              <h2 className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant,#938F99)] uppercase tracking-wider px-2">
                Google Workspace
              </h2>

              <button
                type="button"
                onClick={() => setIsGoogleWorkspaceOpen(true)}
                className="w-full text-left rounded-[24px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-4 border border-[var(--md-sys-color-outline-variant,#49454F)]/30 hover:border-[var(--md-sys-color-outline-variant,#49454F)]/60 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] px-2.5">
                    <GoogleWorkspaceIcon className="w-full h-auto" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px] text-[var(--md-sys-color-on-surface,#E6E0E9)] truncate">
                        Google Workspace
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          workspaceStatus.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-on-surface-variant,#938F99)]'
                        }`}
                      >
                        {workspaceLoading ? 'Checking...' : workspaceStatus.connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)] truncate">
                      Calendar, Drive, Docs
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)] shrink-0">
                  chevron_right
                </span>
              </button>
            </section>

            <section aria-label="Services Google" className="flex flex-col gap-2.5">
              <h2 className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant,#938F99)] uppercase tracking-wider px-2">
                Services Google
              </h2>

              <button
                type="button"
                onClick={() => setIsGoogleContactsOpen(true)}
                className="w-full text-left rounded-[24px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-4 border border-[var(--md-sys-color-outline-variant,#49454F)]/30 hover:border-[var(--md-sys-color-outline-variant,#49454F)]/60 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] px-2.5">
                    <span className="material-symbols-outlined text-[28px] text-[var(--md-sys-color-primary,#D0BCFF)]">contacts</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.15px] text-[var(--md-sys-color-on-surface,#E6E0E9)] truncate">
                        Google Contacts
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          contactsStatus.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-on-surface-variant,#938F99)]'
                        }`}
                      >
                        {contactsLoading ? 'Checking...' : contactsStatus.connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)] truncate">
                      Search and manage address book
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant,#938F99)] shrink-0">
                  chevron_right
                </span>
              </button>
            </section>
          </div>
        </main>
      </motion.div>

      <AnimatePresence>
        {isGoogleWorkspaceOpen && (
          <ConnectorGoogleWorkspacePage
            isOpen={isGoogleWorkspaceOpen}
            onClose={() => setIsGoogleWorkspaceOpen(false)}
          />
        )}
        {isGoogleContactsOpen && (
          <ConnectorGoogleContactsPage
            isOpen={isGoogleContactsOpen}
            onClose={() => setIsGoogleContactsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
