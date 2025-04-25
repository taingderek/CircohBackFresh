import React, { useEffect, createContext, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSession, selectAuth, selectIsAuthenticated, selectUser, selectSession } from '../store/slices/authSlice';
import { supabase } from '../config/supabase';

// Create context with default values
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any; // Using any here because we'll use the user from supabase directly
  session: any; // Using any here because we'll use the session from supabase directly
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
});

/**
 * AuthProvider component that provides authentication state to the app
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, session } = useAppSelector(selectAuth);

  // Check for existing session on mount
  useEffect(() => {
    dispatch(getSession());

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, _session) => {
        console.log('Auth state changed:', event);
        // Refresh session in Redux store
        dispatch(getSession());
      }
    );

    // Clean up subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [dispatch]);

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 