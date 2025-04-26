import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

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
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
    }
  },
};

// Choose the appropriate storage mechanism based on platform
const storageAdapter = Platform.OS === 'web' 
  ? EnhancedAsyncStorage 
  : ExpoSecureStoreAdapter;

// Initialize Supabase client
export const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper function to check Supabase connectivity
export const checkSupabaseConnectivity = async (): Promise<boolean> => {
  try {
    // Try to make a simple API call to Supabase
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connectivity error:', error);
    return false;
  }
};

// Export supabase as default for easier imports
export default supabase; 