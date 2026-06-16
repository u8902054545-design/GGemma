import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, SUPABASE_ENDPOINT } from '../config';
import { useLanguage } from '../hooks/useLanguage';
import { useChatHistory } from '../hooks/useChatHistory';

interface SearchResult {
  chat_id: string;
  chat_title: string;
  content?: string;
  type: 'chat' | 'message';
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (id: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectChat }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { isChatHistoryEnabled } = useChatHistory();

  useEffect(() => {
    if (!query.trim() || !isChatHistoryEnabled) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, isChatHistoryEnabled]);

  const handleSearch = async (text: string) => {
    if (!isChatHistoryEnabled) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`${SUPABASE_ENDPOINT}?search_query=${encodeURIComponent(text)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 bg-[var(--md-sys-color-surface)] z-[200] flex flex-col"
        >
          <div className="p-4 flex items-center gap-3 border-b border-[var(--md-sys-color-outline-variant)]/10">
            <button
              onClick={() => {
                setQuery('');
                onClose();
              }}
              className="p-2 hover:bg-[var(--md-sys-color-on-surface-variant)]/10 rounded-full text-[var(--md-sys-color-on-surface)] transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('chat.search.placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-[var(--md-sys-color-on-surface)] text-base placeholder:text-[var(--md-sys-color-on-surface-variant)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[var(--md-sys-color-on-surface-variant)]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && (
              <div className="flex justify-center p-8">
                <div className="w-5 h-5 border-2 border-[#c2e7ff] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="p-2 flex flex-col gap-1">
                {results.map((res, i) => (
                  <button
                    key={`${res.chat_id}-${i}`}
                    onClick={() => {
                      onSelectChat(res.chat_id);
                      setQuery('');
                      onClose();
                    }}
                    className="w-full px-6 py-4 hover:bg-[var(--md-sys-color-on-surface-variant)]/5 rounded-2xl text-left transition-all active:scale-[0.98]"
                  >
                    <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                      {res.chat_title}
                    </div>
                    {res.content && (
                      <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-1 font-normal">
                        {res.content}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-[var(--md-sys-color-on-surface-variant)] gap-2 text-center">
                <span className="material-symbols-outlined text-[48px] opacity-20">search_off</span>
                <p className="text-sm font-medium">{t('chat.search.nothing')}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
