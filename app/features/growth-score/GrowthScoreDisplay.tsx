import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGrowthScore } from './useGrowthScore';
import { COLORS, FONT_FAMILIES, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../core/constants/theme';

type GrowthScoreDisplayProps = {
  size?: 'small' | 'medium' | 'large';
  showBreakdown?: boolean;
  onPress?: () => void;
};

export default function GrowthScoreDisplay({ 
  size = 'medium', 
  showBreakdown = false,
  onPress 
}: GrowthScoreDisplayProps) {
  const { 
    totalScore, 
    levelProgress, 
    scoreBreakdown, 
    isInitialized,
    levelTitle,
    currentLevel
  } = useGrowthScore();
  
  // Determine size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 80, height: 80 },
          score: { fontSize: FONT_SIZES.XL },
          label: { fontSize: FONT_SIZES.XS }
        };
      case 'large':
        return {
          container: { width: 180, height: 180 },
          score: { fontSize: FONT_SIZES.XXXL },
          label: { fontSize: FONT_SIZES.MEDIUM }
        };
      default: // medium
        return {
          container: { width: 120, height: 120 },
          score: { fontSize: FONT_SIZES.XXL },
          label: { fontSize: FONT_SIZES.SMALL }
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  if (!isInitialized) {
    return (
      <View style={[styles.container, sizeStyles.container]}>
        <ActivityIndicator color={COLORS.PRIMARY} size="large" />
      </View>
    );
  }
  
  const ScoreCircle = () => (
    <TouchableOpacity 
      style={[
        styles.container, 
        sizeStyles.container, 
        { borderColor: levelProgress.color }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.level, { fontSize: sizeStyles.label.fontSize }]}>
        Level {currentLevel}
      </Text>
      <Text style={[styles.score, sizeStyles.score, { color: levelProgress.color }]}>
        {totalScore}
      </Text>
      <Text style={[styles.label, { fontSize: sizeStyles.label.fontSize }]}>
        {levelTitle}
      </Text>
    </TouchableOpacity>
  );
  
  if (!showBreakdown) {
    return <ScoreCircle />;
  }
  
  return (
    <View style={styles.wrapper}>
      <ScoreCircle />
      
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Growth Score Breakdown</Text>
        
        {scoreBreakdown.categories.map((category) => (
          <View key={category.category} style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>
              {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${category.percentage}%`, 
                    backgroundColor: getCategoryColor(category.category) 
                  }
                ]} 
              />
            </View>
            <Text style={styles.breakdownValue}>{category.score}</Text>
          </View>
        ))}
        
        <View style={styles.levelProgressContainer}>
          <Text style={styles.levelProgressLabel}>Progress to Level {currentLevel + 1}</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${levelProgress.progressPercentage}%`, backgroundColor: levelProgress.color }
              ]} 
            />
          </View>
          <Text style={styles.levelProgressText}>
            {Math.round(levelProgress.progressPercentage)}% - {levelProgress.remainingPoints} points needed
          </Text>
        </View>
      </View>
    </View>
  );
}

// Helper function to get color for a category
function getCategoryColor(category: string): string {
  switch (category) {
    case 'engagement':
      return COLORS.PRIMARY;  // Mint green
    case 'organization':
      return COLORS.SECONDARY;  // Lavender
    case 'consistency':
      return COLORS.ACCENT;  // Pink
    case 'proactivity':
      return COLORS.SECONDARY_DARK;
    default:
      return COLORS.PRIMARY_DARK;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY_DARK,
    padding: SPACING.MEDIUM,
  },
  score: {
    fontWeight: 'bold',
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.PRIMARY,
  },
  level: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
    marginBottom: SPACING.TINY,
  },
  label: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginTop: SPACING.TINY,
  },
  breakdownContainer: {
    marginTop: SPACING.LARGE,
    width: '100%',
    backgroundColor: COLORS.SECONDARY_DARK,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
  },
  breakdownTitle: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    marginBottom: SPACING.MEDIUM,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  breakdownLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    width: 120,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    width: 40,
    textAlign: 'right',
    marginLeft: SPACING.SMALL,
  },
  levelProgressContainer: {
    marginTop: SPACING.LARGE,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.PRIMARY_DARK,
  },
  levelProgressLabel: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  levelProgressText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginTop: SPACING.TINY,
    textAlign: 'center',
  }
}); 