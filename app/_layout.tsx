import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';
import AppProviders from './core/providers/AppProviders';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()
  .catch((error) => {
    console.warn('SplashScreen.preventAutoHideAsync: Error', error);
    // It's normal for this to throw if the splash screen has already been hidden
  });

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Artificial delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
        setIsReady(true);
      } catch (e) {
        console.warn('Error preparing app:', e);
        // Even if there's an error hiding the splash screen, we should still render the app
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // Still loading, SplashScreen will remain visible
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/streaks/StreaksScreen" options={{ 
              title: "Streaks",
              headerStyle: {
                backgroundColor: '#121212',
              },
              headerTintColor: '#fff',
            }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
