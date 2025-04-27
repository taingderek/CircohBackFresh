import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

// Debug logs for environment variables
console.log('🔍 Supabase initialization:');
console.log('🔍 SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('🔍 SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Enhanced AsyncStorage adapter with error handling
const EnhancedAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  }
};

// SecureStore adapter implementation for Supabase storage
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem error:', error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        return await AsyncStorage.getItem(key);
      } catch (fallbackError) {
        console.warn('AsyncStorage fallback getItem error:', fallbackError);
        return null;
      }
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        console.warn('AsyncStorage fallback setItem error:', fallbackError);
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.removeItem(key);
      } catch (fallbackError) {
        console.warn('AsyncStorage fallback removeItem error:', fallbackError);
      }
    }
  },
};

// Choose the appropriate storage mechanism based on platform
const storageAdapter = Platform.OS === 'web' 
  ? EnhancedAsyncStorage 
  : ExpoSecureStoreAdapter;

console.log('🔍 Using storage adapter for platform:', Platform.OS);

// Initialize Supabase client with enhanced iOS configuration
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'implicit', // Better for mobile apps
      debug: __DEV__, // Only enable debug in development
    },
  }
);

console.log('🔍 Supabase client created successfully');

// Add a test user function for demo purposes
export const createTestUserIfNeeded = async () => {
  if (__DEV__) {
    try {
      console.log('🔍 Checking for test user...');
      // Check if the test user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: 'demo@circohback.com',
        password: 'Password123!'
      });
      
      // If user doesn't exist, create them
      if (checkError && checkError.message.includes('Invalid login credentials')) {
        console.log('🔍 Test user not found, creating...');
        const { data, error } = await supabase.auth.signUp({
          email: 'demo@circohback.com',
          password: 'Password123!',
          options: {
            data: {
              name: 'Demo User',
              avatar_url: null,
              subscription: { isPremium: true }
            }
          }
        });
        
        if (error) {
          console.warn('Failed to create test user:', error.message);
        } else {
          console.log('🔍 Test user created successfully');
        }
      } else {
        console.log('🔍 Test user already exists');
      }
      
      // Sign out if we're just checking
      if (existingUser?.session) {
        await supabase.auth.signOut();
        console.log('🔍 Signed out test user');
      }
    } catch (error) {
      console.warn('Error in test user setup:', error);
    }
  }
};

// Initialize the test user on app load
if (__DEV__) {
  createTestUserIfNeeded();
}
