import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Evening, User</Text>
          <Text style={styles.subtitle}>Your connections dashboard</Text>
        </View>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>CircohBack Score</Text>
          <Text style={styles.score}>750</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.scoreSubtitle}>Great consistency! Keep it up.</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Today</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>You'll see your due connections here</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Your recent activity will appear here</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  header: {
    marginBottom: SPACING.LARGE,
  },
  greeting: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: 'MontserratBold',
  },
  subtitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
    fontFamily: 'MontserratRegular',
  },
  scoreCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    fontFamily: 'MontserratMedium',
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginVertical: SPACING.SMALL,
    fontFamily: 'MontserratBold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 4,
    marginVertical: SPACING.MEDIUM,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  scoreSubtitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: 'MontserratRegular',
  },
  section: {
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    fontFamily: 'MontserratSemiBold',
  },
  placeholderCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 8,
    padding: SPACING.LARGE,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  placeholderText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: 'MontserratRegular',
  },
}); 