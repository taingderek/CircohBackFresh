import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { StreakInsight, StreakStats } from '../../features/streaks/types';
import { getStreakStats } from '../../features/streaks/service';

interface StreakInsightsProps {
  userId: string;
  isPremium: boolean;
}

const StreakInsights: React.FC<StreakInsightsProps> = ({ userId, isPremium }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [insights, setInsights] = useState<StreakInsight[]>([]);
  
  useEffect(() => {
    loadStreakData();
  }, [userId]);
  
  const loadStreakData = async () => {
    setLoading(true);
    
    try {
      // Get streak statistics
      const streakStats = await getStreakStats(userId);
      setStats(streakStats);
      
      // Generate insights based on stats and user behavior
      const generatedInsights = generateInsights(streakStats);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading streak insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate insights based on stats
  const generateInsights = (stats: StreakStats | null): StreakInsight[] => {
    if (!stats) return [];
    
    const insights: StreakInsight[] = [];
    const now = new Date();
    
    // Add a default tip
    insights.push({
      id: 'default-tip',
      title: 'Consistency is Key',
      description: 'Regular check-ins with your contacts, even brief ones, help maintain stronger relationships than infrequent longer conversations.',
      type: 'tip',
      createdAt: now.toISOString(),
    });
    
    // Add stats-based insights
    if (stats.activeStreaks > 0) {
      insights.push({
        id: 'active-streaks',
        title: 'Active Relationship Streaks',
        description: `You're maintaining ${stats.activeStreaks} active relationship streaks with an average length of ${Math.round(stats.averageStreakLength)} days.`,
        type: 'achievement',
        createdAt: now.toISOString(),
      });
    }
    
    if (stats.atRiskStreaks > 0) {
      insights.push({
        id: 'at-risk-streaks',
        title: 'Attention Needed',
        description: `You have ${stats.atRiskStreaks} relationships at risk of breaking their streak. Check your dashboard for contacts to prioritize.`,
        type: 'trend',
        createdAt: now.toISOString(),
      });
    }
    
    // Add premium-only insights
    if (isPremium) {
      insights.push({
        id: 'premium-insight',
        title: 'Relationship Pattern',
        description: 'Your best day for maintaining relationships is Wednesday, with 35% more successful check-ins than other weekdays.',
        type: 'trend',
        createdAt: now.toISOString(),
      });
    } else if (stats.activeStreaks >= 3) {
      // Teaser for premium insights
      insights.push({
        id: 'premium-teaser',
        title: 'Unlock Advanced Insights',
        description: 'Upgrade to premium to see patterns in your relationship maintenance and get personalized suggestions.',
        type: 'tip',
        createdAt: now.toISOString(),
      });
    }
    
    return insights;
  };
  
  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Ionicons name="bulb-outline" size={22} color={colors.accentMint} />;
      case 'achievement':
        return <FontAwesome5 name="trophy" size={18} color={colors.accentLavender} />;
      case 'trend':
        return <Ionicons name="analytics-outline" size={20} color={colors.accentPink} />;
      default:
        return <Ionicons name="information-circle-outline" size={22} color={colors.accentMint} />;
    }
  };
  
  // Get background color for insight type
  const getInsightBackground = (type: string) => {
    switch (type) {
      case 'tip':
        return { backgroundColor: `${colors.accentMint}15` }; // 15% opacity
      case 'achievement':
        return { backgroundColor: `${colors.accentLavender}15` };
      case 'trend':
        return { backgroundColor: `${colors.accentPink}15` };
      default:
        return { backgroundColor: colors.secondaryDark };
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accentMint} />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relationship Insights</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadStreakData}
        >
          <Ionicons name="refresh" size={18} color={colors.accentMint} />
        </TouchableOpacity>
      </View>
      
      {/* Stats summary card */}
      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeStreaks}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.atRiskStreaks}</Text>
            <Text style={styles.statLabel}>At Risk</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.longestCurrentStreak}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
        </View>
      )}
      
      {/* Insights */}
      {insights.length > 0 ? (
        <View style={styles.insightsContainer}>
          {insights.map((insight) => (
            <View 
              key={insight.id} 
              style={[styles.insightCard, getInsightBackground(insight.type)]}
            >
              <View style={styles.insightIcon}>
                {getInsightIcon(insight.type)}
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No insights available yet. Keep using CircohBack to generate personalized insights.
          </Text>
        </View>
      )}
      
      {/* Premium CTA if not premium */}
      {!isPremium && (
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => {/* Navigate to premium upsell */}}
        >
          <Ionicons name="diamond-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.premiumButtonText}>Upgrade for Advanced Insights</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.primaryDark,
    marginHorizontal: 12,
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  premiumButton: {
    flexDirection: 'row',
    backgroundColor: colors.accentLavender,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default StreakInsights; 