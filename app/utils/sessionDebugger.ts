import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, authEvents } from '../core/services/supabaseClient';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Type for detailed network information with potentially custom iOS properties
interface ExtendedNetworkDetails {
  isVpn?: boolean;
  ipAddress?: string;
  [key: string]: any;
}

/**
 * Enhanced utility to debug Supabase session and auth issues
 */
export const sessionDebugger = {
  /**
   * Gets all session-related storage keys and their values
   */
  async getSessionStorage(): Promise<Record<string, any>> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(key => 
        key.includes('supabase.auth') || 
        key.includes('-auth-token')
      );
      
      const result: Record<string, any> = {};
      
      for (const key of authKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            // Try to parse as JSON if possible
            result[key] = JSON.parse(value);
          } catch {
            // Otherwise store as string
            result[key] = value;
          }
        } else {
          result[key] = null;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting session storage:', error);
      return {};
    }
  },
  
  /**
   * Gets the current network state with detailed diagnostics
   */
  async getNetworkState(): Promise<{
    isConnected: boolean | null;
    type: string | null;
    isInternetReachable: boolean | null;
    details: any;
    isVpn: boolean | null;
    ipAddress: string | null;
    latency: number | null;
  }> {
    try {
      const state = await NetInfo.fetch();
      let latency = null;
      
      // If connected, try to measure latency to supabase
      if (state.isConnected) {
        try {
          const startTime = Date.now();
          await fetch('https://www.google.com/generate_204', { method: 'HEAD' });
          latency = Date.now() - startTime;
        } catch (e) {
          // Ignore fetch errors
        }
      }
      
      // Cast details to access potentially custom iOS properties
      const details = state.details as ExtendedNetworkDetails;
      
      return {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
        isVpn: Platform.OS === 'ios' ? details?.isVpn || null : null,
        ipAddress: Platform.OS === 'ios' ? details?.ipAddress || null : null,
        latency,
      };
    } catch (error) {
      console.error('Error getting network state:', error);
      return {
        isConnected: null,
        type: null,
        isInternetReachable: null,
        details: null,
        isVpn: null,
        ipAddress: null,
        latency: null,
      };
    }
  },
  
  /**
   * Gets the current session state with detailed diagnostics
   */
  async getSessionState(): Promise<{
    hasSession: boolean;
    isExpired: boolean | null;
    expiresAt: number | null;
    expiresIn: number | null;
    user: any;
    refreshToken: string | null;
    accessToken: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        return {
          hasSession: false,
          isExpired: null,
          expiresAt: null,
          expiresIn: null,
          user: null,
          refreshToken: null,
          accessToken: null,
        };
      }
      
      const session = data.session;
      const now = Math.floor(Date.now() / 1000);
      
      // Check for session storage even if no active session
      let refreshToken = null;
      let accessToken = null;
      
      if (!session) {
        const storage = await this.getSessionStorage();
        const sessionKey = Object.keys(storage).find(k => k.includes('-auth-token'));
        if (sessionKey && storage[sessionKey]) {
          refreshToken = storage[sessionKey].refresh_token || null;
          accessToken = storage[sessionKey].access_token || null;
        }
      }
      
      return {
        hasSession: !!session,
        isExpired: session ? (session.expires_at || 0) < now : null,
        expiresAt: session?.expires_at || null,
        expiresIn: session?.expires_at ? session.expires_at - now : null,
        user: session?.user || null,
        refreshToken: session?.refresh_token || refreshToken,
        accessToken: session?.access_token || accessToken,
      };
    } catch (error) {
      console.error('Error checking session state:', error);
      return {
        hasSession: false,
        isExpired: null,
        expiresAt: null,
        expiresIn: null,
        user: null,
        refreshToken: null,
        accessToken: null,
      };
    }
  },
  
  /**
   * Test the Supabase connection with detailed diagnostics
   */
  async testConnection(): Promise<{
    canConnect: boolean;
    responseTime: number;
    error: string | null;
    statusCode: number | null;
    errorCode: string | null;
  }> {
    try {
      const startTime = Date.now();
      
      // Simple query to verify connection
      const response = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      const endTime = Date.now();
      const error = response.error;
      const status = response.status;
      
      // Get error code if available
      const errorCode = error && (error as any).code ? (error as any).code : null;
      
      return {
        canConnect: !error,
        responseTime: endTime - startTime,
        error: error ? error.message : null,
        statusCode: status || null,
        errorCode: errorCode,
      };
    } catch (error: any) {
      return {
        canConnect: false,
        responseTime: 0,
        error: error?.message || 'Unknown error',
        statusCode: null,
        errorCode: error?.code || null,
      };
    }
  },
  
  /**
   * Check specifically for JWT token issues
   */
  async checkTokenValidity(): Promise<{
    valid: boolean;
    error: string | null;
    tokenType: string | null;
  }> {
    try {
      // Try to make an authenticated request that requires a valid JWT
      const { error } = await supabase.auth.getUser();
      
      if (error) {
        // Look for specific JWT-related errors
        const isJwtError = error.message.includes('JWT') || 
                          error.message.includes('token') ||
                          error.message.includes('authenticate');
                          
        return {
          valid: false,
          error: error.message,
          tokenType: isJwtError ? 'invalid-jwt' : 'other',
        };
      }
      
      return {
        valid: true,
        error: null,
        tokenType: 'valid',
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error?.message || 'Unknown error',
        tokenType: 'exception',
      };
    }
  },
  
  /**
   * Collect comprehensive debug info about auth state
   */
  async collectDebugInfo(): Promise<{
    sessionStorage: Record<string, any>;
    networkState: any;
    sessionState: any;
    connectionTest: any;
    tokenValidity: any;
    deviceInfo: any;
    timestamp: number;
  }> {
    const [sessionStorage, networkState, sessionState, connectionTest, tokenValidity] = await Promise.all([
      this.getSessionStorage(),
      this.getNetworkState(),
      this.getSessionState(),
      this.testConnection(),
      this.checkTokenValidity(),
    ]);
    
    // Collect basic device info
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      isOnline: networkState.isConnected,
    };
    
    return {
      sessionStorage,
      networkState,
      sessionState,
      connectionTest,
      tokenValidity,
      deviceInfo,
      timestamp: Date.now(),
    };
  },
  
  /**
   * Try to recover a broken session by manually refreshing 
   */
  async recoverBrokenSession(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Get current session state
      const sessionState = await this.getSessionState();
      
      // If we have a refresh token but no valid session, try to recover
      if (!sessionState.hasSession && sessionState.refreshToken) {
        console.log('Found refresh token, attempting recovery...');
        
        try {
          // Try to manually refresh the session
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: sessionState.refreshToken
          });
          
          if (error) {
            return {
              success: false,
              message: `Refresh failed: ${error.message}`
            };
          }
          
          if (data?.session) {
            // Notify that session was fixed
            authEvents.emit('sessionFixed', { session: data.session });
            
            return {
              success: true,
              message: 'Session successfully recovered with refresh token'
            };
          }
        } catch (refreshError: any) {
          return {
            success: false,
            message: `Error during refresh: ${refreshError.message}`
          };
        }
      }
      
      // If session exists but is expired, try standard refresh
      if (sessionState.hasSession && sessionState.isExpired) {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            return {
              success: false,
              message: `Refresh failed: ${error.message}`
            };
          }
          
          if (data?.session) {
            return {
              success: true,
              message: 'Expired session successfully refreshed'
            };
          }
        } catch (refreshError: any) {
          return {
            success: false,
            message: `Error during refresh: ${refreshError.message}`
          };
        }
      }
      
      // No recovery needed or possible
      return {
        success: false,
        message: sessionState.hasSession 
          ? 'Session already valid, no recovery needed' 
          : 'No refresh token available for recovery'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Recovery attempt failed: ${error.message}`
      };
    }
  },
  
  /**
   * Attempt to fix common session issues with automatic diagnosis
   */
  async fixSessionIssues(): Promise<{
    success: boolean;
    actions: string[];
    error: string | null;
  }> {
    const actions: string[] = [];
    try {
      // Get current state
      const { sessionState, networkState, connectionTest, tokenValidity } = await this.collectDebugInfo();
      
      // Check if we're online
      if (!networkState.isConnected) {
        return {
          success: false,
          actions: ['No network connection detected'],
          error: 'Device is offline',
        };
      }
      
      // Check if we can reach Supabase
      if (!connectionTest.canConnect) {
        actions.push(`Cannot connect to Supabase API: ${connectionTest.error}`);
        return {
          success: false,
          actions,
          error: 'Cannot reach CircohBack servers',
        };
      }
      
      // Try session recovery if we have JWT issues
      if (!tokenValidity.valid) {
        actions.push(`Invalid token detected: ${tokenValidity.error}`);
        
        // Try to recover the session
        const recoveryResult = await this.recoverBrokenSession();
        if (recoveryResult.success) {
          actions.push('Successfully recovered broken session');
          return {
            success: true,
            actions,
            error: null,
          };
        } else {
          actions.push(`Recovery failed: ${recoveryResult.message}`);
        }
      }
      
      // Check if we have a session
      if (!sessionState.hasSession) {
        actions.push('No active session found');
        
        // Clear any stale tokens
        const sessionStorage = await this.getSessionStorage();
        if (Object.keys(sessionStorage).length > 0) {
          await this.clearSessionStorage();
          actions.push('Cleared stale session data');
        }
        
        return {
          success: true,
          actions,
          error: null,
        };
      }
      
      // Handle expired session
      if (sessionState.isExpired) {
        actions.push('Expired session detected');
        
        // Try to refresh the token
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          actions.push('Token refresh failed');
          
          // Clear session data if refresh fails
          await this.clearSessionStorage();
          actions.push('Cleared expired session data');
          
          return {
            success: true,
            actions,
            error: error.message,
          };
        }
        
        if (data.session) {
          actions.push('Session refreshed successfully');
          
          // Notify auth listeners about the refreshed session
          authEvents.emit('sessionFixed', { session: data.session });
          
          return {
            success: true,
            actions,
            error: null,
          };
        }
      }
      
      // Default case - no issues found or fixed
      actions.push('No issues detected with session');
      return {
        success: true,
        actions,
        error: null,
      };
    } catch (error: any) {
      actions.push(`Unexpected error: ${error?.message}`);
      return {
        success: false,
        actions,
        error: error?.message || 'Unknown error during fix attempt',
      };
    }
  },
  
  /**
   * Clear all session storage
   */
  async clearSessionStorage(): Promise<void> {
    try {
      // First sign out to ensure auth state is cleared
      await supabase.auth.signOut({ scope: 'local' });
      
      // Then remove any stored tokens
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(key => 
        key.includes('supabase.auth') || 
        key.includes('-auth-token')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
      }
      
      // Emit auth reset event
      authEvents.emit('authReset', null);
      
      console.log('✅ Session storage cleared');
    } catch (error) {
      console.error('Failed to clear session storage:', error);
      throw error;
    }
  },
  
  /**
   * Reset the application's auth state completely
   */
  async resetApplication(): Promise<void> {
    try {
      // Clear session storage
      await this.clearSessionStorage();
      
      // Clear other app storage if needed
      // For example, clear cached user data
      const allKeys = await AsyncStorage.getAllKeys();
      const appDataKeys = allKeys.filter(key => 
        key.includes('circohback-app-') || 
        key.includes('user-data-')
      );
      
      if (appDataKeys.length > 0) {
        await AsyncStorage.multiRemove(appDataKeys);
      }
      
      // Emit application reset event
      authEvents.emit('appReset', null);
      
      console.log('✅ Application reset complete');
    } catch (error) {
      console.error('Failed to reset application:', error);
      throw error;
    }
  },
};

// Create a React component to be used in settings/debug screens
export const createSessionDebugButton = (
  action: 'fix' | 'reset' | 'debug' | 'recover', 
  label: string
) => {
  return {
    onPress: async () => {
      try {
        switch (action) {
          case 'fix':
            return await sessionDebugger.fixSessionIssues();
          case 'reset':
            await sessionDebugger.resetApplication();
            return { success: true, actions: ['Application reset complete'], error: null };
          case 'debug':
            return await sessionDebugger.collectDebugInfo();
          case 'recover':
            const result = await sessionDebugger.recoverBrokenSession();
            return { 
              success: result.success, 
              actions: [result.message], 
              error: result.success ? null : result.message 
            };
        }
      } catch (error: any) {
        return { success: false, actions: [], error: error?.message || 'Unknown error' };
      }
    }
  };
};

// Export default for Expo Router compatibility
export default sessionDebugger; 