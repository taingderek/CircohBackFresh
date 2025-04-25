import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AppProviders from './core/providers/AppProviders';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import { Text, View } from 'react-native';
import { FontsToLoad } from '@/constants/Fonts';

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
  const [fontError, setFontError] = useState<Error | null>(null);
  
  // Load fonts with error handling
  const [loaded, error] = useFonts({
    ...FontsToLoad,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      setFontError(error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  // Show a fallback UI if there's a font loading error
  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          There was an issue loading the app's fonts. The app will continue with system fonts.
        </Text>
        <Text onPress={() => setFontError(null)} style={{ color: '#0066cc', fontSize: 16 }}>
          Tap here to continue
        </Text>
      </View>
    );
  }

  // Show a blank screen while fonts are loading
  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Always use dark mode as specified in the blueprint
  const colorScheme = 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserProvider>
          <AppProviders>
            <ThemeProvider value={DarkTheme}>
              <StatusBar style="light" />
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </ThemeProvider>
          </AppProviders>
        </UserProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
