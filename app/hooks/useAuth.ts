import { useState, useEffect } from 'react';
import { supabase } from '@/app/core/services/supabaseClient';
import { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session data
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          setState({
            user: data.session.user,
            loading: false,
            error: null
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null
          });
        }
      })
      .catch(error => {
        setState({
          user: null,
          loading: false,
          error: error.message
        });
      });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user || null,
        loading: false,
        error: null
      });
    });

    // Clean up subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return {
    user: state.user,
    isAuthenticated: !!state.user,
    loading: state.loading,
    error: state.error
  };
}; 