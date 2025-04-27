// Import process.env from dotenv
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  name: "CircohBack",
  slug: "circohback",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "myapp",
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
    bundleIdentifier: "com.circohback.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#121212"
    },
    package: "com.circohback.app"
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png"
  },
  extra: {
    // Add Supabase configuration from env
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-project-id"
    }
  },
  plugins: [
    "expo-router"
  ],
  // Explicitly enable React Native's New Architecture as recommended
  newArchEnabled: true
}; 