import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/transitions';
import { useConnectors } from '../../hooks/useConnectors';

interface ConnectorsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectorsPage: React.FC<ConnectorsPageProps> = ({ isOpen, onClose }) => {
  const { status, loading, actionLoading, error, connectGoogle, disconnectGoogle } = useConnectors();

  if (!isOpen) return null;

  return (
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
        <div className="flex flex-col gap-4">
          <div className="px-1">
            <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant,#938F99)] leading-5">
              Подключите сервисы Google Workspace, чтобы ассистент мог просматривать ваш календарь событий, искать документы на Диске и читать нужные файлы по запросу.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-[var(--md-sys-color-error-container,#93000A)]/30 border border-[var(--md-sys-color-error,#FFB4AB)]/40 text-[var(--md-sys-color-error,#FFB4AB)] text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <section aria-label="Google Workspace Connector">
            <div className="rounded-[24px] bg-[var(--md-sys-color-surface-container-low,#141218)] p-4 border border-[var(--md-sys-color-outline-variant,#49454F)]/30 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-primary,#D0BCFF)]">
                    <span className="material-symbols-outlined text-[26px]">hub</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] font-medium leading-6 tracking-[0.15px]">
                        Google Workspace
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          status.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[var(--md-sys-color-surface-container-highest,#2B2930)] text-[var(--md-sys-color-on-surface-variant,#938F99)]'
                        }`}
                      >
                        {loading ? 'Проверка...' : status.connected ? 'Подключено' : 'Не подключено'}
                      </span>
                    </div>
                    <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant,#938F99)]">
                      Календарь, Диск, Документы
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-[var(--md-sys-color-surface-container,#1D1B20)] p-3 flex flex-col gap-2 border border-[var(--md-sys-color-outline-variant,#49454F)]/20">
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--md-sys-color-on-surface,#E6E0E9)]">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary,#D0BCFF)]">calendar_today</span>
                  <span>Google Календарь — чтение расписания и событий</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--md-sys-color-on-surface,#E6E0E9)]">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary,#D0BCFF)]">folder_open</span>
                  <span>Google Диск — поиск документов и файлов</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--md-sys-color-on-surface,#E6E0E9)]">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary,#D0BCFF)]">description</span>
                  <span>Google Документы — чтение содержимого файлов</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {status.connected ? (
                  <button
                    type="button"
                    onClick={disconnectGoogle}
                    disabled={actionLoading || loading}
                    className="px-4 py-2.5 rounded-full text-[14px] font-medium tracking-[0.1px] bg-[var(--md-sys-color-surface-container-highest,#2B2930)] hover:bg-[var(--md-sys-color-error,#FFB4AB)]/20 hover:text-[var(--md-sys-color-error,#FFB4AB)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-[var(--md-sys-color-on-surface,#E6E0E9)]"
                  >
                    {actionLoading ? 'Отключение...' : 'Отключить доступ'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={connectGoogle}
                    disabled={actionLoading || loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium tracking-[0.1px] bg-[var(--md-sys-color-primary,#D0BCFF)] text-[var(--md-sys-color-on-primary,#381E72)] hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_link</span>
                    <span>{actionLoading ? 'Подключение...' : 'Подключить Google'}</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
};
