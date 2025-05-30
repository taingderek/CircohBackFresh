import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, EFFECTS, BORDER_RADIUS } from '@/app/core/constants/theme';
import RatingStars from './RatingStars';
import { AggregatedRating } from '@/app/features/quality-rating/types';

interface RatingSummaryProps {
  ratings: AggregatedRating;
  showDetailedBreakdown?: boolean;
  isExpandable?: boolean;
  onPress?: () => void;
  isPremium?: boolean;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
  ratings,
  showDetailedBreakdown = true,
  isExpandable = false,
  onPress,
  isPremium = false,
}) => {
  const { 
    overallRating, 
    categoryRatings, 
    totalRatings, 
    trend 
  } = ratings;
  
  // Format overall rating to one decimal place
  const formattedRating = overallRating.toFixed(1);
  
  // Generate trend badge color and icon
  const getTrendInfo = () => {
    switch (trend) {
      case 'improving':
        return { icon: 'trending-up', color: COLORS.SUCCESS, label: 'Improving' };
      case 'declining':
        return { icon: 'trending-down', color: COLORS.ERROR, label: 'Declining' };
      case 'stable':
        return { icon: 'remove', color: COLORS.INFO, label: 'Stable' };
      case 'new':
      default:
        return { icon: 'star', color: COLORS.WARNING, label: 'New' };
    }
  };
  
  const trendInfo = getTrendInfo();
  const Container = isExpandable ? TouchableOpacity : View;
  
  return (
    <Container 
      style={styles.container}
      onPress={isExpandable ? onPress : undefined}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Connection Quality</Text>
        {trend !== 'new' && (
          <View style={[styles.trendBadge, { backgroundColor: trendInfo.color + '30' }]}>
            <Ionicons name={trendInfo.icon as any} size={14} color={trendInfo.color} />
            <Text style={[styles.trendText, { color: trendInfo.color }]}>
              {trendInfo.label}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.overallRating}>
        <Text style={styles.ratingValue}>{formattedRating}</Text>
        <RatingStars
          rating={overallRating}
          size={24}
          showHalfStars={true}
          color={COLORS.SECONDARY}
        />
        <Text style={styles.totalRatings}>
          {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
        </Text>
      </View>
      
      {showDetailedBreakdown && totalRatings >= 3 && (
        <View style={styles.categoryBreakdown}>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Thoughtfulness</Text>
            <View style={styles.categoryRating}>
              <RatingStars
                rating={categoryRatings.thoughtfulness}
                size={16}
                showHalfStars={true}
                color={COLORS.SECONDARY}
              />
              <Text style={styles.categoryValue}>
                {categoryRatings.thoughtfulness.toFixed(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Responsiveness</Text>
            <View style={styles.categoryRating}>
              <RatingStars
                rating={categoryRatings.responsiveness}
                size={16}
                showHalfStars={true}
                color={COLORS.SECONDARY}
              />
              <Text style={styles.categoryValue}>
                {categoryRatings.responsiveness.toFixed(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text style={styles.categoryLabel}>Empathy</Text>
            <View style={styles.categoryRating}>
              <RatingStars
                rating={categoryRatings.empathy}
                size={16}
                showHalfStars={true}
                color={COLORS.SECONDARY}
              />
              <Text style={styles.categoryValue}>
                {categoryRatings.empathy.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {totalRatings < 3 && (
        <View style={styles.notEnoughRatings}>
          <Text style={styles.notEnoughText}>
            Not enough ratings to show detailed breakdown
          </Text>
          <Text style={styles.minRatingsText}>
            (Minimum 3 ratings required)
          </Text>
        </View>
      )}
      
      {isPremium && (
        <View style={styles.networkCompare}>
          <Text style={styles.networkLabel}>
            <Ionicons name="globe-outline" size={14} color={COLORS.PRIMARY} /> 
            Network Comparison:
          </Text>
          <Text style={styles.networkValue}>Above average</Text>
        </View>
      )}
      
      {isExpandable && (
        <View style={styles.footer}>
          <Text style={styles.viewDetailsText}>View details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_SECONDARY} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginVertical: SPACING.SMALL,
    ...EFFECTS.SHADOW_SMALL,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  title: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  trendText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    marginLeft: 4,
  },
  overallRating: {
    alignItems: 'center',
    marginVertical: SPACING.MEDIUM,
  },
  ratingValue: {
    fontSize: FONT_SIZES.XXXL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  totalRatings: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
  },
  categoryBreakdown: {
    marginTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.MEDIUM,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryValue: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.SECONDARY,
    marginLeft: SPACING.SMALL,
  },
  notEnoughRatings: {
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  notEnoughText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  minRatingsText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
  },
  networkCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.MEDIUM,
    padding: SPACING.SMALL,
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: BORDER_RADIUS.SMALL,
  },
  networkLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  networkValue: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.PRIMARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.SMALL,
  },
  viewDetailsText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginRight: SPACING.TINY,
  },
});

export default RatingSummary; 