import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// SecureStore adapter implementation for Supabase storage
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Choose the appropriate storage mechanism based on platform
const storageAdapter = Platform.OS === 'web' 
  ? AsyncStorage 
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