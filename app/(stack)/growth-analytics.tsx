import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import GrowthScoreDashboard from '@/app/components/score/GrowthScoreDashboard';
import Icon from '@/app/components/common/Icon';

/**
 * Growth Analytics Screen
 * 
 * A detailed analytics screen for the user's growth score
 * and relationship metrics.
 */
export default function GrowthAnalyticsScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Growth Analytics',
          headerStyle: {
            backgroundColor: COLORS.CARD,
          },
          headerTintColor: COLORS.TEXT,
          headerShadowVisible: false,
        }}
      />
      <GrowthScoreDashboard />
      <TouchableOpacity 
        style={styles.dashboardButton}
        onPress={() => router.push('/growth-dashboard')}
      >
        <Text style={styles.dashboardButtonText}>View Detailed Dashboard</Text>
        <Icon name="analytics" size={18} color={COLORS.TEXT} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginVertical: SPACING.MEDIUM,
    alignSelf: 'center',
  },
  dashboardButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
    marginRight: SPACING.SMALL,
  },
}); 