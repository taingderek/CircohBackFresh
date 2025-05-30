import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import StreakCounter from './StreakCounter';
import { UserStreak, StreakMilestone } from '../../features/streaks/types';
import { calculateUserStreak, getUserMilestones } from '../../features/streaks/service';

interface StreakDashboardProps {
  userId: string;
  isPremium?: boolean;
  onStreakPress?: () => void;
  onMilestonePress?: (milestone: StreakMilestone) => void;
}

const StreakDashboard: React.FC<StreakDashboardProps> = ({
  userId,
  isPremium = false,
  onStreakPress,
  onMilestonePress
}) => {
  const [loading, setLoading] = useState(true);
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [nextMilestone, setNextMilestone] = useState<{days: number, remaining: number} | null>(null);
  
  // Load user streak data
  useEffect(() => {
    loadStreakData();
  }, [userId]);
  
  const loadStreakData = async () => {
    setLoading(true);
    try {
      // Get user's current streak
      const streak = await calculateUserStreak(userId);
      setUserStreak(streak);
      
      // Get claimed milestones
      const achievedMilestones = await getUserMilestones(userId, true);
      setMilestones(achievedMilestones);
      
      // Calculate next milestone
      if (streak) {
        calculateNextMilestone(streak.currentStreakDays);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate next milestone to achieve
  const calculateNextMilestone = (currentDays: number) => {
    const milestoneValues = [3, 7, 14, 30, 60, 90, 180, 365];
    const nextValue = milestoneValues.find(days => days > currentDays);
    
    if (nextValue) {
      setNextMilestone({
        days: nextValue,
        remaining: nextValue - currentDays
      });
    } else {
      // If already passed all predefined milestones
      setNextMilestone({
        days: 365,
        remaining: 365 - (currentDays % 365)
      });
    }
  };
  
  // Render milestone item
  const renderMilestoneItem = (days: number, isAchieved: boolean) => {
    return (
      <View 
        key={`milestone-${days}`}
        style={[
          styles.milestoneItem,
          isAchieved ? styles.milestoneAchieved : styles.milestonePending
        ]}
      >
        <View style={styles.milestoneIconContainer}>
          {isAchieved ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.accentMint} />
          ) : (
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          )}
        </View>
        <Text style={styles.milestoneDays}>{days}</Text>
        <Text style={styles.milestoneLabel}>days</Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accentMint} size="large" />
        <Text style={styles.loadingText}>Loading streak data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Current Streak Section */}
      <View style={styles.streakSection}>
        <View style={styles.streakHeader}>
          <Text style={styles.sectionTitle}>Your Current Streak</Text>
          <TouchableOpacity onPress={loadStreakData}>
            <Ionicons name="refresh" size={20} color={colors.accentMint} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.streakDisplay}>
          <StreakCounter 
            count={userStreak?.currentStreakDays || 0}
            size="large"
            onPress={onStreakPress}
          />
          
          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userStreak?.longestStreakDays || 0}
              </Text>
              <Text style={styles.statLabel}>Longest</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userStreak?.totalPoints || 0}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userStreak?.currentMultiplier?.toFixed(1) || '1.0'}x
              </Text>
              <Text style={styles.statLabel}>Multiplier</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Next Milestone Section */}
      {nextMilestone && (
        <View style={styles.nextMilestoneSection}>
          <Text style={styles.nextMilestoneTitle}>
            Next milestone: {nextMilestone.days} days
          </Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(100, ((nextMilestone.days - nextMilestone.remaining) / nextMilestone.days) * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.nextMilestoneText}>
            {nextMilestone.remaining} days to go!
          </Text>
        </View>
      )}
      
      {/* Milestones Section */}
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Streak Milestones</Text>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.milestonesContainer}
        >
          {[3, 7, 14, 30, 60, 90, 180, 365].map(days => {
            const isAchieved = milestones.some(
              m => m.streakDays === days && m.milestoneType.includes('streak_')
            );
            return renderMilestoneItem(days, isAchieved);
          })}
        </ScrollView>
      </View>
      
      {/* Premium Teaser */}
      {!isPremium && (
        <TouchableOpacity 
          style={styles.premiumTeaser}
          onPress={() => {/* Navigate to premium screen */}}
        >
          <FontAwesome5 name="crown" size={16} color={colors.accentLavender} />
          <Text style={styles.premiumText}>
            Upgrade to Premium for 2x Streak Points
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accentLavender} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  streakSection: {
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 12,
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.secondaryDark,
  },
  nextMilestoneSection: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  nextMilestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.secondaryDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accentMint,
  },
  nextMilestoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  milestonesSection: {
    marginBottom: 16,
  },
  milestonesContainer: {
    paddingVertical: 16,
  },
  milestoneItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  milestoneAchieved: {
    backgroundColor: `${colors.accentMint}20`, // 20% opacity
  },
  milestonePending: {
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
  },
  milestoneIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDays: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  milestoneLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  premiumTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.accentLavender}15`,
    borderRadius: 12,
    padding: 12,
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.accentLavender,
    marginHorizontal: 10,
  },
});

export default StreakDashboard; 