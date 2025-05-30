import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import StreakDashboard from '../../components/streaks/StreakDashboard';
import StreakMilestoneModal from '../../components/streaks/StreakMilestoneModal';
import { StreakMilestone } from '../../features/streaks/types';
import { getUserMilestones } from '../../features/streaks/service';
import { claimMilestoneReward } from '../../features/streaks/rewards';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

const StreaksScreen = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);
  const [unclaimedMilestones, setUnclaimedMilestones] = useState<StreakMilestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<StreakMilestone | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  
  // Load unclaimed milestones
  const loadUnclaimedMilestones = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const milestones = await getUserMilestones(user.id, false);
      setUnclaimedMilestones(milestones);
      
      // Show first unclaimed milestone if there are any
      if (milestones.length > 0 && !showMilestoneModal) {
        setSelectedMilestone(milestones[0]);
        setShowMilestoneModal(true);
      }
    } catch (error) {
      console.error('Error loading unclaimed milestones:', error);
    }
  }, [user?.id, showMilestoneModal]);
  
  // Load on initial render and when screen comes into focus
  useEffect(() => {
    loadUnclaimedMilestones();
  }, [loadUnclaimedMilestones]);
  
  useFocusEffect(
    useCallback(() => {
      loadUnclaimedMilestones();
    }, [loadUnclaimedMilestones])
  );
  
  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUnclaimedMilestones();
    setRefreshing(false);
  }, [loadUnclaimedMilestones]);
  
  // Handle claiming a milestone reward
  const handleClaimReward = async (milestoneId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await claimMilestoneReward(user.id, milestoneId);
      
      if (success) {
        // Remove claimed milestone from list
        setUnclaimedMilestones(prev => prev.filter(m => m.id !== milestoneId));
        setShowMilestoneModal(false);
        
        // Show next unclaimed milestone if there are any
        setTimeout(() => {
          const nextMilestones = unclaimedMilestones.filter(m => m.id !== milestoneId);
          if (nextMilestones.length > 0) {
            setSelectedMilestone(nextMilestones[0]);
            setShowMilestoneModal(true);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error claiming milestone reward:', error);
    }
  };
  
  // Render unclaimed milestone card
  const renderUnclaimedMilestoneCard = (milestone: StreakMilestone) => {
    return (
      <TouchableOpacity
        key={milestone.id}
        style={styles.milestoneCard}
        onPress={() => {
          setSelectedMilestone(milestone);
          setShowMilestoneModal(true);
        }}
      >
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneIconContainer}>
            <Ionicons name="trophy" size={20} color={colors.accentMint} />
          </View>
          <Text style={styles.milestoneTitle}>
            {milestone.streakDays} Day Streak Achievement!
          </Text>
        </View>
        
        <Text style={styles.milestoneDescription}>
          {milestone.milestoneType.includes('relationship')
            ? `You've maintained a relationship streak for ${milestone.streakDays} days!`
            : `You've used CircohBack for ${milestone.streakDays} consecutive days!`
          }
        </Text>
        
        <View style={styles.milestoneFooter}>
          <Text style={styles.milestoneReward}>
            Reward: {milestone.rewardType === 'points' 
              ? `${milestone.rewardAmount} points` 
              : milestone.rewardType?.replace('_', ' ')}
          </Text>
          <Text style={styles.milestoneClaimText}>Tap to claim</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentMint}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Streak Tracker</Text>
          <Text style={styles.subtitle}>Keep up your daily usage and relationship streaks</Text>
        </View>
        
        {/* Streak Dashboard */}
        {user?.id && (
          <StreakDashboard
            userId={user.id}
            isPremium={isPremium}
            onStreakPress={() => {/* Navigate to streak details */}}
          />
        )}
        
        {/* Unclaimed Milestones Section */}
        {unclaimedMilestones.length > 0 && (
          <View style={styles.unclaimedSection}>
            <Text style={styles.sectionTitle}>Unclaimed Rewards</Text>
            {unclaimedMilestones.map(renderUnclaimedMilestoneCard)}
          </View>
        )}
        
        {/* Streak Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Streak Tips</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={22} color={colors.accentMint} style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Set a daily reminder</Text>
              <Text style={styles.tipText}>
                Enable notifications to receive a reminder to maintain your streak each day.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="time-outline" size={22} color={colors.accentLavender} style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Check in at the same time</Text>
              <Text style={styles.tipText}>
                Building a consistent habit is easier when you do it at the same time each day.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="shield-outline" size={22} color={colors.accentPink} style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Use streak freezes wisely</Text>
              <Text style={styles.tipText}>
                Save your streak freezes for when you really need them - like during travel or busy periods.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Milestone Modal */}
      {selectedMilestone && (
        <StreakMilestoneModal
          milestone={selectedMilestone}
          isVisible={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
          onClaim={(id) => handleClaimReward(id)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  unclaimedSection: {
    marginVertical: 16,
  },
  milestoneCard: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.accentMint}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  milestoneDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneReward: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accentMint,
  },
  milestoneClaimText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tipsSection: {
    marginTop: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default StreaksScreen; 