import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, SUPABASE_ENDPOINT } from '../config';

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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = async (text: string) => {
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
          className="fixed inset-0 bg-[#1c1b1f] z-[200] flex flex-col"
        >
          <div className="p-4 flex items-center gap-3 border-b border-white/5">
            <button
              onClick={() => {
                setQuery('');
                onClose();
              }}
              className="p-2 hover:bg-white/10 rounded-full text-[#e6e1e5] transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats and messages..."
              className="flex-1 bg-transparent border-none outline-none text-[#e6e1e5] text-base placeholder:text-[#938f99]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#938f99]">
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
                    className="w-full px-6 py-4 hover:bg-white/5 rounded-2xl text-left transition-all active:scale-[0.98]"
                  >
                    <div className="text-sm font-medium text-[#e6e1e5] truncate">
                      {res.chat_title}
                    </div>
                    {res.content && (
                      <div className="text-xs text-[#938f99] truncate mt-1 font-normal">
                        {res.content}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-[#938f99] gap-2 text-center">
                <span className="material-symbols-outlined text-[48px] opacity-20">search_off</span>
                <p className="text-sm font-medium">Nothing found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
