import React, { useEffect, useState, useRef } from 'react';
import { View, LogBox, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NetworkMonitor } from '../common/NetworkMonitor';
import { supabase, checkAndRefreshSession, authEvents, testSupabaseConnection } from '../../core/services/supabaseClient';
import { sessionDebugger } from '../../utils/sessionDebugger';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Suppress known errors that we're handling
LogBox.ignoreLogs([
  'Network request failed',
  'Setting a timer',
  'Animated: `useNativeDriver`',
  'AsyncStorage has been extracted',
  'ViewPropTypes will be removed'
]);

// Authentication state interface
type AuthState = 'initializing' | 'checking' | 'authenticated' | 'unauthenticated' | 'error';

// Main App wrapper component
export function AppWrapper({ children }: { children: React.ReactNode }) {
  // State for authentication and connection status
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [isAuthIssue, setIsAuthIssue] = useState(false);
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  const [tapCount, setTapCount] = useState(0);
  const lastAuthCheckRef = useRef<number>(0);
  const autoCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize app on start
  useEffect(() => {
    // Function to initialize app services
    const initializeApp = async () => {
      try {
        // Set auth state to checking
        setAuthState('checking');
        
        // Check network connectivity first
        const netInfo = await NetInfo.fetch();
        console.log(`Network connectivity: ${netInfo.isConnected ? 'online' : 'offline'}`);

        // Check auth session
        const session = await checkAndRefreshSession();
        console.log(`Auth session: ${session ? 'valid' : 'none'}`);
        
        // Update auth state based on session
        if (session) {
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
        
        if (!session && netInfo.isConnected) {
          // If we have no session but we're online, check if there's a broken session
          const sessionStorage = await sessionDebugger.getSessionStorage();
          if (Object.keys(sessionStorage).length > 0) {
            // We have session data but no valid session, might be an auth issue
            setIsAuthIssue(true);
            
            // Try to auto-fix on startup if we have session data but no valid session
            await attemptAutoFix();
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setAuthState('error');
      }
      
      // Set up auto-check interval
      setupAuthChecks();
    };
    
    // Set up auth event listeners
    const authStateListener = authEvents.on('authStateChange', ({ event, session }) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setAuthState('authenticated');
        setIsAuthIssue(false);
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear any auth issue state when signed out
        setAuthState('unauthenticated');
        setIsAuthIssue(false);
      }
      
      // Update last auth check time
      lastAuthCheckRef.current = Date.now();
    });
    
    // Listen for session fixed events
    const sessionFixedListener = authEvents.on('sessionFixed', () => {
      setIsAuthIssue(false);
      setAuthState('authenticated');
      setFixResult({
        success: true,
        message: 'Authentication fixed automatically!'
      });
      
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setFixResult(null);
      }, 3000);
      
      // Update last auth check time
      lastAuthCheckRef.current = Date.now();
    });
    
    // Listen for session reset events
    const sessionResetListener = authEvents.on('authReset', () => {
      setIsAuthIssue(false);
      setAuthState('unauthenticated');
      
      // Update last auth check time
      lastAuthCheckRef.current = Date.now();
    });
    
    // Initialize app
    initializeApp();
    
    // Clean up listeners
    return () => {
      authStateListener();
      sessionFixedListener();
      sessionResetListener();
      
      // Clear auto-check interval
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current);
      }
    };
  }, []);
  
  // Set up periodic auth checks
  const setupAuthChecks = () => {
    // Clear any existing interval
    if (autoCheckIntervalRef.current) {
      clearInterval(autoCheckIntervalRef.current);
    }
    
    // Check auth every 5 minutes to detect issues proactively
    autoCheckIntervalRef.current = setInterval(async () => {
      // Only check if:
      // 1. We haven't checked in the last minute
      // 2. We're currently in an authenticated state
      // 3. We're not already fixing an issue
      if (
        Date.now() - lastAuthCheckRef.current > 60000 && 
        authState === 'authenticated' && 
        !isFixing
      ) {
        await checkAuthHealth();
      }
    }, 5 * 60 * 1000); // 5 minutes
  };
  
  // Check auth health to detect issues
  const checkAuthHealth = async () => {
    // Update last check time
    lastAuthCheckRef.current = Date.now();
    
    try {
      // Check if we're online
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return; // Can't check auth when offline
      }
      
      // Check if the token is valid
      const tokenCheck = await sessionDebugger.checkTokenValidity();
      
      // If the token is invalid, we have an auth issue
      if (!tokenCheck.valid) {
        setIsAuthIssue(true);
        
        // Try to auto-fix if the issue was detected proactively
        await attemptAutoFix();
      }
    } catch (error) {
      console.error('Error checking auth health:', error);
    }
  };
  
  // Attempt automatic fix of authentication issues
  const attemptAutoFix = async () => {
    if (isFixing) return; // Prevent multiple simultaneous fix attempts
    
    setIsFixing(true);
    try {
      // Check if we're online
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setFixResult({
          success: false, 
          message: 'Cannot fix auth issues while offline'
        });
        return;
      }
      
      // Try to recover session first (gentler approach)
      const recoveryResult = await sessionDebugger.recoverBrokenSession();
      
      if (recoveryResult.success) {
        // Recovery succeeded
        setIsAuthIssue(false);
        setFixResult({
          success: true,
          message: 'Authentication fixed automatically!'
        });
        
        // Hide the success message after 3 seconds
        setTimeout(() => {
          setFixResult(null);
        }, 3000);
        
        return;
      }
      
      // If recovery failed but we can connect to Supabase, try a more aggressive fix
      if (await testSupabaseConnection()) {
        const fixResult = await sessionDebugger.fixSessionIssues();
        
        if (fixResult.success) {
          // Fix succeeded
          setIsAuthIssue(false);
          setFixResult({
            success: true,
            message: 'Authentication fixed automatically!'
          });
          
          // Hide the success message after 3 seconds
          setTimeout(() => {
            setFixResult(null);
          }, 3000);
        } else {
          // Fix failed
          setFixResult({
            success: false,
            message: fixResult.error || 'Auto-fix failed'
          });
        }
      }
    } catch (error) {
      console.error('Error during auto-fix:', error);
      setFixResult({
        success: false,
        message: 'Error during auto-fix'
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // Handle tap counter for secret debug mode
  useEffect(() => {
    if (tapCount > 0) {
      // Reset tap count after 2 seconds of inactivity
      const timer = setTimeout(() => {
        setTapCount(0);
      }, 2000);
      
      // If we reach 7 taps, enable debug mode
      if (tapCount >= 7) {
        setIsDebugVisible(true);
        setTapCount(0);
      }
      
      return () => clearTimeout(timer);
    }
  }, [tapCount]);
  
  // Handle auth session fix
  const handleFixAuthIssue = async () => {
    if (isFixing) return;
    
    setIsFixing(true);
    setFixResult(null);
    
    try {
      const result = await sessionDebugger.fixSessionIssues();
      setFixResult({
        success: result.success,
        message: result.success
          ? 'Authentication fixed successfully!'
          : `Fix failed: ${result.error || 'Unknown error'}`
      });
      
      if (result.success) {
        // If we successfully fixed the issue, clear the auth issue state
        setIsAuthIssue(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setFixResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error fixing auth issues:', error);
      setFixResult({
        success: false,
        message: 'Unexpected error during fix'
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // Handle debug toggle
  const toggleDebug = () => {
    setIsDebugVisible(!isDebugVisible);
  };
  
  // Handle rapid taps for secret debug mode
  const handleDebugTap = () => {
    setTapCount(prev => prev + 1);
  };
  
  return (
    <View style={styles.container}>
      {/* Network Monitor for connectivity issues */}
      <NetworkMonitor 
        onStatusChange={(status) => {
          // If we reconnect to the network, check auth again
          if (status === 'online' && isAuthIssue) {
            checkAuthHealth();
          }
        }}
        showAuthIssues={true}
      />
      
      {/* Auth Issue Banner - only show if NetworkMonitor doesn't catch it */}
      {isAuthIssue && (
        <View style={styles.authIssueBanner}>
          <View style={styles.authIssueContent}>
            <Ionicons name="key-outline" size={18} color="#121212" style={styles.authIssueIcon} />
            <Text style={styles.authIssueText}>
              Authentication issue detected. Your session may need to be reset.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.fixButton}
            onPress={handleFixAuthIssue}
            disabled={isFixing}
          >
            {isFixing ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <Text style={styles.fixButtonText}>Fix Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Fix Result Banner - show briefly after fix attempt */}
      {fixResult && (
        <View style={[
          styles.resultBanner, 
          { backgroundColor: fixResult.success ? '#32FFA5' : '#FF93B9' }
        ]}>
          <Text style={styles.resultText}>
            {fixResult.message}
          </Text>
        </View>
      )}
      
      {/* Debug Mode - only visible when toggled */}
      {isDebugVisible && (
        <SafeAreaView style={styles.debugContainer}>
          <Text style={styles.debugTitle}>CircohBack Debug Mode</Text>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugInfoLabel}>Auth State:</Text>
            <Text style={[
              styles.debugInfoValue,
              authState === 'authenticated' ? styles.debugSuccess : 
              authState === 'unauthenticated' ? styles.debugNeutral : 
              styles.debugError
            ]}>
              {authState}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={checkAuthHealth}
          >
            <Text style={styles.debugButtonText}>Check Auth Health</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={async () => {
              const debugInfo = await sessionDebugger.collectDebugInfo();
              console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
              alert('Debug info logged to console');
            }}
          >
            <Text style={styles.debugButtonText}>Log Debug Info</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={handleFixAuthIssue}
          >
            <Text style={styles.debugButtonText}>Fix Auth Issues</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#FF93B9' }]}
            onPress={async () => {
              await sessionDebugger.resetApplication();
              setIsDebugVisible(false);
            }}
          >
            <Text style={styles.debugButtonText}>Reset App & Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#8E8E93' }]}
            onPress={toggleDebug}
          >
            <Text style={styles.debugButtonText}>Close Debug</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
      
      {/* Main App Content */}
      {children}
      
      {/* Debug Button - Tap 7 times to show debug mode */}
      <TouchableOpacity
        style={styles.debugTrigger}
        onPress={handleDebugTap}
        activeOpacity={1}
      >
        <View style={styles.debugTriggerInner} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  authIssueBanner: {
    backgroundColor: '#BE93FD',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  authIssueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authIssueIcon: {
    marginRight: 8,
  },
  authIssueText: {
    color: '#121212',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  fixButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  fixButtonText: {
    color: '#121212',
    fontWeight: '600',
  },
  resultBanner: {
    padding: 12,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  resultText: {
    color: '#121212',
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  debugInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debugInfoLabel: {
    color: '#BBBBBB',
    fontWeight: '500',
  },
  debugInfoValue: {
    fontWeight: 'bold',
  },
  debugSuccess: {
    color: '#32FFA5',
  },
  debugError: {
    color: '#FF93B9',
  },
  debugNeutral: {
    color: '#BE93FD',
  },
  debugButton: {
    backgroundColor: '#32FFA5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#121212',
    fontWeight: '600',
  },
  debugTrigger: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    zIndex: 100,
  },
  debugTriggerInner: {
    width: '100%',
    height: '100%',
    opacity: 0,
  },
});

export default AppWrapper; 