import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import { supabase, authEvents, resetSession, checkAndRefreshSession, testSupabaseConnection } from '@/app/core/services/supabaseClient';
import { NetworkMonitor } from '../common/NetworkMonitor';

// Track last network error timestamp to prevent excessive checks
let lastNetworkErrorTimestamp = 0;
let hasTriedSessionRecovery = false;

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [authError, setAuthError] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to auth events
    const unsubscribe = authEvents.on('authStateChange', (data) => {
      if (data.event === 'SIGNED_OUT') {
        // User signed out, clear any auth errors
        setAuthError(false);
      } else if (data.event === 'SIGNED_IN' || data.event === 'TOKEN_REFRESHED') {
        // User signed in or token refreshed, clear auth errors
        setAuthError(false);
      }
    });

    // Subscribe to network state updates
    const netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      const nowConnected = state.isConnected ?? false;
      
      setIsConnected(nowConnected);
      
      // If we regained connection, retry a supabase request
      if (!wasConnected && nowConnected) {
        setShowReconnectedBanner(true);
        setTimeout(() => setShowReconnectedBanner(false), 3000);
        
        // Try to refresh the session when back online
        refreshSession();
      }
    });

    // Check connection immediately
    checkConnection();
    
    // Try session recovery on initial load
    trySessionRecovery();

    return () => {
      netInfoUnsubscribe();
      unsubscribe();
    };
  }, [isConnected]);
  
  const trySessionRecovery = async () => {
    if (hasTriedSessionRecovery) return;
    
    hasTriedSessionRecovery = true;
    try {
      // Check for auth errors in the last session
      const session = await checkAndRefreshSession();
      
      if (!session) {
        console.log('Session recovery needed - no valid session found');
        setAuthError(true);
      } else {
        console.log('Valid session recovered');
        setAuthError(false);
      }
    } catch (error) {
      console.warn('Error checking session in NetworkErrorHandler:', error);
    }
  };

  const refreshSession = async () => {
    try {
      // Only try to refresh if enough time has passed since last error
      const now = Date.now();
      if (now - lastNetworkErrorTimestamp < 5000) {
        return;
      }
      
      // Use our enhanced session check and refresh
      const session = await checkAndRefreshSession();
      
      if (session) {
        setAuthError(false);
      } else {
        // Only set auth error if we can connect to Supabase but have no session
        const canConnect = await testSupabaseConnection();
        if (canConnect) {
          setAuthError(true);
        }
      }
    } catch (error) {
      console.warn('Unexpected error refreshing session:', error);
      lastNetworkErrorTimestamp = Date.now();
    }
  };

  const checkConnection = async () => {
    try {
      const networkState = await NetInfo.fetch();
      setIsConnected(networkState.isConnected ?? false);
      
      // If connected, test Supabase API connectivity
      if (networkState.isConnected) {
        try {
          const canConnect = await testSupabaseConnection();
          
          if (!canConnect) {
            console.warn('Cannot connect to Supabase API');
            lastNetworkErrorTimestamp = Date.now();
          } else {
            // Check session if we can connect
            const session = await checkAndRefreshSession();
            if (!session) {
              setAuthError(true);
            }
          }
        } catch (error: any) {
          console.warn('API connection test failed:', error?.message);
          lastNetworkErrorTimestamp = Date.now();
        }
      }
    } catch (error) {
      console.warn('Error checking network connection:', error);
      setIsConnected(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(async () => {
      if (authError) {
        // Try to recover the session
        await checkAndRefreshSession();
      }
      
      await checkConnection();
      setIsRetrying(false);
    }, 2000);
  };

  const handleResetSession = async () => {
    setIsRetrying(true);
    try {
      await resetSession();
      setAuthError(false);
      // After resetting, user needs to log in again
    } catch (error) {
      console.error('Error resetting session:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const continueOffline = () => {
    setIsOfflineMode(true);
  };

  if ((!isConnected || authError) && !isOfflineMode) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {authError ? 'Authentication Error' : 'Connection Error'}
          </Text>
          <Text style={styles.errorMessage}>
            {authError 
              ? 'Your session has expired or is missing. Please try to reconnect or reset your session.'
              : 'Unable to connect to CircohBack servers. Please check your internet connection.'}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRetry}
              disabled={isRetrying}
            >
              <Text style={styles.retryText}>
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
              </Text>
            </TouchableOpacity>
            
            {authError ? (
              <TouchableOpacity 
                style={[styles.offlineButton, { backgroundColor: '#FF3B30' }]} 
                onPress={handleResetSession}
                disabled={isRetrying}
              >
                <Text style={styles.offlineText}>Reset Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.offlineButton} 
                onPress={continueOffline}
              >
                <Text style={styles.offlineText}>Continue Offline</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      {children}
      {/* Show the network monitor banner when appropriate */}
      <NetworkMonitor />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  errorContainer: {
    width: '80%',
    padding: SPACING.LARGE,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.ERROR,
    marginBottom: SPACING.MEDIUM,
  },
  errorMessage: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    flex: 1,
    marginRight: SPACING.SMALL,
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  offlineButton: {
    backgroundColor: COLORS.SECONDARY_DARK,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    flex: 1,
    marginLeft: SPACING.SMALL,
    alignItems: 'center',
  },
  offlineText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.BOLD,
  },
});

export default NetworkErrorHandler; 