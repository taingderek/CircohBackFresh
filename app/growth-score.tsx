import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import HeaderWithBackButton from '@/app/components/navigation/HeaderWithBackButton';
import Icon from '@/app/components/common/Icon';
import { useGrowthScore } from '@/app/features/growth-score';
import { GrowthScoreDisplay } from '@/app/features/growth-score';
import { Activity, Achievement } from '@/app/features/growth-score/types';

// Tab options for the growth score details
type TabOption = 'activities' | 'achievements' | 'insights';

export default function GrowthScoreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabOption>('activities');
  
  // Get growth score data from the hook
  const { 
    totalScore, 
    activities, 
    achievements, 
    levelProgress, 
    currentLevel, 
    levelTitle,
    scoreBreakdown,
  } = useGrowthScore();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Render activity item
  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Icon 
            name={getActivityIcon(item.type)} 
            size={20} 
            color={getActivityColor(item.type)} 
          />
        </View>
        <View style={styles.activityDetails}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.activityPoints}>+{item.points}</Text>
      </View>
      {item.description && (
        <Text style={styles.activityDescription}>{item.description}</Text>
      )}
    </View>
  );

  // Render achievement item
  const renderAchievementItem = ({ item }: { item: Achievement }) => (
    <View style={styles.achievementItem}>
      <View style={[
        styles.achievementIconContainer, 
        { backgroundColor: `${item.color}30` }
      ]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.achievementDetails}>
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
        <Text style={styles.achievementDate}>Unlocked: {formatDate(item.dateUnlocked)}</Text>
      </View>
      <Text style={[styles.achievementPoints, { color: item.color }]}>+{item.points}</Text>
    </View>
  );

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'message': return 'chatbubble-outline';
      case 'call': return 'call-outline';
      case 'meeting': return 'people-outline';
      case 'reminder': return 'calendar-outline';
      case 'note': return 'create-outline';
      case 'contact_added': return 'person-add-outline';
      default: return 'star-outline';
    }
  };

  // Get color for activity type
  const getActivityColor = (type: string) => {
    switch(type) {
      case 'message': return COLORS.PRIMARY;
      case 'call': return COLORS.SECONDARY;
      case 'meeting': return COLORS.ACCENT_MINT;
      case 'reminder': return COLORS.ACCENT_LAVENDER;
      case 'note': return COLORS.ACCENT_PINK;
      case 'contact_added': return COLORS.SUCCESS;
      default: return COLORS.WARNING;
    }
  };

  // Render insights tab content
  const renderInsightsTab = () => (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Score Breakdown</Text>
      
      {/* Score Breakdown */}
      <View style={styles.breakdownContainer}>
        {Object.entries(scoreBreakdown.categories).map(([category, value]) => (
          <View key={category} style={styles.breakdownItem}>
            <View style={styles.breakdownBar}>
              <View 
                style={[
                  styles.breakdownFill, 
                  { 
                    width: `${value}%`, 
                    backgroundColor: getCategoryColor(category) 
                  }
                ]} 
              />
            </View>
            <View style={styles.breakdownDetails}>
              <Text style={styles.breakdownCategory}>
                {formatCategoryName(category)}
              </Text>
              <Text style={styles.breakdownPercentage}>{Math.round(value)}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Icon name="trophy-outline" size={24} color={COLORS.ACCENT_MINT} />
          <Text style={styles.statsValue}>{achievements.length}</Text>
          <Text style={styles.statsLabel}>Achievements</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Icon name="flame-outline" size={24} color={COLORS.ACCENT_LAVENDER} />
          <Text style={styles.statsValue}>{activities.length}</Text>
          <Text style={styles.statsLabel}>Activities</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Icon name="star-outline" size={24} color={COLORS.ACCENT_PINK} />
          <Text style={styles.statsValue}>{totalScore}</Text>
          <Text style={styles.statsLabel}>Total Score</Text>
        </View>
      </View>
    </View>
  );

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get color for category
  const getCategoryColor = (category: string): string => {
    switch(category) {
      case 'messaging': return COLORS.PRIMARY;
      case 'calls': return COLORS.SECONDARY;
      case 'reminders': return COLORS.ACCENT_MINT;
      case 'contacts': return COLORS.ACCENT_LAVENDER;
      case 'notes': return COLORS.ACCENT_PINK;
      default: return COLORS.WARNING;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <HeaderWithBackButton 
        title="Growth Score" 
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.scoreCardContainer}>
          <GrowthScoreDisplay size="xlarge" />
          
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>
              Level {currentLevel}: {levelTitle}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${levelProgress.progressPercentage}%`,
                      backgroundColor: levelProgress.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(levelProgress.progressPercentage)}% to Level {currentLevel + 1}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'activities' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('activities')}
          >
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === 'activities' && styles.activeTabButtonText
              ]}
            >
              Activities
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'achievements' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === 'achievements' && styles.activeTabButtonText
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'insights' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('insights')}
          >
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === 'insights' && styles.activeTabButtonText
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'activities' && (
            <View>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {activities.length > 0 ? (
                <FlatList
                  data={activities.slice().reverse()}
                  renderItem={renderActivityItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="calendar-outline" size={48} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.emptyStateText}>No activities recorded yet</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'achievements' && (
            <View>
              <Text style={styles.sectionTitle}>Achievements</Text>
              {achievements.length > 0 ? (
                <FlatList
                  data={achievements}
                  renderItem={renderAchievementItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="trophy-outline" size={48} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.emptyStateText}>No achievements unlocked yet</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'insights' && renderInsightsTab()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  scoreCardContainer: {
    padding: SPACING.LARGE,
    alignItems: 'center',
  },
  levelInfo: {
    marginTop: SPACING.MEDIUM,
    width: '100%',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  progressContainer: {
    width: '100%',
    marginTop: SPACING.SMALL,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.CARD,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    marginHorizontal: SPACING.LARGE,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
  },
  tabButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  activeTabButtonText: {
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  tabContent: {
    padding: SPACING.LARGE,
    paddingTop: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  activityItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
  },
  activityTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  activityDate: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  activityPoints: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.SUCCESS,
  },
  activityDescription: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
  },
  achievementItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementDetails: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
  },
  achievementTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  achievementDescription: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
  },
  achievementDate: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_MUTED,
    marginTop: SPACING.TINY,
  },
  achievementPoints: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: SPACING.LARGE,
  },
  insightsTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  breakdownContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  breakdownItem: {
    marginBottom: SPACING.MEDIUM,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: COLORS.CARD_LIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.TINY,
  },
  breakdownFill: {
    height: '100%',
  },
  breakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownCategory: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  breakdownPercentage: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.SMALL,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginVertical: SPACING.SMALL,
  },
  statsLabel: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
}); 