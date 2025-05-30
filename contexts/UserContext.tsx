import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, useAuth } from './AuthContext';

// Define the structure of user data
interface UserData {
  name: string;
  bio?: string;
  profileImage?: string;
  joinDate: string;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
  };
}

// Define the structure of user context
interface UserContextType {
  userData: UserData | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  updateUserData: (data: Partial<UserData>) => Promise<boolean>;
  subscribeToPremium: () => Promise<boolean>;
  cancelPremium: () => Promise<boolean>;
}

// Create the user context with default values
const UserContext = createContext<UserContextType>({
  userData: null,
  isPremium: false,
  loading: true,
  error: null,
  updateUserData: async () => false,
  subscribeToPremium: async () => false,
  cancelPremium: async () => false,
});

// UserProvider component that wraps your app and provides the user context
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data when auth user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setUserData(null);
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, you would fetch this from an API
        // For now, we'll try to get it from AsyncStorage or create default data
        
        const storedUserData = await AsyncStorage.getItem(`userData-${user.id}`);
        const storedSubscription = await AsyncStorage.getItem(`subscription-${user.id}`);
        
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        } else {
          // Create default user data
          const defaultUserData: UserData = {
            name: user.name || user.email.split('@')[0],
            joinDate: new Date().toISOString(),
            preferences: {
              notifications: true,
              darkMode: false,
            }
          };
          
          setUserData(defaultUserData);
          await AsyncStorage.setItem(`userData-${user.id}`, JSON.stringify(defaultUserData));
        }
        
        // Set subscription status
        if (storedSubscription) {
          setIsPremium(JSON.parse(storedSubscription).active);
        } else {
          setIsPremium(false);
          await AsyncStorage.setItem(`subscription-${user.id}`, JSON.stringify({ active: false }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Update user data
  const updateUserData = async (data: Partial<UserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update in state and storage
      const updatedData = { ...userData, ...data } as UserData;
      setUserData(updatedData);
      
      // In a real app, you would also send this to your backend
      await AsyncStorage.setItem(`userData-${user.id}`, JSON.stringify(updatedData));
      
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Failed to update user data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to premium
  const subscribeToPremium = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would involve payment processing
      // Simulate a successful subscription
      setIsPremium(true);
      
      // Store subscription status
      await AsyncStorage.setItem(
        `subscription-${user.id}`, 
        JSON.stringify({ 
          active: true, 
          startDate: new Date().toISOString()
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error subscribing to premium:', error);
      setError('Failed to process subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel premium subscription
  const cancelPremium = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would involve cancelling subscription in payment processor
      // Simulate a successful cancellation
      setIsPremium(false);
      
      // Update subscription status
      await AsyncStorage.setItem(
        `subscription-${user.id}`, 
        JSON.stringify({ 
          active: false, 
          cancelDate: new Date().toISOString()
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error cancelling premium:', error);
      setError('Failed to cancel subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Provide context value
  const value = {
    userData,
    isPremium,
    loading,
    error,
    updateUserData,
    subscribeToPremium,
    cancelPremium,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext); 