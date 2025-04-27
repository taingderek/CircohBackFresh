import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { View, ActivityIndicator } from 'react-native';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provides Redux store and persistence to the app
 */
const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [isStoreReady, setIsStoreReady] = useState(false);

  useEffect(() => {
    // Make sure store is ready
    const unsubscribe = store.subscribe(() => {
      setIsStoreReady(true);
      unsubscribe();
    });

    // Dispatch a simple action to trigger the store
    store.dispatch({ type: 'INITIALIZE_STORE' });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Loading indicator while store is initializing
  const renderLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="#32FFA5" />
    </View>
  );

  return (
    <Provider store={store}>
      <PersistGate loading={renderLoading()} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider; 