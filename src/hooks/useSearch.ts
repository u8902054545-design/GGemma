import { useState, useCallback } from 'react';

export type SearchMode = 'web' | 'youtube' | null;

export const useSearch = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>(null);

  const isSearchActive = searchMode === 'web';
  const isYouTubeSearchActive = searchMode === 'youtube';

  const toggleSearch = useCallback((mode: 'web' | 'youtube' = 'web') => {
    setSearchMode((prev) => (prev === mode ? null : mode));
  }, []);

  const toggleYouTubeSearch = useCallback(() => {
    setSearchMode((prev) => (prev === 'youtube' ? null : 'youtube'));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchMode(null);
  }, []);

  const setIsSearchActive = useCallback((active: boolean | ((prev: boolean) => boolean)) => {
    setSearchMode((prev) => {
      const prevVal = prev === 'web';
      const nextVal = typeof active === 'function' ? active(prevVal) : active;
      return nextVal ? 'web' : null;
    });
  }, []);

  const setIsYouTubeSearchActive = useCallback((active: boolean | ((prev: boolean) => boolean)) => {
    setSearchMode((prev) => {
      const prevVal = prev === 'youtube';
      const nextVal = typeof active === 'function' ? active(prevVal) : active;
      return nextVal ? 'youtube' : null;
    });
  }, []);

  return {
    searchMode,
    setSearchMode,
    isSearchActive,
    setIsSearchActive,
    isYouTubeSearchActive,
    setIsYouTubeSearchActive,
    toggleSearch,
    toggleYouTubeSearch,
    resetSearch
  };
};
