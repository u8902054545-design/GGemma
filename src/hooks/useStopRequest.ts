import { useRef, useCallback } from 'react';

export const useStopRequest = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const createSignal = useCallback(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  const stopRequest = useCallback((onStop?: () => void) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      if (onStop) onStop();
    }
  }, []);

  return { createSignal, stopRequest };
};
