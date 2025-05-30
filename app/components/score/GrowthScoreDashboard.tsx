import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, FONT_FAMILIES } from '@/app/core/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ScoreService, HistoricalScoreData, ScoreBreakdown as ServiceScoreBreakdown } from '@/app/core/services/ScoreService';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Growth Score Dashboard Component
 * 
 * A comprehensive dashboard for visualizing the user's growth score metrics
 * using chart visualizations.
 */
export default function GrowthScoreDashboard() {
  // State for score data
  const [scoreBreakdown, setScoreBreakdown] = useState<ServiceScoreBreakdown | null>(null);
  const [historicalData, setHistoricalData] = useState<{
    week: any;
    month: any;
    year: any;
  } | null>(null);
  const [activePeriod, setActivePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch score data
  useEffect(() => {
    fetchScoreData();
  }, []);

  // Load score data from ScoreService
  const fetchScoreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get score breakdown
      const breakdown = await ScoreService.getScoreBreakdown();
      setScoreBreakdown(breakdown);
      
      // Get historical data for each period
      const weekData = await ScoreService.getHistoricalScores('week');
      const monthData = await ScoreService.getHistoricalScores('month');
      const yearData = await ScoreService.getHistoricalScores('year');
      
      // Format data for charts
      setHistoricalData({
        week: formatHistoricalDataForChart(weekData, 'week'),
        month: formatHistoricalDataForChart(monthData, 'month'),
        year: formatHistoricalDataForChart(yearData, 'year')
      });
    } catch (err) {
      console.error('Failed to fetch score data:', err);
      setError('Unable to load score data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format historical data for chart
  const formatHistoricalDataForChart = (data: HistoricalScoreData[], period: 'week' | 'month' | 'year') => {
    // Define labels based on period
    let labels: string[] = [];
    
    if (period === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (period === 'month') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (period === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    // If we don't have enough data points, use what we have
    const chartData = {
      labels: labels.slice(0, Math.min(labels.length, data.length)),
      datasets: [
        {
          data: data.map(item => item.score),
          color: (opacity = 1) => period === 'week' 
            ? `rgba(50, 255, 165, ${opacity})` 
            : period === 'month' 
              ? `rgba(190, 147, 253, ${opacity})`
              : `rgba(255, 147, 185, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
    
    return chartData;
  };

  // Prepare data for the radar chart - using ContributionGraph as an alternative
  const getCategoryCommits = () => {
    if (!scoreBreakdown) return [];
    
    return scoreBreakdown.categories.flatMap((cat, index) => {
      // Create a number of commits based on the percentage
      const commitCount = Math.round(cat.percentage * 30);
      const date = new Date();
      date.setDate(date.getDate() - index * 2);
      
      return Array(commitCount).fill(0).map((_, i) => ({
        date: new Date(date.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        count: 1,
      }));
    });
  };

  // Prepare data for the progress chart
  const getProgressData = () => {
    if (!scoreBreakdown) return { labels: [], data: [] };
    
    return {
      labels: scoreBreakdown.categories.map(cat => 
        cat.category.charAt(0).toUpperCase() + cat.category.slice(1)
      ),
      data: scoreBreakdown.categories.map(cat => cat.percentage)
    };
  };

  // Line chart config
  const chartConfig = {
    backgroundColor: COLORS.CARD,
    backgroundGradientFrom: COLORS.CARD,
    backgroundGradientTo: COLORS.BACKGROUND,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: COLORS.PRIMARY_DARK
    },
    useShadowColorFromDataset: true,
    style: {
      borderRadius: BORDER_RADIUS.MEDIUM
    },
  };

  // Period selector buttons
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, activePeriod === 'week' && styles.activePeriod]}
        onPress={() => setActivePeriod('week')}
      >
        <Text style={[styles.periodButtonText, activePeriod === 'week' && styles.activePeriodText]}>
          Week
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, activePeriod === 'month' && styles.activePeriod]}
        onPress={() => setActivePeriod('month')}
      >
        <Text style={[styles.periodButtonText, activePeriod === 'month' && styles.activePeriodText]}>
          Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, activePeriod === 'year' && styles.activePeriod]}
        onPress={() => setActivePeriod('year')}
      >
        <Text style={[styles.periodButtonText, activePeriod === 'year' && styles.activePeriodText]}>
          Year
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading your growth data...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !scoreBreakdown || !historicalData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
        <Text style={styles.errorText}>{error || 'Failed to load score data'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchScoreData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Growth Score Analytics</Text>
        <Text style={styles.subtitle}>Track your relationship growth progress</Text>
      </View>

      {/* Score Overview */}
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.scoreOverview}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{Math.round(scoreBreakdown.totalScore)}</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={styles.scoreLabel}>Total Growth Score</Text>
          <Text style={styles.scoreChange}>
            <Ionicons name="trending-up" size={16} color={COLORS.SUCCESS} />
            {' '}
            +{Math.round(scoreBreakdown.totalScore * 0.02)} this week
          </Text>
        </View>
      </Animated.View>

      {/* Historical Chart */}
      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Growth History</Text>
          {renderPeriodSelector()}
        </View>
        <LineChart
          data={historicalData[activePeriod]}
          width={screenWidth - (SPACING.MEDIUM * 2)}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Animated.View>

      {/* Category Breakdown */}
      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <ProgressChart
          data={getProgressData()}
          width={screenWidth - (SPACING.MEDIUM * 2)}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(190, 147, 253, ${opacity})`,
          }}
          style={styles.chart}
          strokeWidth={12}
          radius={32}
          hideLegend={false}
        />
      </Animated.View>

      {/* Activity Heatmap */}
      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Growth Activity</Text>
        <ContributionGraph
          values={getCategoryCommits()}
          endDate={new Date()}
          numDays={105}
          width={screenWidth - (SPACING.MEDIUM * 2)}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(50, 255, 165, ${opacity})`,
          }}
          style={styles.chart}
          tooltipDataAttrs={() => ({})}
        />
        <Text style={styles.chartCaption}>Your growth activity over time</Text>
      </Animated.View>

      {/* Category Scores */}
      <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.categoryScoresContainer}>
        <Text style={styles.chartTitle}>Detailed Breakdown</Text>
        
        {scoreBreakdown.categories.map((category, index) => (
          <Animated.View 
            key={category.category}
            entering={FadeInRight.duration(400).delay(100 * index)} 
            style={styles.categoryScore}
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>
                {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
              </Text>
              <Text style={styles.categoryValue}>{Math.round(category.percentage * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${category.percentage * 100}%` },
                  getBarColor(index),
                ]} 
              />
            </View>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

// Helper function to get bar color based on index
function getBarColor(index: number) {
  if (index % 3 === 0) return { backgroundColor: COLORS.SUCCESS };
  if (index % 3 === 1) return { backgroundColor: COLORS.PRIMARY };
  return { backgroundColor: COLORS.SECONDARY };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: SPACING.MEDIUM,
  },
  header: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XXXL,
    fontWeight: FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  subtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  scoreOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  scoreValue: {
    fontSize: FONT_SIZES.XL,
    fontWeight: FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  scoreChange: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.SUCCESS,
  },
  chartContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  chartTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  chart: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.ROUND,
    overflow: 'hidden',
  },
  periodButton: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
  },
  periodButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  activePeriod: {
    backgroundColor: COLORS.PRIMARY,
  },
  activePeriodText: {
    color: COLORS.BLACK,
    fontWeight: FONT_WEIGHTS.SEMIBOLD as any,
  },
  categoryScoresContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  categoryScore: {
    marginBottom: SPACING.MEDIUM,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  categoryName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT,
  },
  categoryValue: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.ROUND,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.ROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  loadingText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.XLARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginTop: SPACING.MEDIUM,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  chartCaption: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
  },
}); 