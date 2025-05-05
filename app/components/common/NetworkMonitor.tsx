import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { testSupabaseConnection } from '../../core/services/supabaseClient';
import { sessionDebugger } from '../../utils/sessionDebugger';
import { Ionicons } from '@expo/vector-icons';

// NetworkStatus enum to track different connection states
enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  POOR_CONNECTION = 'poor_connection',
  SUPABASE_UNREACHABLE = 'supabase_unreachable',
  RECONNECTING = 'reconnecting',
  AUTH_ISSUE = 'auth_issue'
}

export interface NetworkMonitorProps {
  onStatusChange?: (status: NetworkStatus) => void;
  showAuthIssues?: boolean;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ 
  onStatusChange,
  showAuthIssues = true
}) => {
  // State for network status and UI visibility
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkStatus.ONLINE);
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [actionText, setActionText] = useState<string | null>(null);
  const [supabaseReachable, setSupabaseReachable] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasAuthIssue, setHasAuthIssue] = useState<boolean>(false);
  
  // Animation values
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Hide banner timer
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to handle network status changes
  useEffect(() => {
    // Set up network state listener
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    
    // Initial check
    checkNetworkAndSupabase();
    
    // Set up periodic auth checks if showing auth issues
    let authCheckInterval: NodeJS.Timeout | null = null;
    if (showAuthIssues) {
      checkAuthStatus();
      authCheckInterval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
    }
    
    // Clean up listeners on unmount
    return () => {
      unsubscribe();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [showAuthIssues]);
  
  // Effect to update UI based on network status
  useEffect(() => {
    // Set appropriate message and action
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
        setMessage('No internet connection. Some features may be unavailable.');
        setActionText('Retry');
        showBanner(0);
        break;
        
      case NetworkStatus.POOR_CONNECTION:
        setMessage('Poor connection detected. Some features may be slower.');
        setActionText('Dismiss');
        showBanner(10000);
        break;
        
      case NetworkStatus.SUPABASE_UNREACHABLE:
        setMessage('Unable to connect to CircohBack servers. Please try again later.');
        setActionText('Retry');
        showBanner(0);
        break;
        
      case NetworkStatus.RECONNECTING:
        setMessage('Reconnecting to CircohBack...');
        setActionText(null);
        showBanner(0);
        break;
        
      case NetworkStatus.AUTH_ISSUE:
        setMessage('Authentication issue detected. Your session may need to be reset.');
        setActionText('Fix Now');
        setHasAuthIssue(true);
        showBanner(0);
        break;
        
      case NetworkStatus.ONLINE:
        // Clear auth issue flag when we're online
        setHasAuthIssue(false);
        
        if (visible) {
          setMessage('Connection restored');
          setActionText('Dismiss');
          showBanner(3000);
        }
        break;
    }
    
    // Notify parent components about status change
    if (onStatusChange) {
      onStatusChange(networkStatus);
    }
  }, [networkStatus]);
  
  // Check auth status to detect issues
  const checkAuthStatus = async () => {
    if (!showAuthIssues) return;
    
    // Don't check auth when offline
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;
    
    setIsCheckingAuth(true);
    try {
      // Check if user has session issues
      const tokenValidityCheck = await sessionDebugger.checkTokenValidity();
      const sessionState = await sessionDebugger.getSessionState();
      
      // Detect specific auth issues
      const hasIssue = !tokenValidityCheck.valid || 
                      (sessionState.hasSession && sessionState.isExpired) ||
                      (sessionState.refreshToken && !sessionState.hasSession);
      
      if (hasIssue) {
        setNetworkStatus(NetworkStatus.AUTH_ISSUE);
      } else if (hasAuthIssue) {
        // Auth issue was fixed, switch to online status
        setNetworkStatus(NetworkStatus.ONLINE);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };
  
  // Handle network state changes
  const handleNetworkChange = async (state: NetInfoState) => {
    const isConnected = state.isConnected || false;
    
    if (!isConnected) {
      setNetworkStatus(NetworkStatus.OFFLINE);
      setSupabaseReachable(false);
      return;
    }
    
    // Check connection quality
    if (state.isInternetReachable === false) {
      setNetworkStatus(NetworkStatus.POOR_CONNECTION);
      return;
    }
    
    // If we were previously offline or have connection issue, try reconnecting
    if (networkStatus === NetworkStatus.OFFLINE || 
        networkStatus === NetworkStatus.SUPABASE_UNREACHABLE || 
        networkStatus === NetworkStatus.POOR_CONNECTION) {
      
      setNetworkStatus(NetworkStatus.RECONNECTING);
      
      // Check if we can reach Supabase
      const canReachSupabase = await testSupabaseConnection();
      setSupabaseReachable(canReachSupabase);
      
      if (canReachSupabase) {
        // Check for auth issues when we're back online
        if (showAuthIssues) {
          const tokenValidityCheck = await sessionDebugger.checkTokenValidity();
          const sessionState = await sessionDebugger.getSessionState();
          
          // Detect specific auth issues
          const hasIssue = !tokenValidityCheck.valid || 
                          (sessionState.hasSession && sessionState.isExpired) ||
                          (sessionState.refreshToken && !sessionState.hasSession);
          
          if (hasIssue) {
            setNetworkStatus(NetworkStatus.AUTH_ISSUE);
          } else {
            setNetworkStatus(NetworkStatus.ONLINE);
          }
        } else {
          setNetworkStatus(NetworkStatus.ONLINE);
        }
      } else {
        setNetworkStatus(NetworkStatus.SUPABASE_UNREACHABLE);
      }
    }
  };
  
  // Check both network status and Supabase connectivity
  const checkNetworkAndSupabase = async () => {
    // Get current network state
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected || false;
    
    if (!isConnected) {
      setNetworkStatus(NetworkStatus.OFFLINE);
      setSupabaseReachable(false);
      return;
    }
    
    // Test Supabase connection if network is available
    if (isConnected) {
      const canReachSupabase = await testSupabaseConnection();
      setSupabaseReachable(canReachSupabase);
      
      if (!canReachSupabase) {
        setNetworkStatus(NetworkStatus.SUPABASE_UNREACHABLE);
      } else if (showAuthIssues) {
        // Check for auth issues and update status directly
        const tokenValidityCheck = await sessionDebugger.checkTokenValidity();
        const sessionState = await sessionDebugger.getSessionState();
        
        // Detect specific auth issues
        const hasIssue = !tokenValidityCheck.valid || 
                        (sessionState.hasSession && sessionState.isExpired) ||
                        (sessionState.refreshToken && !sessionState.hasSession);
        
        if (hasIssue) {
          setNetworkStatus(NetworkStatus.AUTH_ISSUE);
        } else {
          setNetworkStatus(NetworkStatus.ONLINE);
        }
      } else {
        setNetworkStatus(NetworkStatus.ONLINE);
      }
    }
  };
  
  // Show the banner with animation
  const showBanner = (hideAfterMs: number) => {
    // Cancel any pending hide timers
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    
    setVisible(true);
    
    // Animate slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Set timer to hide banner if needed
    if (hideAfterMs > 0) {
      hideTimerRef.current = setTimeout(() => {
        hideBanner();
      }, hideAfterMs);
    }
  };
  
  // Hide the banner with animation
  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };
  
  // Handle action button press based on current status
  const handleAction = async () => {
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
      case NetworkStatus.SUPABASE_UNREACHABLE:
        setRetryCount(prev => prev + 1);
        setNetworkStatus(NetworkStatus.RECONNECTING);
        await checkNetworkAndSupabase();
        break;
        
      case NetworkStatus.AUTH_ISSUE:
        setIsCheckingAuth(true);
        try {
          await sessionDebugger.fixSessionIssues();
          // Re-check auth status after fix attempt
          await checkAuthStatus();
        } catch (error) {
          console.error('Error fixing auth issues:', error);
        } finally {
          setIsCheckingAuth(false);
        }
        break;
        
      case NetworkStatus.ONLINE:
      case NetworkStatus.POOR_CONNECTION:
        hideBanner();
        break;
    }
  };
  
  // Don't render anything if not visible
  if (!visible) return null;
  
  // Set banner color based on status
  const getBannerColor = () => {
    switch (networkStatus) {
      case NetworkStatus.ONLINE:
        return '#32FFA5';
      case NetworkStatus.OFFLINE:
      case NetworkStatus.SUPABASE_UNREACHABLE:
        return '#FF93B9';
      case NetworkStatus.POOR_CONNECTION:
        return '#BE93FD';
      case NetworkStatus.RECONNECTING:
        return '#93FDFD';
      case NetworkStatus.AUTH_ISSUE:
        return '#BE93FD';
      default:
        return '#32FFA5';
    }
  };
  
  // Get appropriate icon based on status
  const getStatusIcon = () => {
    switch (networkStatus) {
      case NetworkStatus.ONLINE:
        return <Ionicons name="checkmark-circle" size={20} color="#121212" />;
      case NetworkStatus.OFFLINE:
        return <Ionicons name="wifi-outline" size={20} color="#121212" />;
      case NetworkStatus.SUPABASE_UNREACHABLE:
        return <Ionicons name="server-outline" size={20} color="#121212" />;
      case NetworkStatus.POOR_CONNECTION:
        return <Ionicons name="warning-outline" size={20} color="#121212" />;
      case NetworkStatus.RECONNECTING:
        return <ActivityIndicator size="small" color="#121212" />;
      case NetworkStatus.AUTH_ISSUE:
        return <Ionicons name="key-outline" size={20} color="#121212" />;
      default:
        return null;
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: getBannerColor(),
          paddingTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 40 : 10,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          {getStatusIcon()}
          <Text style={styles.message}>{message}</Text>
        </View>
        
        {/* Show action button if we have one */}
        {actionText && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAction}
            disabled={isCheckingAuth || networkStatus === NetworkStatus.RECONNECTING}
          >
            {isCheckingAuth ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <Text style={styles.actionText}>{actionText}</Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Show loading indicator while reconnecting */}
        {networkStatus === NetworkStatus.RECONNECTING && !actionText && (
          <ActivityIndicator size="small" color="#121212" />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: '#121212',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#121212',
    fontWeight: '600',
    fontSize: 12,
  }
});

// Default export for compatibility with Expo Router
export default NetworkMonitor; 