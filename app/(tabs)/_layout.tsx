import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme } from '@react-navigation/native';
import MainNavigator from '@/app/navigation/MainNavigator';
import { COLORS } from '@/app/core/constants/theme';

// Create custom navigation theme consistent with CircohBack styling
const CircohBackTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.PRIMARY,
    background: COLORS.BACKGROUND,
    card: COLORS.CARD,
    text: COLORS.TEXT,
    border: COLORS.BORDER,
  },
};

/**
 * Layout for the main tab navigation screens
 * Implements the tab navigator using MainNavigator
 */
export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <MainNavigator />
    </View>
  );
}
