import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * StorageService - A robust utility for handling persistent storage
 * with fallbacks and error handling to ensure data operations don't crash the app
 */
class StorageService {
  // Define storage keys used throughout the app here
  private KEYS = {
    USER: 'user',
    USER_DATA_PREFIX: 'userData-',
    SUBSCRIPTION_PREFIX: 'subscription-',
    MESSAGE_QUOTA: 'circohback_message_quota',
  };

  /**
   * Store data in device storage
   * @param key The key to store the data under
   * @param value The data to store (will be JSON stringified)
   * @returns Promise<boolean> indicating success
   */
  async setItem(key: string, value: any): Promise<boolean> {
    try {
      // First try AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (primaryError) {
      console.warn('Primary storage error (AsyncStorage):', primaryError);
      
      // If on native platform, try file system storage as backup
      if (Platform.OS !== 'web') {
        try {
          const directory = `${FileSystem.documentDirectory}circohback/`;
          
          // Ensure directory exists
          const dirInfo = await FileSystem.getInfoAsync(directory);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
          }
          
          // Write to file as backup
          const filePath = `${directory}${key.replace(/[^a-z0-9]/gi, '_')}.json`;
          await FileSystem.writeAsStringAsync(filePath, JSON.stringify(value));
          
          return true;
        } catch (backupError) {
          console.error('Backup storage error (FileSystem):', backupError);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Retrieve data from device storage
   * @param key The key to retrieve
   * @param defaultValue Optional default value if data isn't found
   * @returns The data (already JSON parsed) or defaultValue if not found
   */
  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      // First try AsyncStorage
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
    } catch (primaryError) {
      console.warn('Primary retrieval error (AsyncStorage):', primaryError);
      
      // If on native platform, try file system retrieval as backup
      if (Platform.OS !== 'web') {
        try {
          const directory = `${FileSystem.documentDirectory}circohback/`;
          const filePath = `${directory}${key.replace(/[^a-z0-9]/gi, '_')}.json`;
          
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            const contents = await FileSystem.readAsStringAsync(filePath);
            return JSON.parse(contents) as T;
          }
        } catch (backupError) {
          console.error('Backup retrieval error (FileSystem):', backupError);
        }
      }
    }
    
    // Return default value or null if provided
    return defaultValue !== undefined ? defaultValue : null;
  }

  /**
   * Remove data from device storage
   * @param key The key to remove
   * @returns Promise<boolean> indicating success
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      
      // Also remove from backup if on native
      if (Platform.OS !== 'web') {
        try {
          const directory = `${FileSystem.documentDirectory}circohback/`;
          const filePath = `${directory}${key.replace(/[^a-z0-9]/gi, '_')}.json`;
          
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath);
          }
        } catch (backupError) {
          // Don't throw for backup failure
          console.warn('Failed to remove backup storage:', backupError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error removing item from storage:', error);
      return false;
    }
  }

  /**
   * Check if device storage is available and working
   * @returns Promise<boolean> indicating if storage is working
   */
  async isStorageAvailable(): Promise<boolean> {
    const testKey = '__storage_test__';
    const testValue = { test: true };
    
    try {
      await this.setItem(testKey, testValue);
      const retrieved = await this.getItem<{test: boolean}>(testKey);
      await this.removeItem(testKey);
      
      return retrieved !== null && typeof retrieved === 'object' && retrieved.test === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper methods for common user-related storage operations
   */
  async getUserData<T>(userId: string): Promise<T | null> {
    return this.getItem<T>(`${this.KEYS.USER_DATA_PREFIX}${userId}`);
  }

  async setUserData(userId: string, userData: any): Promise<boolean> {
    return this.setItem(`${this.KEYS.USER_DATA_PREFIX}${userId}`, userData);
  }

  async getSubscription<T>(userId: string): Promise<T | null> {
    return this.getItem<T>(`${this.KEYS.SUBSCRIPTION_PREFIX}${userId}`);
  }

  async setSubscription(userId: string, subscription: any): Promise<boolean> {
    return this.setItem(`${this.KEYS.SUBSCRIPTION_PREFIX}${userId}`, subscription);
  }

  async getMessageQuota<T>(): Promise<T | null> {
    return this.getItem<T>(this.KEYS.MESSAGE_QUOTA);
  }

  async setMessageQuota(quota: any): Promise<boolean> {
    return this.setItem(this.KEYS.MESSAGE_QUOTA, quota);
  }
}

export const storageService = new StorageService();
export default storageService; 