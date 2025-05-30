/**
 * Environment Configuration
 * 
 * This file centralizes all environment-specific configuration for the app.
 * It uses environment variables from .env files through the Expo config system.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Get current environment from Expo config or fallback to development
export const ENV = (Constants.expoConfig?.extra?.env || 'development') as Environment;
export const IS_DEV = ENV === 'development';
export const IS_STAGING = ENV === 'staging';
export const IS_PROD = ENV === 'production';

// API Configuration
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

const API_CONFIG: Record<Environment, ApiConfig> = {
  development: { 
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api-dev.circohback.com',
    timeout: Number(Constants.expoConfig?.extra?.apiTimeout || 15000),
    maxRetries: 3
  },
  staging: { 
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api-staging.circohback.com',
    timeout: 10000,
    maxRetries: 2
  },
  production: { 
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api.circohback.com',
    timeout: 8000,
    maxRetries: 2
  }
};

// Supabase Configuration
interface SupabaseConfig {
  url: string;
  anonKey: string;
  authRedirectUrl: string;
}

const SUPABASE_CONFIG: Record<Environment, SupabaseConfig> = {
  development: {
    url: Constants.expoConfig?.extra?.supabaseUrl || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
    authRedirectUrl: 'circohback://login/callback'
  },
  staging: {
    url: Constants.expoConfig?.extra?.supabaseUrl || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
    authRedirectUrl: 'circohback://login/callback'
  },
  production: {
    url: Constants.expoConfig?.extra?.supabaseUrl || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
    authRedirectUrl: 'circohback://login/callback'
  }
};

// Feature Flags
interface FeatureFlags {
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableRemoteLogging: boolean;
  enableMockApi: boolean;
  debugMode: boolean;
}

const FEATURE_FLAGS: Record<Environment, FeatureFlags> = {
  development: {
    enablePushNotifications: Constants.expoConfig?.extra?.enablePushNotifications !== 'false',
    enableAnalytics: Constants.expoConfig?.extra?.enableAnalytics === 'true',
    enableCrashReporting: Constants.expoConfig?.extra?.enableCrashReporting === 'true',
    enableRemoteLogging: Constants.expoConfig?.extra?.enableRemoteLogging === 'true',
    enableMockApi: Constants.expoConfig?.extra?.enableMockApi === 'true',
    debugMode: Constants.expoConfig?.extra?.debugMode !== 'false'
  },
  staging: {
    enablePushNotifications: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    enableRemoteLogging: true,
    enableMockApi: false,
    debugMode: false
  },
  production: {
    enablePushNotifications: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    enableRemoteLogging: true,
    enableMockApi: false,
    debugMode: false
  }
};

// App Configuration
export interface AppConfig {
  environment: Environment;
  version: string;
  buildNumber: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  platform: typeof Platform.OS;
  api: ApiConfig;
  supabase: SupabaseConfig;
  features: FeatureFlags;
}

// Build the final configuration
const config: AppConfig = {
  environment: ENV,
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Platform.OS === 'ios' 
    ? Constants.expoConfig?.ios?.buildNumber || '1'
    : Constants.expoConfig?.android?.versionCode?.toString() || '1',
  isProduction: IS_PROD,
  isDevelopment: IS_DEV,
  isStaging: IS_STAGING,
  platform: Platform.OS,
  api: API_CONFIG[ENV],
  supabase: SUPABASE_CONFIG[ENV],
  features: FEATURE_FLAGS[ENV]
};

// Helper functions
export function getApiUrl(endpoint: string = ''): string {
  const baseUrl = config.api.baseUrl.endsWith('/') 
    ? config.api.baseUrl.slice(0, -1) 
    : config.api.baseUrl;
    
  const formattedEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  return `${baseUrl}${formattedEndpoint}`;
}

export function getSupabaseUrl(): string {
  return config.supabase.url;
}

export function getSupabaseAnonKey(): string {
  return config.supabase.anonKey;
}

export function isFeatureEnabled(featureName: keyof FeatureFlags): boolean {
  return config.features[featureName] === true;
}

// Export default config
export default config; 