/**
 * Streak Rewards System
 * Manages streak milestones, rewards, and achievements
 */
import { supabase } from '@/app/core/services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StreakMilestone,
  StreakRecoveryItem,
  StreakRecoveryItemType,
  UserStreak
} from './types';
import { sendStreakMilestoneNotification } from './notifications';

// Storage keys
const STORAGE_KEYS = {
  UNCLAIMED_MILESTONES: 'circohback_unclaimed_milestones',
  RECOVERY_ITEMS: 'circohback_recovery_items',
};

// Milestones tracking
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

// Milestone rewards configuration
const MILESTONE_REWARDS = {
  3: { type: 'points', amount: 50 },
  7: { type: 'points', amount: 100 },
  14: { type: 'points', amount: 200 },
  30: { type: 'streak_freeze', amount: 1 },
  60: { type: 'points', amount: 500 },
  90: { type: 'streak_saver', amount: 1 },
  180: { type: 'points', amount: 1000 },
  365: { type: 'premium_feature', amount: 1 },
};

// Storage key for user rewards
const USER_REWARDS_KEY = 'circohback_user_rewards';

// Types for rewards
export interface UserReward {
  id?: string;
  userId: string;
  rewardType: 'points' | 'feature' | 'badge';
  rewardId: string;
  rewardValue: number | string;
  awardedAt: string;
  isRedeemed: boolean;
  redeemedAt?: string;
  expiresAt?: string;
}

export interface StreakRewardCheck {
  milestoneId: string;
  milestone: number;
  isAchieved: boolean;
  reward: {
    type: 'points' | 'feature' | 'badge';
    value: string | number;
    title: string;
    description: string;
  };
}

/**
 * Get all streak milestones
 */
