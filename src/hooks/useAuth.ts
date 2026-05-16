import { useEffect, useState } from 'react';
import { supabase } from '../config';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    setUser(null);
    await supabase.auth.signOut();
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

  return { user, loading, signInWithGoogle, signOut };
};
