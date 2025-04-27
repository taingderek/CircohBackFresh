import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/app/core/constants/theme';

export default function TravelLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND,
        },
        headerTintColor: COLORS.TEXT,
        headerTitleStyle: {
          fontFamily: 'MontserratBold',
        },
        contentStyle: {
          backgroundColor: COLORS.BACKGROUND,
        }
      }}
    />
  );
} 