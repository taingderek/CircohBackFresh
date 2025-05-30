import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from './supabaseClient';

/**
 * Session resetter utility for handling authentication issues
 */
const SessionResetter = {
  /**
   * Function to reset the user's session when authentication fails
   */
  resetSession: async (): Promise<void> => {
    try {
      // Get all storage keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Find session-related keys
      const sessionKeys = keys.filter(key => 
        key.includes('auth-token') || 
        key.includes('supabase') || 
        key.includes('session')
      );
      
      console.log('Found session keys to clear:', sessionKeys);
      
      // Remove session data
      if (sessionKeys.length > 0) {
        await AsyncStorage.multiRemove(sessionKeys);
        console.log('Session data cleared');
      }
      
      // Also sign out from Supabase (will fail silently if there's no connection)
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.log('Error signing out with Supabase:', error);
        // Ignore error, we're clearing locally anyway
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error resetting session:', error);
      return Promise.reject(error);
    }
  },
  
  /**
   * Present reset confirmation to the user
   */
  confirmAndResetSession: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Authentication Error',
        'There seems to be an issue with your login session. Would you like to reset your session and log in again?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Reset Session',
            onPress: async () => {
              try {
                await SessionResetter.resetSession();
                Alert.alert(
                  'Session Reset',
                  'Your session has been reset. Please restart the app and log in again.'
                );
                resolve(true);
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to reset session. Please try again or reinstall the app.'
                );
                resolve(false);
              }
            }
          }
        ]
      );
    });
  }
};

export default SessionResetter; 