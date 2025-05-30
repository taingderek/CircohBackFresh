/**
 * Centralized Supabase Client Configuration
 * 
 * This file contains the single source of truth for Supabase client
 * configuration and connection handling across the application.
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { EventEmitter } from '../utils/EventEmitter';

// Environment variables from .env through Expo's constants
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';
const ENV = Constants.expoConfig?.extra?.env || 'development';
const IS_DEV = ENV === 'development';

// Debug logs for initialization (only in development)
if (IS_DEV) {
  console.log('🔍 Supabase initialization:');
  console.log(`  - URL: ${SUPABASE_URL.substring(0, 20)}...`);
  console.log(`  - Environment: ${ENV}`);
  console.log(`  - Platform: ${Platform.OS}`);
}

// Create auth event emitter for app-wide auth state management
export const authEvents = new EventEmitter();

/**
 * Secure storage adapter with fallback
 * Uses SecureStore on iOS for enhanced security and AsyncStorage on other platforms
 */
const createStorageAdapter = () => {
  // iOS-specific secure storage implementation
  if (Platform.OS === 'ios') {
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return await SecureStore.getItemAsync(key);
        } catch (error) {
          console.warn('SecureStore getItem error:', error);
          
          // Fallback to AsyncStorage if SecureStore fails
          try {
            return await AsyncStorage.getItem(key);
          } catch (fallbackError) {
            console.error('AsyncStorage fallback getItem error:', fallbackError);
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
            console.error('AsyncStorage fallback setItem error:', fallbackError);
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
            console.error('AsyncStorage fallback removeItem error:', fallbackError);
          }
        }
      },
    };
  }
  
  // Android and other platforms use AsyncStorage with error handling
  return {
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
};

// Network state management
let isConnected = true;
let pendingRequests: Array<() => Promise<any>> = [];
let networkMonitorInitialized = false;

/**
 * Initialize network monitoring to handle offline/online transitions
 */
export const initNetworkMonitoring = () => {
  if (networkMonitorInitialized) return;
  
  console.log('🌐 Network monitor initialized');
  
  // Set up network state listener
  NetInfo.addEventListener(state => {
    const previousConnectionState = isConnected;
    isConnected = state.isConnected || false;
    
    // Connection state changed from offline to online
    if (!previousConnectionState && isConnected) {
      console.log('🌐 Device back online - processing offline queue');
      processPendingRequests();
    }
  });
  
  networkMonitorInitialized = true;
};

/**
 * Process queued requests when network comes back online
 */
const processPendingRequests = () => {
  const requests = [...pendingRequests];
  pendingRequests = [];
  
  requests.forEach(async (request) => {
    try {
      await request();
    } catch (error) {
      console.error('Failed to process pending request:', error);
    }
  });
};

/**
 * Enhanced fetch implementation with timeout, retry logic, and offline queueing
 */
const enhancedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  // Set appropriate timeout based on platform
  const timeout = Platform.OS === 'ios' ? 15000 : 30000;
  
  const executeRequest = async (): Promise<Response> => {
    // Check for network connectivity
    const networkState = await NetInfo.fetch();
    
    // If offline, queue the request for later
    if (!networkState.isConnected) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(async () => {
          try {
            const response = await executeRequest();
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    try {
      // Set up request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      // Handle network errors with retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        const delay = 1000 * Math.pow(2, retryCount - 1); // Exponential backoff
        
        console.log(`Request failed (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
        console.log(`Retrying in ${delay}ms...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeRequest();
      }
      
      throw error;
    }
  };
  
  return executeRequest();
};

/**
 * Create and initialize Supabase client with proper configuration
 */
const createSupabaseClient = (): SupabaseClient => {
  // Initialize network monitoring
  initNetworkMonitoring();
  
  // Create the Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: createStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: enhancedFetch as any,
      headers: {
        'X-Client-Platform': Platform.OS,
      },
    },
  });
  
  // Add auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth state changed: ${event}`);
    
    // Emit auth event for app-wide handling
    authEvents.emit('authStateChange', { event, session });
  });
  
  return supabase;
};

/**
 * Reset user session (used for handling auth issues)
 */
export const resetSession = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear any auth-related storage
    const storageAdapter = createStorageAdapter();
    
    // Clear specific auth keys
    await storageAdapter.removeItem('supabase.auth.token');
    await storageAdapter.removeItem('supabase.auth.expires_at');
    await storageAdapter.removeItem('supabase.auth.refresh_token');
    
    console.log('User session reset successfully');
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
};

/**
 * Test Supabase connection by making a lightweight query to the health_check table
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch from health_check table which is designed for connection testing
    const { data, error } = await supabase
      .from('health_check')
      .select('status')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    // Check if we got a valid response
    return data?.status === 'ok';
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

/**
 * Check the current session and try to refresh if needed
 * Returns the current session object or null if no session exists
 */
export const checkAndRefreshSession = async (): Promise<Session | null> => {
  try {
    // First check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error.message);
      return null;
    }
    
    // If no session, nothing to refresh
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    // Check if session needs refresh (within 5 minutes of expiry)
    const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt && (expiresAt.getTime() - now.getTime() < fiveMinutes)) {
      console.log('Session is about to expire, refreshing...');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError.message);
        return session; // Return original session
      }
      
      console.log('Session refreshed successfully');
      return refreshData.session;
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected error in checkAndRefreshSession:', error);
    return null;
  }
};

// Create and export the singleton Supabase client instance
export const supabase = createSupabaseClient();

// Default export for compatibility
export default supabase;
