import React, { useEffect, lazy, Suspense } from 'react';
import StoreProvider from './StoreProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../../../contexts/UserContext';
import '../../../app/i18n'; // Import i18n configuration
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/common/Toast';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '@/app/core/constants/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with all necessary providers
 * Note: We're not using AuthProvider anymore since authentication is handled directly with Redux
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StoreProvider>
          <UserProvider>
            {children}
            <Toast config={toastConfig} />
          </UserProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppProviders; 