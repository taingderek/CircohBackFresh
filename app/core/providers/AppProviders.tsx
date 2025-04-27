import React from 'react';
import StoreProvider from './StoreProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../../../contexts/UserContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with all necessary providers
 * Note: We're not using AuthProvider anymore since authentication is handled directly with Redux
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders; 