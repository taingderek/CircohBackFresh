import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Define the structure of our user object
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Define the structure of auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  resetPassword: async () => false,
});

// AuthProvider component that wraps your app and provides the auth context
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Set up cleanup to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check if user is already logged in on app load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser && isMounted.current) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadUserFromStorage();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      // Validate inputs
      if (!email || !password) {
        if (isMounted.current) {
          setError('Please provide both email and password');
        }
        return false;
      }
      
      // Call the API for authentication (mocked for now)
      // In a real app, you would make an API call to your auth service
      if (email === 'user@example.com' && password === 'password123') {
        const userData: User = {
          id: '123',
          email,
          name: 'Demo User',
        };
        
        if (isMounted.current) {
          setUser(userData);
        }
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      if (isMounted.current) {
        setError('Failed to sign in. Please try again.');
      }
      return false;
    } catch (error) {
      console.error('Error during sign in:', error);
      if (isMounted.current) {
        setError('Failed to sign in. Please try again.');
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Sign up function
  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      // Validate inputs
      if (!name || !email || !password) {
        if (isMounted.current) {
          setError('Please provide all required information');
        }
        return false;
      }
      
      // Call the API for user creation (mocked for now)
      // In a real app, you would make an API call to your auth service
      const userData: User = {
        id: '123',
        email,
        name,
      };
      
      if (isMounted.current) {
        setUser(userData);
      }
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error during sign up:', error);
      if (isMounted.current) {
        setError('Failed to sign up. Please try again.');
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      if (isMounted.current) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }
      
      // Validate input
      if (!email) {
        if (isMounted.current) {
          setError('Please provide an email address');
        }
        return false;
      }
      
      // Mock password reset request
      // In a real app, you would make an API call to your auth service
      console.log(`Password reset requested for email: ${email}`);
      return true;
    } catch (error) {
      console.error('Error during password reset:', error);
      if (isMounted.current) {
        setError('Failed to request password reset. Please try again.');
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 