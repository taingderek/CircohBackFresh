import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from './core/store/hooks';
import { getSession, selectIsAuthenticated, selectIsLoading } from './core/store/slices/authSlice';
import { COLORS } from './core/constants/theme';

export default function Index() {
  console.log('🔍 Index component initializing');
  
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);

  console.log('🔍 Auth state:', { isAuthenticated, isLoading });

  useEffect(() => {
    // Check for existing session on app load
    console.log('🔍 Dispatching getSession action');
    
    try {
      dispatch(getSession());
      console.log('🔍 getSession action dispatched successfully');
    } catch (error) {
      console.error('🔍 Error dispatching getSession:', error);
    }
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log('🔍 Rendering loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading CircohBack...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    console.log('🔍 User is authenticated, redirecting to (tabs)');
    return <Redirect href="/(tabs)" />;
  }

  // Not authenticated, redirect to auth
  console.log('🔍 User is not authenticated, redirecting to (auth)');
  return <Redirect href="/(auth)" />;
}

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
}); 