import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import AppProviders from './core/providers/AppProviders';
import { NetworkErrorHandler } from './components/network/NetworkErrorHandler';
import ImprovedLoadingScreen from './components/common/ImprovedLoadingScreen';
import { checkConnectionQuality, initNetworkMonitoring } from './utils/networkUtils';
import { checkAndRefreshSession, testSupabaseConnection, authEvents } from './core/services/supabaseClient';
import SessionDebugButton from './components/network/SessionDebugButton';
import AppWrapper from './components/auth/AppWrapper';

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Ignore specific warnings related to network issues that we'll handle properly
LogBox.ignoreLogs([
  'Network request failed',
  'Setting a timer for a long period',
  'Streaming failed',
  'WebSocket connection',
  // Add any other noisy warnings here
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Initialize network monitoring on app startup
  useEffect(() => {
    // Initialize enhanced network monitoring
    initNetworkMonitoring();
    
    console.log('🌐 Network monitoring initialized');
  }, []);
  
  // Check for and recover from session issues
  useEffect(() => {
    async function checkSession() {
      try {
        // Log current session state
        console.log("🔍 Checking Supabase session on startup");
        
        // Try to connect to Supabase
        const canConnect = await testSupabaseConnection();
        if (!canConnect) {
          console.warn('Cannot connect to Supabase API during startup check');
          setSessionChecked(true);
          return;
        }
        
        // Use enhanced session check
        const session = await checkAndRefreshSession();
        console.log('Session check completed:', session ? 'Active session' : 'No session');
      } catch (err) {
        console.error('Error during session check:', err);
      } finally {
        setSessionChecked(true);
      }
    }
    
    // Listen for auth reset events
    const unsubscribe = authEvents.on('authReset', () => {
      // Force app to reinitialize after auth reset
      setInitializing(true);
      setTimeout(() => {
        setInitializing(false);
      }, 500);
    });
    
    checkSession();
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Check connection quality
  useEffect(() => {
    async function checkConnection() {
      try {
        const info = await checkConnectionQuality();
        setConnectionInfo(info);
        console.log(`Connection quality: ${info.quality}, response time: ${info.responseTimeMs}ms`);
      } catch (error) {
        console.warn('Error checking connection quality:', error);
      }
    }
    
    checkConnection();
  }, []);
  
  useEffect(() => {
    if (loaded && sessionChecked) {
      // Wait a bit to let any error handlers initialize
      setTimeout(() => {
        setInitializing(false);
      }, 500);
    }
  }, [loaded, sessionChecked]);

  // Expo font loading logic
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        
        // Load fonts, make API calls, etc.
        // Add your resource loading here
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (initializing) {
    return <ImprovedLoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <ThemeProvider value={DarkTheme}>
          <AppWrapper>
            <NetworkErrorHandler>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#121212',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                <Stack.Screen name="admin/test-data" options={{ 
                  title: "Test Data Generator",
                  headerStyle: {
                    backgroundColor: '#121212',
                  },
                  headerTintColor: '#fff',
                }} />
                <Stack.Screen name="screens/streaks/StreaksScreen" options={{ 
                  title: "Streaks",
                  headerStyle: {
                    backgroundColor: '#121212',
                  },
                  headerTintColor: '#fff',
                }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              {/* Show debug button only in development */}
              {isDev && <SessionDebugButton />}
            </NetworkErrorHandler>
          </AppWrapper>
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