export const getStreakMilestones = async (): Promise<StreakMilestone[]> => {
  try {
    // Get milestones from database
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .order('streak_days', { ascending: true });
      
    if (error) {
      throw new Error(`Error fetching streak milestones: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map to our type
    return data.map(milestone => ({
      id: milestone.id,
      userId: milestone.user_id,
      contactId: milestone.contact_id,
      milestoneType: milestone.milestone_type,
      streakDays: milestone.streak_days,
      rewardType: milestone.reward_type,
      rewardAmount: milestone.reward_amount,
      isClaimed: milestone.is_claimed,
      achievedAt: milestone.achieved_at
    }));
  } catch (error) {
    console.error('Error getting streak milestones:', error);
    return [];
  }
};

/**
 * Check if a streak has reached any milestones
 */
export const checkForMilestones = async (
  userId: string,
  streakDays: number,
  isUserStreak: boolean = true,
  contactId?: string
): Promise<StreakMilestone | null> => {
  try {
    // Find the highest milestone achieved
    const achievedMilestone = [...STREAK_MILESTONES]
      .sort((a, b) => b - a) // Sort descending
      .find(milestone => streakDays >= milestone);
    
    if (!achievedMilestone) {
      return null; // No milestone achieved
    }
    
    // Check if this milestone has already been recorded
    const milestoneType = isUserStreak 
      ? `streak_${achievedMilestone}_days`
      : `relationship_streak_${achievedMilestone}_days`;
    
    const { data: existingMilestones, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('milestone_type', milestoneType);
    
    if (error) {
      throw error;
    }
    
    if (existingMilestones && existingMilestones.length > 0) {
      // This milestone is already recorded
      return null;
    }
    
    // Get reward for this milestone
    const reward = MILESTONE_REWARDS[achievedMilestone as keyof typeof MILESTONE_REWARDS];
    
    // Create the milestone
    const { data: milestone, error: createError } = await supabase
      .from('streak_milestones')
      .insert({
        user_id: userId,
        contact_id: contactId || null,
        milestone_type: milestoneType,
        streak_days: achievedMilestone,
        reward_type: reward.type,
        reward_amount: reward.amount,
        is_claimed: false,
      })
      .select()
      .single();
    
    if (createError) {
      throw createError;
    }
    
    // Add to local storage for unclaimed milestones
    await addUnclaimedMilestone(milestone.id);
    
    return {
      id: milestone.id,
      userId: milestone.user_id,
      contactId: milestone.contact_id,
      milestoneType: milestone.milestone_type,
      streakDays: milestone.streak_days,
      rewardType: milestone.reward_type,
      rewardAmount: milestone.reward_amount,
      isClaimed: milestone.is_claimed,
      achievedAt: milestone.achieved_at,
    };
  } catch (error) {
    console.error('Error checking for milestones:', error);
    return null;
  }
};

/**
 * Get all unclaimed milestones for a user
 */
export const getUnclaimedMilestones = async (userId: string): Promise<StreakMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('is_claimed', false)
      .order('achieved_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(m => ({
      id: m.id,
      userId: m.user_id,
      contactId: m.contact_id,
      milestoneType: m.milestone_type,
      streakDays: m.streak_days,
      rewardType: m.reward_type,
      rewardAmount: m.reward_amount,
      isClaimed: m.is_claimed,
      achievedAt: m.achieved_at,
    }));
  } catch (error) {
    console.error('Error getting unclaimed milestones:', error);
    return [];
  }
};

/**
 * Claim a milestone reward
 */
export const claimMilestoneReward = async (
  userId: string,
  milestoneId: string
): Promise<boolean> => {
  try {
    // Get the milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('id', milestoneId)
      .eq('user_id', userId)
      .single();
    
    if (milestoneError || !milestone) {
      console.error('Error getting milestone:', milestoneError);
      return false;
    }
    
    // Check if already claimed
    if (milestone.is_claimed) {
      console.log('Milestone already claimed');
      return false;
    }
    
    // Update milestone as claimed
    const { error: updateError } = await supabase
      .from('streak_milestones')
      .update({ is_claimed: true })
      .eq('id', milestoneId);
    
    if (updateError) {
      console.error('Error updating milestone:', updateError);
      return false;
    }
    
    // Process reward based on type
    if (milestone.reward_type === 'points' && milestone.reward_amount) {
      // Add points to user streak
      await addPointsToUserStreak(userId, milestone.reward_amount);
    } else if (milestone.reward_type === 'streak_freeze' || milestone.reward_type === 'streak_saver') {
      // Add recovery item to inventory
      await addRecoveryItem(
        userId, 
        milestone.reward_type === 'streak_freeze' 
          ? StreakRecoveryItemType.STREAK_FREEZE 
          : StreakRecoveryItemType.STREAK_SAVER,
        milestone.reward_amount || 1
      );
    }
    
    // Remove from unclaimed milestones in local storage
    await removeUnclaimedMilestone(milestoneId);
    
    return true;
  } catch (error) {
    console.error('Error claiming milestone reward:', error);
    return false;
  }
};

/**
 * Get all recovery items for a user
 */
export const getRecoveryItems = async (userId: string): Promise<StreakRecoveryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('streak_recovery_items')
      .select('*')
      .eq('user_id', userId)
      .gt('quantity', 0)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      itemType: item.item_type as StreakRecoveryItemType,
      quantity: item.quantity,
      isPremium: item.is_premium,
      expiresAt: item.expires_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error getting recovery items:', error);
    return [];
  }
};

/**
 * Use a streak recovery item
 */
export const useRecoveryItem = async (
  userId: string,
  itemId: string
): Promise<boolean> => {
  try {
    // Get the item
    const { data: item, error } = await supabase
      .from('streak_recovery_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .gt('quantity', 0)
      .single();
    
    if (error || !item) {
      console.error('Error getting recovery item or item not found:', error);
      return false;
    }
    
    // Update quantity
    await supabase
      .from('streak_recovery_items')
      .update({
        quantity: item.quantity - 1,
      })
      .eq('id', itemId);
    
    // TODO: Apply the specific recovery effect
    // This depends on app logic for streak recovery and would
    // differ for streak_freeze vs streak_saver
    
    return true;
  } catch (error) {
    console.error('Error using recovery item:', error);
    return false;
  }
};

/**
 * Get all achievements for a user
 * This includes claimed milestones and other accomplishments
 */
export const getAchievements = async (userId: string): Promise<StreakMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('is_claimed', true)
      .order('streak_days', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(m => ({
      id: m.id,
      userId: m.user_id,
      contactId: m.contact_id,
      milestoneType: m.milestone_type,
      streakDays: m.streak_days,
      rewardType: m.reward_type,
      rewardAmount: m.reward_amount,
      isClaimed: m.is_claimed,
      achievedAt: m.achieved_at,
    }));
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

/**
 * Helper methods
 */

// Add points to user streak
const addPointsToUserStreak = async (userId: string, points: number): Promise<void> => {
  try {
    // Get current streak
    const { data: streak, error } = await supabase
      .from('user_streaks')
      .select('total_points, level, points_to_next_level')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    let newPoints = streak.total_points + points;
    let newLevel = streak.level;
    let newPointsToNextLevel = streak.points_to_next_level - points;
    
    // Level up if enough points
    while (newPointsToNextLevel <= 0) {
      newLevel++;
      // Next level requires more points (simple formula, adjust as needed)
      const nextLevelPoints = Math.floor(100 * (1 + (newLevel * 0.5)));
      newPointsToNextLevel += nextLevelPoints;
    }
    
    // Update streak
    await supabase
      .from('user_streaks')
      .update({
        total_points: newPoints,
        level: newLevel,
        points_to_next_level: newPointsToNextLevel > 0 ? newPointsToNextLevel : 1,
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error adding points to user streak:', error);
  }
};

// Add recovery item to inventory
const addRecoveryItem = async (
  userId: string,
  itemType: StreakRecoveryItemType,
  quantity: number = 1
): Promise<void> => {
  try {
    // Check if user already has this item type
    const { data: existingItems, error } = await supabase
      .from('streak_recovery_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', itemType);
    
    if (error) {
      throw error;
    }
    
    if (existingItems && existingItems.length > 0) {
      // Update quantity of existing item
      await supabase
        .from('streak_recovery_items')
        .update({
          quantity: existingItems[0].quantity + quantity,
        })
        .eq('id', existingItems[0].id);
    } else {
      // Create new item
      const isPremium = itemType === StreakRecoveryItemType.STREAK_SAVER;
      
      // Calculate expiration date if needed (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      await supabase
        .from('streak_recovery_items')
        .insert({
          user_id: userId,
          item_type: itemType,
          quantity,
          is_premium: isPremium,
          expires_at: expiresAt.toISOString(),
        });
    }
  } catch (error) {
    console.error('Error adding recovery item:', error);
  }
};

// Add unclaimed milestone to local storage
const addUnclaimedMilestone = async (milestoneId: string): Promise<void> => {
  try {
    const unclaimedStr = await AsyncStorage.getItem(STORAGE_KEYS.UNCLAIMED_MILESTONES);
    let unclaimed: string[] = unclaimedStr ? JSON.parse(unclaimedStr) : [];
    
    if (!unclaimed.includes(milestoneId)) {
      unclaimed.push(milestoneId);
      await AsyncStorage.setItem(STORAGE_KEYS.UNCLAIMED_MILESTONES, JSON.stringify(unclaimed));
    }
  } catch (error) {
    console.error('Error adding unclaimed milestone:', error);
  }
};

// Remove unclaimed milestone from local storage
const removeUnclaimedMilestone = async (milestoneId: string): Promise<void> => {
  try {
    const unclaimedStr = await AsyncStorage.getItem(STORAGE_KEYS.UNCLAIMED_MILESTONES);
    let unclaimed: string[] = unclaimedStr ? JSON.parse(unclaimedStr) : [];
    
    unclaimed = unclaimed.filter(id => id !== milestoneId);
    await AsyncStorage.setItem(STORAGE_KEYS.UNCLAIMED_MILESTONES, JSON.stringify(unclaimed));
  } catch (error) {
    console.error('Error removing unclaimed milestone:', error);
  }
};

/**
 * Check and award streak milestones
 */
export const checkAndAwardStreakMilestones = async (
  userId: string,
  currentStreakDays: number,
  isUserStreak: boolean = true,
  contactId?: string,
  contactName?: string,
  isPremium: boolean = false
): Promise<StreakRewardCheck[]> => {
  try {
    // Get all streak milestones
    const milestones = await getStreakMilestones();
    
    // Get existing user rewards
    const userRewards = await getUserRewards(userId);
    
    const rewardChecks: StreakRewardCheck[] = [];
    let newRewardsAwarded = false;
    
    for (const milestone of milestones) {
      // Only non-premium or premium users can access all milestones
      if (!isPremium && milestone.milestoneType.includes('premium')) {
        continue;
      }
      
      const isAchieved = currentStreakDays >= milestone.streakDays;
      
      // Check if already awarded this milestone for this entity (user or relationship)
      const alreadyAwarded = userRewards.some(reward => 
        reward.rewardId === (isUserStreak ? milestone.id : `${milestone.id}_${contactId}`)
      );
      
      rewardChecks.push({
        milestoneId: milestone.id,
        milestone: milestone.streakDays,
        isAchieved,
        reward: {
          type: milestone.rewardType as 'points' | 'feature' | 'badge',
          value: milestone.rewardAmount || 0,
          title: `${milestone.streakDays} Day Streak`,
          description: isUserStreak 
            ? `Maintain app usage for ${milestone.streakDays} days` 
            : `Maintain contact for ${milestone.streakDays} days`
        }
      });
      
      // If achieved, not already awarded, and matches current day exactly, award it
      if (isAchieved && !alreadyAwarded && currentStreakDays === milestone.streakDays) {
        // Create reward ID based on whether it's user or relationship streak
        const rewardId = isUserStreak 
          ? milestone.id 
          : `${milestone.id}_${contactId}`;
        
        const newReward: UserReward = {
          userId,
          rewardType: milestone.rewardType as 'points' | 'feature' | 'badge',
          rewardId,
          rewardValue: milestone.rewardAmount || 0,
          awardedAt: new Date().toISOString(),
          isRedeemed: milestone.rewardType === 'badge', // Badges are auto-redeemed
        };
        
        // Save to user rewards table
        await supabase
          .from('user_rewards')
          .insert({
            user_id: userId,
            reward_type: milestone.rewardType,
            reward_id: rewardId,
            reward_value: milestone.rewardAmount,
            awarded_at: newReward.awardedAt,
            is_redeemed: newReward.isRedeemed,
            contact_id: contactId
          });
        
        // Save to local cache
        const rewards = userRewards.concat(newReward);
        await AsyncStorage.setItem(USER_REWARDS_KEY, JSON.stringify(rewards));
        
        // Send notification
        await sendStreakMilestoneNotification(
          userId,
          milestone.streakDays,
          isUserStreak,
          contactName
        );
        
        // Add points if that's the reward type
        if (milestone.rewardType === 'points') {
          await addPointsToUser(userId, Number(milestone.rewardAmount) || 0);
        }
        
        newRewardsAwarded = true;
      }
    }
    
    return rewardChecks;
  } catch (error) {
    console.error('Error checking and awarding streak milestones:', error);
    return [];
  }
};

/**
 * Get a user's rewards
 */
export const getUserRewards = async (userId: string): Promise<UserReward[]> => {
  try {
    // Try local cache first
    const cachedRewards = await AsyncStorage.getItem(USER_REWARDS_KEY);
    if (cachedRewards) {
      return JSON.parse(cachedRewards);
    }
    
    // Get from database
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      throw new Error(`Error fetching user rewards: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map to our type
    const rewards = data.map(reward => ({
      id: reward.id,
      userId: reward.user_id,
      rewardType: reward.reward_type,
      rewardId: reward.reward_id,
      rewardValue: reward.reward_value,
      awardedAt: reward.awarded_at,
      isRedeemed: reward.is_redeemed,
      redeemedAt: reward.redeemed_at,
      expiresAt: reward.expires_at
    }));
    
    // Cache locally
    await AsyncStorage.setItem(USER_REWARDS_KEY, JSON.stringify(rewards));
    
    return rewards;
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return [];
  }
};

/**
 * Add points to a user's account
 */
export const addPointsToUser = async (userId: string, points: number): Promise<boolean> => {
  try {
    // Update user_streaks table to add points
    const { data, error } = await supabase
      .from('user_streaks')
      .select('total_points')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    const currentPoints = data?.total_points || 0;
    const newPoints = currentPoints + points;
    
    if (data) {
      // Update existing record
      await supabase
        .from('user_streaks')
        .update({ total_points: newPoints })
        .eq('user_id', userId);
    } else {
      // Insert new record
      await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          total_points: points
        });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding points to user:', error);
    return false;
  }
};

/**
 * Redeem a streak reward
 */
export const redeemReward = async (userId: string, rewardId: string): Promise<boolean> => {
  try {
    // Get the reward
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_id', rewardId)
      .single();
      
    if (error) {
      throw new Error(`Error fetching reward to redeem: ${error.message}`);
    }
    
    // Check if already redeemed
    if (data.is_redeemed) {
      throw new Error('Reward has already been redeemed');
    }
    
    // Redeem the reward
    const now = new Date().toISOString();
    await supabase
      .from('user_rewards')
      .update({
        is_redeemed: true,
        redeemed_at: now
      })
      .eq('id', data.id);
      
    // Update local cache
    const cachedRewards = await AsyncStorage.getItem(USER_REWARDS_KEY);
    if (cachedRewards) {
      const rewards: UserReward[] = JSON.parse(cachedRewards);
      const updatedRewards = rewards.map(reward => {
        if (reward.rewardId === rewardId) {
          return {
            ...reward,
            isRedeemed: true,
            redeemedAt: now
          };
        }
        return reward;
      });
      
      await AsyncStorage.setItem(USER_REWARDS_KEY, JSON.stringify(updatedRewards));
    }
    
    return true;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return false;
  }
};

/**
 * Get active streak freezes available to use
 */
export const getAvailableStreakFreezes = async (userId: string): Promise<number> => {
  try {
    // Check for streak freeze feature rewards that have been awarded but not redeemed
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_type', 'feature')
      .eq('reward_value', 'streak_freeze')
      .eq('is_redeemed', false);
      
    if (error) {
      throw new Error(`Error fetching streak freezes: ${error.message}`);
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('Error getting available streak freezes:', error);
    return 0;
  }
};

/**
 * Use a streak freeze to protect a relationship streak
 */
export const useStreakFreeze = async (
  userId: string,
  contactId: string,
  freezeDays: number = 7
): Promise<boolean> => {
  try {
    // Check if user has any streak freezes available
    const availableFreezes = await getAvailableStreakFreezes(userId);
    if (availableFreezes <= 0) {
      throw new Error('No streak freezes available');
    }
    
    // Get the oldest unredeemed streak freeze reward
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_type', 'feature')
      .eq('reward_value', 'streak_freeze')
      .eq('is_redeemed', false)
      .order('awarded_at', { ascending: true })
      .limit(1)
      .single();
      
    if (error) {
      throw new Error(`Error fetching streak freeze to use: ${error.message}`);
    }
    
    // Calculate freeze end date
    const freezeUntil = new Date();
    freezeUntil.setDate(freezeUntil.getDate() + freezeDays);
    
    // Apply freeze to relationship streak
    const freezeResult = await supabase.rpc('freeze_relationship_streak', {
      p_user_id: userId,
      p_contact_id: contactId,
      p_freeze_until: freezeUntil.toISOString()
    });
    
    if (freezeResult.error) {
      throw new Error(`Error freezing streak: ${freezeResult.error.message}`);
    }
    
    // Mark reward as redeemed
    await supabase
      .from('user_rewards')
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', data.id);
      
    // Update local cache
    const cachedRewards = await AsyncStorage.getItem(USER_REWARDS_KEY);
    if (cachedRewards) {
      const rewards: UserReward[] = JSON.parse(cachedRewards);
      const updatedRewards = rewards.map(reward => {
        if (reward.id === data.id) {
          return {
            ...reward,
            isRedeemed: true,
            redeemedAt: new Date().toISOString()
          };
        }
        return reward;
      });
      
      await AsyncStorage.setItem(USER_REWARDS_KEY, JSON.stringify(updatedRewards));
    }
    
    return true;
  } catch (error) {
    console.error('Error using streak freeze:', error);
    return false;
  }
}; 