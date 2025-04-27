import React from 'react';
import { Platform, KeyboardAvoidingView, ViewStyle, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsKeyboardShown } from '@/app/hooks/useIsKeyboardShown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';
import { ErrorBoundary } from 'react-error-boundary';

// Import screens
import HomeScreen from '@/app/(tabs)/home';
import ContactsScreen from '@/app/(tabs)/contacts';
import DailySwipeScreen from '@/app/(tabs)/daily-swipe';
import MessagesScreen from '@/app/(tabs)/messages';
import ProfileScreen from '@/app/(tabs)/profile';

// Import custom tab bar
import CustomTabBar from '@/app/components/navigation/CustomTabBar';

// Import theme
import { COLORS, SPACING } from '@/app/core/constants/theme';

/**
 * Define tab param list type
 * This type is exported and can be referenced in the app's navigation types
 */
export type TabParamList = {
  home: undefined;
  contacts: undefined;
  'daily-swipe': undefined;
  messages: undefined;
  profile: undefined;
};

/**
 * Root navigation param list that can include the tab navigator
 * This follows React Navigation's recommended type patterns
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  // Add other root-level screens here as needed
  Modal: undefined;
};

// Create tab navigator
const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Error fallback component for navigation
 */
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, padding: SPACING.LARGE, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
      <Text style={{ color: COLORS.ERROR, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Navigation Error
      </Text>
      <Text style={{ color: COLORS.TEXT, textAlign: 'center', marginBottom: 20 }}>
        There was a problem loading this screen. Please restart the app.
      </Text>
      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12 }}>
        {error.message}
      </Text>
    </View>
  );
}

/**
 * MainNavigator Component
 * 
 * Configures the bottom tab navigation for CircohBack
 * Uses a custom tab bar with a special center tab for Daily Swipe
 */
export default function MainNavigator() {
  const insets = useSafeAreaInsets();
  const isKeyboardShown = useIsKeyboardShown();
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: COLORS.PRIMARY, // COLORS.accent
            tabBarInactiveTintColor: COLORS.TEXT_SECONDARY, // COLORS.textSecondary
            tabBarStyle: {
              display: isKeyboardShown ? 'none' : 'flex',
              backgroundColor: COLORS.CARD, // COLORS.secondary
              borderTopColor: COLORS.BORDER, // COLORS.border
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
            } as ViewStyle,
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
        >
          <Tab.Screen
            name="home"
            component={HomeScreen}
            options={{
              title: 'Home',
            }}
          />
          <Tab.Screen
            name="contacts"
            component={ContactsScreen}
            options={{
              title: 'Contacts',
            }}
          />
          <Tab.Screen
            name="daily-swipe"
            component={DailySwipeScreen}
            options={{
              title: 'Daily Swipe',
            }}
          />
          <Tab.Screen
            name="messages"
            component={MessagesScreen}
            options={{
              title: 'Messages',
            }}
          />
          <Tab.Screen
            name="profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
            }}
          />
        </Tab.Navigator>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
} 