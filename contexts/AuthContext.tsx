import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check if user is already logged in on app load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would be an API call to your auth server
      // Simulate successful login
      if (email && password) {
        // Simulate validating credentials
        // For demo purposes, we'll accept any non-empty values
        
        // Create a mock user object
        const userData: User = {
          id: '123456',
          email: email,
          name: email.split('@')[0], // Use part of email as name for demo
        };
        
        // Store user in state and AsyncStorage
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return true;
      } else {
        setError('Please provide both email and password');
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call to your auth server
      // Simulate successful registration
      if (email && password && name) {
        // Create a mock user object
        const userData: User = {
          id: '123456',
          email: email,
          name: name,
        };
        
        // Store user in state and AsyncStorage
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return true;
      } else {
        setError('Please provide all required information');
        return false;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Failed to sign up. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      // Clear user from state and storage
      setUser(null);
      await AsyncStorage.removeItem('user');
      
      // In a real app, you would also make an API call to invalidate tokens
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would trigger a password reset email
      if (email) {
        // Simulate sending a password reset email
        console.log(`Password reset requested for: ${email}`);
        return true;
      } else {
        setError('Please provide an email address');
        return false;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to request password reset. Please try again.');
      return false;
    } finally {
      setLoading(false);
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