import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  signInWithGoogle,
  signInWithApple,
  selectUser,
  selectSession, 
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from '../store/slices/authSlice';

/**
 * Hook for centralized authentication using Redux and Supabase
 */
export const useSupabaseAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const session = useAppSelector(selectSession);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Sign in with email and password
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    const resultAction = await dispatch(signIn({ email, password }));
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  // Sign up with email and password
  const handleSignUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<boolean> => {
    const resultAction = await dispatch(signUp({ email, password }));
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  // Sign out the current user
  const handleSignOut = async (): Promise<boolean> => {
    const resultAction = await dispatch(signOut());
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  // Request password reset
  const handleResetPassword = async (email: string): Promise<boolean> => {
    const resultAction = await dispatch(resetPassword(email));
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  // Sign in with Google
  const handleGoogleSignIn = async (): Promise<boolean> => {
    const resultAction = await dispatch(signInWithGoogle());
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  // Sign in with Apple
  const handleAppleSignIn = async (): Promise<boolean> => {
    const resultAction = await dispatch(signInWithApple());
    return !resultAction.meta.requestStatus.endsWith('rejected');
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    signInWithGoogle: handleGoogleSignIn, 
    signInWithApple: handleAppleSignIn,
  };
}; 