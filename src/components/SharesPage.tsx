import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../motion/transitions';
import { useLanguage } from '../hooks/useLanguage';
import { getAllUserShares, deleteShareById, deleteAllUserShares, SharedChat } from '../Functions/shareUtils';
import Snackbar from './Snackbar';
import { DeleteAllSharesDialog } from './DeleteAllSharesDialog';

interface SharesPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharesPage: React.FC<SharesPageProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [shares, setShares] = useState<SharedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen) {
      loadShares();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [isOpen]);

  const loadShares = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUserShares();
      if (mountedRef.current) {
        setShares(data);
      }
    } catch (err) {
      console.error(err);
      showSnackbar(t('shared.load_error') || 'Failed to load links');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  };

  const handleCopy = async (share: SharedChat) => {
    const url = `${window.location.origin}/shared/${share.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(share.id);
      showSnackbar(t('dialog.share.copied') || 'Link copied!');
      setTimeout(() => {
        if (mountedRef.current) setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDelete = async (shareId: string) => {
    try {
      await deleteShareById(shareId);
      if (mountedRef.current) {
        setShares(prev => prev.filter(s => s.id !== shareId));
        showSnackbar(t('snackbar.chatUnshared') || 'Link deleted');
      }
    } catch (err) {
      console.error(err);
      showSnackbar(t('dialog.share.error.delete') || 'Failed to delete link');
    }
  };

  const handleDeleteAllConfirm = async () => {
    try {
      await deleteAllUserShares();
      if (mountedRef.current) {
        setShares([]);
        showSnackbar(t('shared.all_deleted') || 'All links removed');
      }
    } catch (err) {
      console.error(err);
      showSnackbar(t('dialog.share.error.delete') || 'Failed to delete links');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 100001 }}
      className="fixed inset-0 bg-[var(--md-sys-color-background)] flex flex-col font-sans overflow-hidden"
    >
      <header className="w-full p-4 flex items-center justify-start shrink-0">
        <button
          onClick={onClose}
          className="p-3 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full transition-colors text-[var(--md-sys-color-on-surface-variant)] active:scale-90"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-start justify-start px-6 overflow-y-auto w-full max-w-[600px] mx-auto pb-4 custom-scrollbar">
        <h1 className="text-[32px] font-normal text-[var(--md-sys-color-on-surface)] mt-2 mb-2 tracking-tight align-left w-full">
          {t('shared.profile_title') || 'Public links'}
        </h1>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mb-6 leading-relaxed">
          {t('shared.profile_desc') || 'Manage public links to your chats. Anyone with the link can view the snapshot.'}
        </p>

        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[36px] text-[var(--md-sys-color-primary)]">progress_activity</span>
          </div>
        ) : shares.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[64px] text-[var(--md-sys-color-on-surface-variant)] opacity-30 mb-4">link_off</span>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] opacity-70">
              {t('shared.no_links') || 'You have not shared any chats yet.'}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 mt-2">
            <AnimatePresence mode="popLayout">
              {shares.map((share) => (
                <motion.div
                  key={share.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full p-5 bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[24px] shadow-sm flex flex-col gap-3 transition-colors mb-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-md font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {share.title}
                      </h3>
                      <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 mt-0.5">
                        {new Date(share.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-[var(--md-sys-color-primary)] select-all truncate bg-[var(--md-sys-color-surface-container-highest)] p-2.5 rounded-xl border border-[var(--md-sys-color-outline-variant)]/5">
                    {`${window.location.origin}/shared/${share.id}`}
                  </div>

                  <div className="flex justify-end items-center gap-2 mt-1">
                    <button
                      onClick={() => handleCopy(share)}
                      className={`p-2 rounded-full transition-all flex items-center justify-center border-none ${
                        copiedId === share.id 
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
                          : 'hover:bg-[var(--md-sys-color-on-surface-variant)]/10 text-[var(--md-sys-color-on-surface-variant)] bg-transparent'
                      }`}
                      title={t('dialog.share.copy')}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {copiedId === share.id ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDelete(share.id)}
                      className="p-2 hover:bg-[var(--md-sys-color-error)]/10 text-[var(--md-sys-color-error)] rounded-full transition-colors flex items-center justify-center bg-transparent border-none"
                      title={t('dialog.delete.confirm') || 'Delete'}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Delete All Sticky Footer */}
      <div className="w-full p-6 shrink-0 border-t border-[var(--md-sys-color-outline-variant)]/10 bg-[var(--md-sys-color-background)] flex justify-center">
        <button
          onClick={() => setIsDeleteAllOpen(true)}
          disabled={isLoading || shares.length === 0}
          className="w-full max-w-[400px] h-12 flex items-center justify-center gap-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white border-none rounded-full font-medium transition-all active:scale-[0.98] disabled:opacity-30 disabled:scale-100 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
          <span>{t('shared.delete_all') || 'Remove all links'}</span>
        </button>
      </div>

      <DeleteAllSharesDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAllConfirm}
      />

      <Snackbar
        message={snackbarMessage}
        isOpen={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        duration={2000}
      />
    </motion.div>
  );
};
export default SharesPage;
