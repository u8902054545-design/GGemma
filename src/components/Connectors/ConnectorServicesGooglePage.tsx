import React, { useState } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useConnectors } from '../../hooks/useConnectors';
import { GoogleIcon } from '../IconsApp/GoogleIcon';
import { GoogleContactsIcon } from '../IconsApp/GoogleContactsIcon';
import { ConnectorDetailsModal } from './ConnectorDetailsModal';
import { ConnectorId } from './connectorDescriptions';

interface ConnectorServicesGooglePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectorServicesGooglePage: React.FC<ConnectorServicesGooglePageProps> = ({ isOpen, onClose }) => {
  const { status, loading, actionLoading, error, connectGoogle, disconnectGoogle } = useConnectors('google_contacts');
  const [selectedConnectorId, setSelectedConnectorId] = useState<ConnectorId | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ zIndex: 100002 }}
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
              Services Google
            </h1>

            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl w-full px-4 pt-2 pb-8 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6">
            {error && (
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-error-container,#93000A)]/30 border border-[var(--md-sys-color-error,#FFB4AB)]/40 text-[var(--md-sys-color-error,#FFB4AB)] text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col items-center text-center pt-4 pb-2">
              <div className="flex items-center justify-center px-6 py-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] mb-4">
                <GoogleIcon className="w-10 h-10" />
              </div>

              <h2 className="text-[24px] font-medium text-[var(--md-sys-color-on-surface,#E6E0E9)] mb-1">
                Services Google
              </h2>

              <div className="inline-flex items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                    status.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-on-surface-variant,#938F99)]'
                  }`}
                >
                  {loading ? 'Checking status...' : status.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>

              <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant,#938F99)] leading-relaxed max-w-md">
                Connect your Google account to grant Gemma access to Google services, including Contacts, to search and manage your address book upon request.
              </p>

              <div className="mt-6 w-full max-w-xs">
                {status.connected ? (
                  <button
                    type="button"
                    onClick={disconnectGoogle}
                    disabled={actionLoading || loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full text-[15px] font-medium bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-error,#FFB4AB)] hover:bg-[var(--md-sys-color-error,#FFB4AB)]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                    <span>{actionLoading ? 'Disabling...' : 'Disable'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={connectGoogle}
                    disabled={actionLoading || loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full text-[15px] font-medium bg-[var(--md-sys-color-primary,#D0BCFF)] text-[var(--md-sys-color-on-primary,#381E72)] hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                    <span>{actionLoading ? 'Connecting...' : 'Connect'}</span>
                  </button>
                )}
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <h3 className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant,#938F99)] uppercase tracking-wider px-1">
                Included Services
              </h3>

              <div className="rounded-[24px] bg-[var(--md-sys-color-surface-container-low,#141218)] border border-[var(--md-sys-color-outline-variant,#49454F)]/30 divide-y divide-[var(--md-sys-color-outline-variant,#49454F)]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedConnectorId('google_contacts')}
                  className="w-full text-left p-4 flex items-start gap-3.5 hover:bg-[var(--md-sys-color-surface-container-highest,#2B2930)]/40 active:bg-[var(--md-sys-color-surface-container-highest,#2B2930)]/70 transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] p-2">
                    <GoogleContactsIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface,#E6E0E9)]">
                      Google Contacts
                    </span>
                    <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)] mt-0.5">
                      Search contacts, view address book, create and manage personal contact cards directly from chat.
                    </span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </main>
      </motion.div>

      <ConnectorDetailsModal
        connectorId={selectedConnectorId}
        onClose={() => setSelectedConnectorId(null)}
      />
    </>
  );
};
