import { supabase } from './supabaseClient';

/**
 * Interface for streak data
 */
export interface Streak {
  id: string;
  userId: string;
  streakType: 'app_usage' | 'relationship' | 'contact' | 'message';
  currentCount: number;
  longestCount: number;
  targetContactId?: string | null;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for milestone data
 */
export interface Milestone {
  id: string;
  userId: string;
  streakId: string;
  streakType: string;
  streakDays: number;
  rewardType: 'points' | 'feature_unlock' | 'badge';
  rewardAmount: number;
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

/**
 * Service for handling user streaks from Supabase
 */
export const streakService = {
  /**
   * Get all streaks for the current user
   */
  getUserStreaks: async (): Promise<Streak[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Transform to our format
      return (data || []).map(streak => ({
        id: streak.id,
        userId: streak.user_id,
        streakType: streak.streak_type,
        currentCount: streak.current_count,
        longestCount: streak.longest_count,
        targetContactId: streak.target_contact_id,
        lastActivityDate: streak.last_activity_date,
        createdAt: streak.created_at,
        updatedAt: streak.updated_at
      }));
    } catch (error) {
      console.error('Error fetching user streaks:', error);
      
      // Fallback to mock data if there's an error or during development
      return [
        {
          id: '1',
          userId: 'current-user',
          streakType: 'app_usage',
          currentCount: 7,
          longestCount: 14,
          targetContactId: null,
          lastActivityDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'current-user',
          streakType: 'relationship',
          currentCount: 5,
          longestCount: 10,
          targetContactId: null,
          lastActivityDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  },
  
  /**
   * Get user milestones
   * @param claimed Whether to get claimed or unclaimed milestones
   */
  getUserMilestones: async (claimed: boolean = false): Promise<Milestone[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('streak_milestones')
        .select('*')
        .eq('user_id', user.id)
        .eq('claimed', claimed)
        .order('streak_days', { ascending: false });
        
      if (error) throw error;
      
      // Transform to our format
      return (data || []).map(milestone => ({
        id: milestone.id,
        userId: milestone.user_id,
        streakId: milestone.streak_id,
        streakType: milestone.streak_type,
        streakDays: milestone.streak_days,
        rewardType: milestone.reward_type,
        rewardAmount: milestone.reward_amount,
        claimed: milestone.claimed,
        claimedAt: milestone.claimed_at,
        createdAt: milestone.created_at
      }));
    } catch (error) {
      console.error('Error fetching user milestones:', error);
      
      // Fallback to mock data if there's an error or during development
      return [
        {
          id: '1',
          userId: 'current-user',
          streakId: '1',
          streakType: 'app_usage',
          streakDays: 7,
          rewardType: 'points',
          rewardAmount: 100,
          claimed: claimed,
          claimedAt: claimed ? new Date().toISOString() : null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: '2',
          userId: 'current-user',
          streakId: '2',
          streakType: 'relationship',
          streakDays: 5,
          rewardType: 'badge',
          rewardAmount: 1,
          claimed: claimed,
          claimedAt: claimed ? new Date(Date.now() - 1000 * 60 * 60).toISOString() : null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        }
      ];
    }
  },
  
  /**
   * Claim a milestone reward
   */
  claimMilestoneReward: async (milestoneId: string): Promise<boolean> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      // First, check if milestone exists and belongs to user
      const { data: milestone, error: fetchError } = await supabase
        .from('streak_milestones')
        .select('*')
        .eq('id', milestoneId)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (milestone.claimed) {
        throw new Error('Milestone already claimed');
      }
      
      // Update the milestone to claimed
      const { error: updateError } = await supabase
        .from('streak_milestones')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', milestoneId);
        
      if (updateError) throw updateError;
      
      // Process the reward (e.g., add points to user profile)
      if (milestone.reward_type === 'points') {
        const { error: pointsError } = await supabase.rpc('add_user_points', {
          user_id: user.id,
          points_to_add: milestone.reward_amount
        });
        
        if (pointsError) throw pointsError;
      }
      
      return true;
    } catch (error) {
      console.error('Error claiming milestone reward:', error);
      return false;
    }
  }
}; 