import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import GrowthScoreDashboard from '@/app/components/dashboard/GrowthScoreDashboard';
import Icon from '@/app/components/common/Icon';

/**
 * Growth Dashboard Screen
 * 
 * Shows a comprehensive dashboard for user's growth score analytics
 * with charts and visualizations.
 */
export default function GrowthDashboardScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Growth Dashboard',
          headerStyle: {
            backgroundColor: COLORS.SECONDARY_DARK,
          },
          headerTintColor: COLORS.TEXT,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.comingSoonBanner}>
        <Icon name="time-outline" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.comingSoonText}>Data connection coming soon</Text>
      </View>
      
      <GrowthScoreDashboard />
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>Back to Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: SPACING.SMALL,
  },
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.PRIMARY}20`,
    paddingVertical: SPACING.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  comingSoonText: {
    marginLeft: SPACING.TINY,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
  },
  closeButton: {
    margin: SPACING.LARGE,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.SECONDARY_DARK,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
  },
}); 