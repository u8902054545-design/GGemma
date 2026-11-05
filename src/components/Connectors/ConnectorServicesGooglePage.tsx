import React, { useState } from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useConnectors } from '../../hooks/useConnectors';
import { GoogleIcon } from '../IconsApp/GoogleIcon';
import { GoogleContactsIcon } from '../IconsApp/GoogleContactsIcon';
import { GoogleHomeIcon } from '../IconsApp/GoogleHomeIcon';
import { ConnectorDetailsModal } from './ConnectorDetailsModal';
import { ConnectorId } from './connectorDescriptions';

interface ConnectorServicesGooglePageProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleSwitch: React.FC<{
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel?: string;
}> = ({ checked, disabled = false, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-[var(--md-sys-color-outline-variant,#49454F)] bg-[var(--md-sys-color-surface-container-highest,#2B2930)]'
          : checked
          ? 'border-[var(--md-sys-color-primary,#D0BCFF)] bg-[var(--md-sys-color-primary,#D0BCFF)]'
          : 'border-[var(--md-sys-color-outline,#79747E)] bg-[var(--md-sys-color-surface-container-highest,#2B2930)] hover:border-[var(--md-sys-color-outline-variant,#49454F)]'
      }`}
    >
      <span
        className={`pointer-events-none flex items-center justify-center rounded-full transition-all duration-200 ease-in-out ${
          checked
            ? 'translate-x-[22px] h-6 w-6 bg-[var(--md-sys-color-on-primary,#381E72)] text-[var(--md-sys-color-primary,#D0BCFF)] shadow-sm'
            : 'translate-x-[6px] h-4 w-4 bg-[var(--md-sys-color-outline,#79747E)]'
        }`}
      >
        {checked && (
          <span className="material-symbols-outlined text-[15px] font-bold leading-none select-none">
            check
          </span>
        )}
      </span>
    </button>
  );
};

export const ConnectorServicesGooglePage: React.FC<ConnectorServicesGooglePageProps> = ({ isOpen, onClose }) => {
  const {
    status,
    loading,
    actionLoading,
    error,
    connectGoogle,
    disconnectGoogle,
    toggleGroup,
    toggleTool,
    isGroupEnabled,
    isToolEnabled,
  } = useConnectors('google_contacts');

  const [selectedConnectorId, setSelectedConnectorId] = useState<ConnectorId | null>(null);

  const isServicesGroupActive = status.connected && isGroupEnabled('services_google');
  const isContactsToolActive = isToolEnabled('google_contacts');
  const isHomeToolActive = isToolEnabled('google_home');

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
                Connect your Google account to grant Gemma access to Google services, including Contacts and Google Home, to manage your address book and smart home devices upon request.
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

              {status.connected && (
                <div className="mt-6 w-full max-w-md p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low,#141218)] border border-[var(--md-sys-color-outline-variant,#49454F)]/30 flex items-center justify-between gap-4 text-left">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface,#E6E0E9)]">
                      Enable for Gemma
                    </span>
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant,#938F99)] mt-0.5">
                      Allow AI model to use Google Services during chat conversations
                    </span>
                  </div>
                  <GoogleSwitch
                    checked={isGroupEnabled('services_google')}
                    onChange={() => toggleGroup('services_google')}
                    ariaLabel="Toggle all Google Services connectors"
                  />
                </div>
              )}
            </div>

            <section className="flex flex-col gap-3">
              <h3 className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant,#938F99)] uppercase tracking-wider px-1">
                Included Services
              </h3>

              <div className="rounded-[24px] bg-[var(--md-sys-color-surface-container-low,#141218)] border border-[var(--md-sys-color-outline-variant,#49454F)]/30 divide-y divide-[var(--md-sys-color-outline-variant,#49454F)]/20 overflow-hidden">
                <div className="w-full p-4 flex items-center justify-between gap-3.5 hover:bg-[var(--md-sys-color-surface-container-highest,#2B2930)]/40 transition-colors">
                  <button
                    type="button"
                    onClick={() => setSelectedConnectorId('google_contacts')}
                    className="flex items-start gap-3.5 flex-1 min-w-0 text-left cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] p-2 group-hover:scale-105 transition-transform">
                      <GoogleContactsIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface,#E6E0E9)] truncate">
                        Google Contacts
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)] mt-0.5 line-clamp-2">
                        Search contacts, view address book, create and manage personal contact cards directly from chat.
                      </span>
                    </div>
                  </button>

                  <div className="shrink-0 flex items-center pl-2">
                    <GoogleSwitch
                      checked={isServicesGroupActive && isContactsToolActive}
                      disabled={!status.connected || !isServicesGroupActive}
                      onChange={() => toggleTool('google_contacts')}
                      ariaLabel="Toggle Google Contacts"
                    />
                  </div>
                </div>

                <div className="w-full p-4 flex items-center justify-between gap-3.5 hover:bg-[var(--md-sys-color-surface-container-highest,#2B2930)]/40 transition-colors">
                  <button
                    type="button"
                    onClick={() => setSelectedConnectorId('google_home')}
                    className="flex items-start gap-3.5 flex-1 min-w-0 text-left cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container-highest,#2B2930)] p-2 group-hover:scale-105 transition-transform">
                      <GoogleHomeIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface,#E6E0E9)] truncate">
                        Google Home
                      </span>
                      <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)] mt-0.5 line-clamp-2">
                        Control smart home devices, lights, thermostats, and inspect device statuses directly from chat.
                      </span>
                    </div>
                  </button>

                  <div className="shrink-0 flex items-center pl-2">
                    <GoogleSwitch
                      checked={isServicesGroupActive && isHomeToolActive}
                      disabled={!status.connected || !isServicesGroupActive}
                      onChange={() => toggleTool('google_home')}
                      ariaLabel="Toggle Google Home"
                    />
                  </div>
                </div>
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

