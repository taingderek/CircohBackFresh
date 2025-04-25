import React from 'react';
import StoreProvider from './StoreProvider';
import AuthProvider from './AuthProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with all necessary providers
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <AuthProvider>{children}</AuthProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders; 