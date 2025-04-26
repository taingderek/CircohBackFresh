import { supabase } from '../config/supabase';

/**
 * Checks connectivity to Supabase by making a simple request
 * @returns Promise<boolean> - Returns true if connection is successful
 */
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

/**
 * Network utility functions for connectivity and API status checks
 */
const NetworkUtils = {
  checkSupabaseConnectivity,
  // Add more network-related utilities here as needed
};

export default NetworkUtils; 