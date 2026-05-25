import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleAuth = (session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuth(session);
    };

    initAuth();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuth(session);
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
