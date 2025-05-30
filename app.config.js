// Import process.env from dotenv
const path = require('path');
require('dotenv').config({ 
  path: process.env.APP_ENV === 'production' 
    ? path.resolve(__dirname, '.env.production')
    : process.env.APP_ENV === 'staging'
      ? path.resolve(__dirname, '.env.staging')
      : path.resolve(__dirname, '.env')
});

// Detect environment with fallback to development
const ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
const IS_DEV = ENV === 'development';
const IS_STAGING = ENV === 'staging';
const IS_PROD = ENV === 'production';

// Get the version and build numbers
const VERSION = process.env.VERSION || '1.0.0';
const BUILD_NUMBER = process.env.BUILD_NUMBER || '1';

// Base configuration that's common across all environments
const baseConfig = {
  name: "CircohBack",
  slug: "circohback",
  version: VERSION,
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "circohback",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#121212"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.circohback.app",
    buildNumber: BUILD_NUMBER,
    infoPlist: {
      NSContactsUsageDescription: "CircohBack needs access to your contacts to help you maintain relationships with your connections.",
      NSCalendarsUsageDescription: "CircohBack needs calendar access to add reminders for your connections.",
      NSRemindersUsageDescription: "CircohBack needs access to reminders to help you remember to connect with your contacts.",
      NSCameraUsageDescription: "CircohBack needs camera access to let you add photos to your contact profiles.",
      NSPhotoLibraryUsageDescription: "CircohBack needs access to your photos to let you add images to your contact profiles.",
      NSUserTrackingUsageDescription: "This allows CircohBack to provide a personalized experience based on your usage patterns.",
      UIBackgroundModes: ["remote-notification"],
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["circohback"]
        }
      ]
    },
    associatedDomains: [
      "applinks:circohback.com",
      "applinks:app.circohback.com"
    ]
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#121212"
    },
    package: "com.circohback.app",
    versionCode: parseInt(BUILD_NUMBER, 10),
    permissions: [
      "READ_CONTACTS",
      "WRITE_CONTACTS",
      "READ_CALENDAR",
      "WRITE_CALENDAR",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "VIBRATE",
      "RECEIVE_BOOT_COMPLETED"
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "*.circohback.com",
            pathPrefix: "/"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-notifications",
    [
      "expo-contacts",
      {
        contactsPermission: "Allow CircohBack to access your contacts to help you maintain relationships."
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow CircohBack to access your photos to add images to your contact profiles."
      }
    ]
  ],
  // Explicitly enable React Native's New Architecture
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "your-project-id"
    },
    // Environment variables
    env: ENV,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    // Feature flags
    enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS,
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
    enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING,
    enableRemoteLogging: process.env.EXPO_PUBLIC_ENABLE_REMOTE_LOGGING,
    enableMockApi: process.env.EXPO_PUBLIC_ENABLE_MOCK_API,
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/" + (process.env.EAS_PROJECT_ID || "your-project-id")
  },
  runtimeVersion: {
    policy: "sdkVersion"
  },
  // Add network configuration to improve startup performance
  // This helps handle connectivity issues gracefully
  jsEngine: "hermes",
  experiments: {
    tsconfigPaths: true,
    turboModules: true
  }
};

// Environment specific configuration overrides
const envSpecificConfig = {
  development: {
    // Development specific settings
    name: "CircohBack Dev",
    android: {
      ...baseConfig.android,
      package: "com.circohback.app.dev"
    },
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: "com.circohback.app.dev"
    }
  },
  staging: {
    // Staging specific settings
    name: "CircohBack Stage",
    android: {
      ...baseConfig.android,
      package: "com.circohback.app.staging"
    },
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: "com.circohback.app.staging"
    }
  },
  production: {
    // Production uses the base config as is
  }
};

// Merge the base config with environment specific overrides
module.exports = {
  ...baseConfig,
  ...(envSpecificConfig[ENV] || {})
}; 