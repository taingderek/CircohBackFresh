#!/bin/bash

# This script installs additional dependencies for CircohBack that complement
# the existing codebase without creating conflicts

# Set up error handling
set -e
echo "Installing additional dependencies for CircohBack..."

# Navigation enhancements
echo "Installing navigation enhancements..."
npm install @react-navigation/stack

# Additional UI components and animation
echo "Installing UI and animation libraries..."
npm install moti nativewind react-native-skia
npm install react-native-fast-image react-native-shimmer-placeholder
npm install lottie-react-native react-native-animatable

# State management enhancements
echo "Installing additional state management..."
npm install zustand immer

# Device features
echo "Installing device feature libraries..."
npm install react-native-device-info 
npm install react-native-mmkv
npm install react-native-share

# Calendar integration
echo "Installing calendar integration..."
npm install react-native-calendars

# Enhanced permissions management
echo "Installing permissions and security libraries..."
npm install react-native-permissions react-native-keychain

# Deep linking
echo "Installing deep linking support..."
npm install react-native-app-link

# Improved image handling
echo "Installing enhanced image handling..."
npm install react-native-image-crop-picker

# Charting libraries (for analytics)
echo "Installing chart libraries for analytics..."
npm install react-native-chart-kit

# Additional development tools
echo "Installing development tools..."
npm install --save-dev plop

echo "Installation complete! Additional libraries have been added to enhance CircohBack."
echo "Please run 'cd ios && pod install && cd ..' if you're developing for iOS." 