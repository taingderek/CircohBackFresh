/**
 * Supabase Client Configuration
 * 
 * This file defines types for Supabase configuration and provides
 * helper functions to access Supabase configuration values.
 */

import Constants from 'expo-constants';

// Supabase configuration type
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  authRedirectUrl: string;
}

// Get Supabase configuration from Expo Constants
export const getSupabaseConfig = (): SupabaseConfig => {
  return {
    url: Constants.expoConfig?.extra?.supabaseUrl || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
    authRedirectUrl: 'circohback://login/callback'
  };
};

export default getSupabaseConfig; 