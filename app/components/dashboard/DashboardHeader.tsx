import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardHeaderProps {
  streakDays: number;
  longestStreak: number;
  multiplier: number;
  level: number;
  points: number;
  pointsToNextLevel: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  streakDays,
  longestStreak,
  multiplier,
  level,
  points,
  pointsToNextLevel,
}) => {
  // Calculate progress percentage
  const totalPointsForLevel = points + pointsToNextLevel;
  const progressPercentage = totalPointsForLevel > 0 
    ? (points / totalPointsForLevel) * 100 
    : 0;
  
  return (
    <LinearGradient
      colors={[COLORS.PRIMARY_DARK, COLORS.PRIMARY]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Streak Info */}
      <View style={styles.streakRow}>
        <View style={styles.badgeContainer}>
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Feather name="zap" size={26} color={COLORS.PRIMARY} />
            </View>
          </View>
        </View>
        
        <View style={styles.streakInfo}>
          <Text style={styles.currentStreak}>{streakDays}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.multiplierContainer}>
          <Text style={styles.multiplierValue}>{multiplier}x</Text>
          <Text style={styles.multiplierLabel}>Multiplier</Text>
        </View>
      </View>
      
      {/* Level Progress */}
      <View style={styles.levelContainer}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.pointsText}>{points} points</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{pointsToNextLevel} to next level</Text>
        </View>
      </View>
      
      {/* Longest streak display */}
      <View style={styles.recordContainer}>
        <Feather name="award" size={14} color="#FFC107" style={styles.recordIcon} />
        <Text style={styles.recordText}>Longest streak: {longestStreak} days</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginVertical: SPACING.MEDIUM,
    ...EFFECTS.SHADOW_MEDIUM,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  badgeContainer: {
    marginRight: SPACING.MEDIUM,
  },
  badgeOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  currentStreak: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.WHITE,
  },
  streakLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: SPACING.MEDIUM,
  },
  multiplierContainer: {
    alignItems: 'center',
  },
  multiplierValue: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.WHITE,
  },
  multiplierLabel: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelContainer: {
    marginBottom: SPACING.SMALL,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  levelLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.WHITE,
  },
  pointsText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    marginTop: SPACING.SMALL,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.SMALL,
  },
  recordIcon: {
    marginRight: SPACING.SMALL,
  },
  recordText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default DashboardHeader; 