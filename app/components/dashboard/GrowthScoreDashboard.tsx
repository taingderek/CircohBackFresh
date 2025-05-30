import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { useGrowthScore } from '@/app/features/growth-score';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import Icon from '@/app/components/common/Icon';
import { ScoreService } from '@/app/core/services';

const screenWidth = Dimensions.get('window').width;

// Define types for ScoreData
interface Category {
  category: string;
  score: number;
  percentage: number;
}

interface ScoreData {
  totalScore: number;
  categories: Category[];
  lastUpdated: string;
}

const GrowthScoreDashboard = () => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    totalScore, 
    scoreBreakdown, 
    activities, 
    levelProgress, 
    currentLevel,
    levelTitle
  } = useGrowthScore();

  // Fetch score data on component mount
  useEffect(() => {
    const fetchScoreData = async () => {
      try {
        setLoading(true);
        const data = await ScoreService.getScoreBreakdown();
        setScoreData(data);
      } catch (err) {
        console.error('Error fetching score data:', err);
        setError('Failed to load score data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScoreData();
  }, []);

  // Generate data for line chart - last 6 months of activity
  const generateLineChartData = () => {
    // Get last 6 months of activities
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const scores = [50, 75, 90, 120, 190, 250]; // Mock scores for now

    return {
      labels: months,
      datasets: [
        {
          data: scores,
          color: (opacity = 1) => `rgba(50, 255, 165, ${opacity})`, // COLORS.PRIMARY with opacity
          strokeWidth: 2,
        },
      ],
      legend: ['Growth Points'],
    };
  };

  // Generate data for progress chart
  const generateProgressData = () => {
    // Get category percentages from score data
    const categories = scoreData?.categories || [];
    
    // Find specific categories
    const consistencyCategory = categories.find(cat => cat.category === 'consistency');
    const empathyCategory = categories.find(cat => cat.category === 'empathy');
    const thoughtfulnessCategory = categories.find(cat => cat.category === 'thoughtfulness');
    
    // Values must be between 0 and 1
    const consistency = consistencyCategory ? consistencyCategory.percentage : 0.65;
    const empathy = empathyCategory ? empathyCategory.percentage : 0.60;
    const thoughtfulness = thoughtfulnessCategory ? thoughtfulnessCategory.percentage : 0.70;

    return {
      labels: ['Consistency', 'Empathy', 'Thoughtfulness'],
      data: [consistency, empathy, thoughtfulness],
      colors: [COLORS.SUCCESS, COLORS.PRIMARY, COLORS.SECONDARY],
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading growth data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color={COLORS.ERROR} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Get category percentages from score data
  const categories = scoreData?.categories || [];
  
  // Find specific categories
  const consistencyCategory = categories.find(cat => cat.category === 'consistency');
  const empathyCategory = categories.find(cat => cat.category === 'empathy');
  const thoughtfulnessCategory = categories.find(cat => cat.category === 'thoughtfulness');
  
  // Get percentages (0-100 range)
  const consistencyPercentage = consistencyCategory ? Math.round(consistencyCategory.percentage * 100) : 65;
  const empathyPercentage = empathyCategory ? Math.round(empathyCategory.percentage * 100) : 60;
  const thoughtfulnessPercentage = thoughtfulnessCategory ? Math.round(thoughtfulnessCategory.percentage * 100) : 70;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Icon name="code-working" size={24} color={COLORS.TEXT_SECONDARY} />
        <Text style={styles.comingSoonText}>
          Enhanced analytics coming soon! This dashboard will connect to your real data in a future update.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Growth Score Overview</Text>
        <View style={styles.scoreOverview}>
          <View style={styles.totalScore}>
            <Text style={styles.totalScoreValue}>{totalScore}</Text>
            <Text style={styles.totalScoreLabel}>Total Points</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {currentLevel}</Text>
            <Text style={styles.levelName}>{levelTitle}</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${levelProgress.progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(levelProgress.progressPercentage)}% to Level {currentLevel + 1}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Growth Trend</Text>
        <Text style={styles.sectionSubtitle}>Last 6 months</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={generateLineChartData()}
            width={screenWidth - SPACING.LARGE * 2}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.CARD,
              backgroundGradientFrom: COLORS.CARD,
              backgroundGradientTo: COLORS.CARD,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: COLORS.PRIMARY,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.chartContainer}>
          <ProgressChart
            data={generateProgressData()}
            width={screenWidth - SPACING.LARGE * 2}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: COLORS.CARD,
              backgroundGradientFrom: COLORS.CARD,
              backgroundGradientTo: COLORS.CARD,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 14,
                fontFamily: FONT_FAMILIES.MEDIUM,
              },
            }}
            hideLegend={false}
            style={styles.chart}
          />
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Consistency</Text>
            <Text style={[styles.metricValue, { color: COLORS.SUCCESS }]}>
              {consistencyPercentage}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Empathy</Text>
            <Text style={[styles.metricValue, { color: COLORS.PRIMARY }]}>
              {empathyPercentage}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Thoughtfulness</Text>
            <Text style={[styles.metricValue, { color: COLORS.SECONDARY }]}>
              {thoughtfulnessPercentage}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Improvement Tips</Text>
        <View style={styles.tipContainer}>
          <Icon name="bulb-outline" size={24} color={COLORS.PRIMARY} style={styles.tipIcon} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Consistency is Key</Text>
            <Text style={styles.tipText}>
              Check in with your close contacts at least once weekly to boost your consistency score.
            </Text>
          </View>
        </View>
        
        <View style={styles.tipContainer}>
          <Icon name="heart-outline" size={24} color={COLORS.PRIMARY} style={styles.tipIcon} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Show More Empathy</Text>
            <Text style={styles.tipText}>
              Use the AI message generator with the 'empathetic' tone to craft more meaningful messages.
            </Text>
          </View>
        </View>
        
        <View style={styles.tipContainer}>
          <Icon name="gift-outline" size={24} color={COLORS.PRIMARY} style={styles.tipIcon} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Be Thoughtful</Text>
            <Text style={styles.tipText}>
              Remember important dates and send personalized messages on special occasions.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Data refreshes daily. Last updated: Today
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  comingSoonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.SECONDARY_DARK}80`,
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    marginTop: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  comingSoonText: {
    flex: 1,
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
    marginLeft: SPACING.SMALL,
  },
  section: {
    marginHorizontal: SPACING.LARGE,
    marginTop: SPACING.LARGE,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  scoreOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.SMALL,
  },
  totalScore: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.PRIMARY}20`,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.MEDIUM,
    marginRight: SPACING.MEDIUM,
  },
  totalScoreValue: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  totalScoreLabel: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  levelName: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.SMALL,
  },
  chart: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginVertical: SPACING.SMALL,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.MEDIUM,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.TINY,
  },
  metricValue: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SECONDARY_DARK,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginVertical: SPACING.SMALL,
  },
  tipIcon: {
    marginRight: SPACING.SMALL,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  tipText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  footer: {
    alignItems: 'center',
    marginVertical: SPACING.LARGE,
  },
  footerText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.PRIMARY,
    marginTop: SPACING.SMALL,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.ERROR,
    marginTop: SPACING.SMALL,
  },
});

export default GrowthScoreDashboard; 