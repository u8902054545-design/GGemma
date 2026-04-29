import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);

  const toggleSearch = useCallback(() => {
    setIsSearchActive((prev) => !prev);
  }, []);

  const resetSearch = useCallback(() => {
    setIsSearchActive(false);
  }, []);

  return {
    isSearchActive,
    setIsSearchActive,
    toggleSearch,
    resetSearch
  };
};
