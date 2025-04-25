import type { Router } from 'expo-router';

/**
 * Navigation utilities for consistent routing throughout the app
 */

export const AUTH_ROUTES = {
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
};

export const APP_ROUTES = {
  HOME: '/(tabs)/home',
  DAILY: '/(tabs)/daily',
  CONTACTS: '/(tabs)/contacts',
  PROFILE: '/(tabs)/profile',
};

/**
 * Navigate to authentication routes
 */
export const navigateToAuth = {
  login: (router: Router) => router.push(AUTH_ROUTES.LOGIN as any),
  register: (router: Router) => router.push(AUTH_ROUTES.REGISTER as any),
  forgotPassword: (router: Router) => router.push(AUTH_ROUTES.FORGOT_PASSWORD as any),
};

/**
 * Navigate to main app routes
 */
export const navigateToApp = {
  home: (router: Router) => router.push(APP_ROUTES.HOME as any),
  daily: (router: Router) => router.push(APP_ROUTES.DAILY as any),
  contacts: (router: Router) => router.push(APP_ROUTES.CONTACTS as any),
  profile: (router: Router) => router.push(APP_ROUTES.PROFILE as any),
}; 