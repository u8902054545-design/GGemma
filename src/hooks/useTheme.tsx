import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase, SUPABASE_ENDPOINT } from '../config';

export type Theme = 'system' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      const newResolved = theme === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme as 'dark' | 'light';
      
      if (newResolved !== resolvedTheme) {
        setIsTransitioning(true);
        setTimeout(() => {
          setResolvedTheme(newResolved);
          setTimeout(() => setIsTransitioning(false), 500);
        }, 50);
      }
    };

    updateResolvedTheme();

    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        if (newResolved !== resolvedTheme) {
          setIsTransitioning(true);
          setTimeout(() => {
            setResolvedTheme(newResolved);
            setTimeout(() => setIsTransitioning(false), 500);
          }, 50);
        }
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const { user } = useAuth();

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);

    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(SUPABASE_ENDPOINT, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            settings: { selected_theme: newTheme }
          }),
        });
      } catch (err) {
        console.error('Failed to sync theme:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
