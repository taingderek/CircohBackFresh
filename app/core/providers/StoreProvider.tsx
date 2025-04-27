import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provides Redux store and persistence to the app
 */
const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 StoreProvider: Initializing Redux store');
    
    // Make sure store is ready
    try {
      const unsubscribe = store.subscribe(() => {
        console.log('🔍 StoreProvider: Store is ready');
        setIsStoreReady(true);
        unsubscribe();
      });

      // Dispatch a simple action to trigger the store
      store.dispatch({ type: 'INITIALIZE_STORE' });
      console.log('🔍 StoreProvider: Dispatched INITIALIZE_STORE action');

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('🔍 StoreProvider: Error initializing store', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error initializing Redux store');
    }
  }, []);

  // Loading indicator while store is initializing
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={styles.loadingText}>Loading app data...</Text>
    </View>
  );

  // Error state if store initialization fails
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{errorMessage || 'Unable to initialize app data'}</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={renderLoading()} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.TEXT,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.ERROR,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
});

export default StoreProvider; 