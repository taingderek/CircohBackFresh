import { supabase } from '@/app/core/services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, isAfter, isBefore, parseISO, subDays, addDays, startOfDay } from 'date-fns';
import { 
  RelationshipStreak, 
  StreakRequirement, 
  StreakRequirementType, 
  StreakStatus, 
  UserStreak,
  StreakEvent,
  StreakEventType,
  StreakMilestone,
  AtRiskContact,
  SuggestedContact,
  StreakStats
} from './types';

// Storage keys
const USER_STREAK_KEY = 'circohback_user_streak';
const RELATIONSHIP_STREAKS_KEY = 'circohback_relationship_streaks';
const STREAK_EVENTS_KEY = 'circohback_streak_events';

// Constants
const AT_RISK_THRESHOLD_DAYS = 2; // Days until a streak becomes at risk
const GRACE_PERIOD_DAYS = 2; // Days where a broken streak can be recovered
const STREAK_POINTS_BASE = 10; // Base points for maintaining a streak
const STREAK_POINTS_MULTIPLIER_THRESHOLD = 5; // Days until multiplier kicks in
const DEFAULT_GRACE_PERIOD_DAYS = 2; // Days before streak breaks
const DEFAULT_CONTACT_FREQUENCY = 7; // Default days between expected contacts
const MILESTONE_DAYS = [3, 7, 14, 30, 60, 90, 180, 365]; // Streak milestones

/**
 * Initialize streak for a new user
 */
export const initializeUserStreak = async (userId: string): Promise<UserStreak | null> => {
  try {
    // Check if streak already exists
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingStreak) {
      // Return existing streak
      return mapDbUserStreakToUserStreak(existingStreak);
    }
    
    // Create new streak
    const { data, error } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak_days: 1, // Start with 1 day streak for new users
        longest_streak_days: 1,
        current_multiplier: 1.0,
        total_points: 10, // Starting points
        level: 1,
        points_to_next_level: 100,
        last_activity_date: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Also save locally
    const userStreak = mapDbUserStreakToUserStreak(data);
    await AsyncStorage.setItem(USER_STREAK_KEY, JSON.stringify(userStreak));
    
    return userStreak;
  } catch (error) {
    console.error('Error initializing user streak:', error);
    return null;
  }
};

/**
 * Calculate and update user streak
 */
export const calculateUserStreak = async (userId: string): Promise<UserStreak | null> => {
  try {
    // Try to get from local storage first in case we're offline
    const cachedStreakStr = await AsyncStorage.getItem(USER_STREAK_KEY);
    let userStreak: UserStreak | null = cachedStreakStr ? JSON.parse(cachedStreakStr) : null;
    
    // Fetch from database
    const { data: dbStreak, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching user streak:', error);
      return userStreak; // Return cached data if available
    }
    
    // If no streak exists in DB, initialize one
    if (!dbStreak) {
      return initializeUserStreak(userId);
    }
    
    // Map DB streak to app model
    userStreak = mapDbUserStreakToUserStreak(dbStreak);
    
    // Check if streak needs to be updated
    const lastActivityDate = userStreak.lastActivityDate ? new Date(userStreak.lastActivityDate) : null;
    const today = startOfDay(new Date());
    
    if (lastActivityDate) {
      const daysSinceLastActivity = differenceInDays(today, lastActivityDate);
      
      // If more than 1 day since last activity, streak is broken
      if (daysSinceLastActivity > 1) {
        userStreak.currentStreakDays = 1; // Reset to 1 for today's login
        userStreak.currentMultiplier = 1.0; // Reset multiplier
      } 
      // If exactly 1 day since last activity, increment streak
      else if (daysSinceLastActivity === 1) {
        userStreak.currentStreakDays += 1;
        
        // Update longest streak if needed
        if (userStreak.currentStreakDays > userStreak.longestStreakDays) {
          userStreak.longestStreakDays = userStreak.currentStreakDays;
        }
        
        // Update multiplier (increases every 5 days)
        if (userStreak.currentStreakDays % 5 === 0) {
          userStreak.currentMultiplier += 0.1;
        }
        
        // Check for milestones
        if (MILESTONE_DAYS.includes(userStreak.currentStreakDays)) {
          await createStreakMilestone(userId, userStreak.currentStreakDays);
        }
      }
      // Otherwise, we already logged in today, no streak change
    }
    
    // Update last activity date to today
    userStreak.lastActivityDate = today.toISOString();
    
    // Save to database
    await supabase
      .from('user_streaks')
      .update({
        current_streak_days: userStreak.currentStreakDays,
        longest_streak_days: userStreak.longestStreakDays,
        current_multiplier: userStreak.currentMultiplier,
        last_activity_date: userStreak.lastActivityDate,
      })
      .eq('user_id', userId);
    
    // Save to local storage
    await AsyncStorage.setItem(USER_STREAK_KEY, JSON.stringify(userStreak));
    
    return userStreak;
  } catch (error) {
    console.error('Error calculating user streak:', error);
    return null;
  }
};

/**
 * Log user activity for streak maintenance
 */
export const logStreakActivity = async (userId: string, eventType: StreakEventType = StreakEventType.APP_LOGIN): Promise<boolean> => {
  try {
    // Create streak event
    const event: Partial<StreakEvent> = {
      userId,
      eventType,
      eventDate: new Date().toISOString(),
      pointsEarned: 10, // Base points for activity
    };
    
    // Try to save to database
    const { error } = await supabase
      .from('streak_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_date: event.eventDate,
        points_earned: event.pointsEarned,
      });
    
    if (error) {
      // If offline, store for later sync
      const offlineEventsStr = await AsyncStorage.getItem(USER_STREAK_KEY);
      let offlineEvents: Partial<StreakEvent>[] = offlineEventsStr ? JSON.parse(offlineEventsStr) : [];
      offlineEvents.push(event);
      await AsyncStorage.setItem(USER_STREAK_KEY, JSON.stringify(offlineEvents));
    }
    
    // Update user streak
    await calculateUserStreak(userId);
    
    return true;
  } catch (error) {
    console.error('Error logging streak activity:', error);
    return false;
  }
};

/**
 * Get streak requirements for today
 */
export const getStreakRequirementsForToday = async (userId: string): Promise<StreakRequirement[]> => {
  try {
    // Get at-risk relationships that need attention
    const atRiskRelationships = await getAtRiskRelationships(userId);
    
    // Create requirements list
    const requirements: StreakRequirement[] = [
      // Daily app usage requirement
      {
        id: 'daily-app-login',
        title: 'Use CircohBack',
        description: 'Open the app to maintain your streak',
        points: 10,
        isCompleted: true, // Auto-completed by opening the app
        requirementType: 'daily_activity',
      },
    ];
    
    // Add requirements for at-risk relationships
    atRiskRelationships.forEach((relationship, index) => {
      requirements.push({
        id: `contact-${relationship.id}`,
        title: `Contact ${relationship.name}`,
        description: `Streak with ${relationship.name} will break in ${getDaysUntilBreak(relationship.gracePeriodEnds)} days`,
        points: 20,
        isCompleted: false,
        requirementType: 'contact_required',
        requiredAction: 'message',
      });
    });
    
    // TODO: Add personalized recommendations based on user patterns
    
    return requirements;
  } catch (error) {
    console.error('Error getting streak requirements:', error);
    return [];
  }
};

/**
 * Get at-risk relationships for a user
 */
export const getAtRiskRelationships = async (userId: string): Promise<AtRiskContact[]> => {
  try {
    // Query for at-risk relationships
    const { data, error } = await supabase
      .from('relationship_streaks')
      .select(`
        id,
        contact_id,
        current_streak,
        grace_period_ends,
        contact_frequency_days,
        streak_status
      `)
      .eq('user_id', userId)
      .eq('streak_status', StreakStatus.AT_RISK)
      .order('grace_period_ends', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Get contact details for these relationships
    // This is simplified - you would join with your contacts table
    const atRiskContacts: AtRiskContact[] = data.map(streak => ({
      id: streak.contact_id,
      name: 'Contact Name', // Replace with actual contact lookup
      avatarUrl: null,
      currentStreak: streak.current_streak,
      gracePeriodEnds: streak.grace_period_ends,
      contactFrequencyDays: streak.contact_frequency_days
    }));
    
    return atRiskContacts;
  } catch (error) {
    console.error('Error getting at-risk relationships:', error);
    return [];
  }
};

/**
 * Helper functions
 */

// Maps database user streak to app model
const mapDbUserStreakToUserStreak = (dbStreak: any): UserStreak => ({
  id: dbStreak.id,
  userId: dbStreak.user_id,
  currentStreakDays: dbStreak.current_streak_days,
  longestStreakDays: dbStreak.longest_streak_days,
  currentMultiplier: dbStreak.current_multiplier,
  totalPoints: dbStreak.total_points,
  level: dbStreak.level,
  pointsToNextLevel: dbStreak.points_to_next_level,
  lastActivityDate: dbStreak.last_activity_date,
  createdAt: dbStreak.created_at,
  updatedAt: dbStreak.updated_at,
});

// Calculate days until streak breaks
const getDaysUntilBreak = (gracePeriodEnds: string): number => {
  const now = new Date();
  const gracePeriodDate = new Date(gracePeriodEnds);
  
  return Math.max(0, differenceInDays(gracePeriodDate, now));
};

// Create streak milestone
const createStreakMilestone = async (userId: string, streakDays: number): Promise<void> => {
  try {
    // Determine reward based on streak days
    let rewardType = 'points';
    let rewardAmount = streakDays * 10;
    
    // For major milestones, give special rewards
    if (streakDays >= 30) {
      rewardType = 'streak_freeze';
      rewardAmount = 1;
    }
    
    // Create milestone in database
    await supabase
      .from('streak_milestones')
      .insert({
        user_id: userId,
        milestone_type: `streak_${streakDays}_days`,
        streak_days: streakDays,
        reward_type: rewardType,
        reward_amount: rewardAmount,
        is_claimed: false,
      });
    
    // TODO: Trigger notification for milestone achievement
  } catch (error) {
    console.error('Error creating streak milestone:', error);
  }
};

/**
 * Check and update a specific relationship streak
 */
export const updateRelationshipStreak = async (userId: string, contactId: string, eventType: StreakEventType = StreakEventType.CONTACT_OTHER): Promise<RelationshipStreak | null> => {
  try {
    // First, check if a relationship streak exists
    const { data: existingStreak, error: fetchError } = await supabase
      .from('relationship_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contactId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
      throw fetchError;
    }
    
    const today = new Date();
    let streak: Partial<RelationshipStreak>;
    
    // If no streak exists, create a new one
    if (!existingStreak) {
      const newStreak = {
        user_id: userId,
        contact_id: contactId,
        current_streak: 1,
        longest_streak: 1,
        last_contact_date: today.toISOString(),
        streak_status: StreakStatus.ACTIVE,
        contact_frequency_days: DEFAULT_CONTACT_FREQUENCY,
        next_contact_due_date: addDays(today, DEFAULT_CONTACT_FREQUENCY).toISOString(),
        grace_period_ends: addDays(today, DEFAULT_CONTACT_FREQUENCY + DEFAULT_GRACE_PERIOD_DAYS).toISOString(),
      };
      
      const { data: createdStreak, error: createError } = await supabase
        .from('relationship_streaks')
        .insert(newStreak)
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      streak = mapDbRelationshipStreakToRelationshipStreak(createdStreak);
    } else {
      // Update existing streak
      streak = mapDbRelationshipStreakToRelationshipStreak(existingStreak);
      
      // Record the streak event
      await supabase.from('streak_events').insert({
        user_id: userId,
        contact_id: contactId,
        event_type: eventType,
        event_date: today.toISOString(),
        points_earned: calculatePointsForContactEvent(streak as RelationshipStreak, eventType),
      });
      
      // Update streak status and dates
      const lastContactDate = streak.lastContactDate ? new Date(streak.lastContactDate) : null;
      
      // Update current streak based on days since last contact
      if (lastContactDate) {
        const daysSinceLastContact = differenceInDays(today, lastContactDate);
        
        // If contact was made after a long break (more than grace period),
        // reset streak to 1, otherwise increment if it wasn't today already
        if (daysSinceLastContact > streak.contactFrequencyDays! + DEFAULT_GRACE_PERIOD_DAYS) {
          streak.currentStreak = 1;
        } else if (daysSinceLastContact >= 1) {
          // Increment streak if it's a new day
          streak.currentStreak = (streak.currentStreak || 0) + 1;
          
          // Update longest streak if needed
          if (streak.currentStreak > (streak.longestStreak || 0)) {
            streak.longestStreak = streak.currentStreak;
          }
        }
      }
      
      // Update status to active and set new dates
      streak.streakStatus = StreakStatus.ACTIVE;
      streak.lastContactDate = today.toISOString();
      streak.nextContactDueDate = addDays(today, streak.contactFrequencyDays || DEFAULT_CONTACT_FREQUENCY).toISOString();
      streak.gracePeriodEnds = addDays(today, (streak.contactFrequencyDays || DEFAULT_CONTACT_FREQUENCY) + DEFAULT_GRACE_PERIOD_DAYS).toISOString();
      
      // Update in database
      const { error: updateError } = await supabase
        .from('relationship_streaks')
        .update({
          current_streak: streak.currentStreak,
          longest_streak: streak.longestStreak,
          last_contact_date: streak.lastContactDate,
          next_contact_due_date: streak.nextContactDueDate,
          grace_period_ends: streak.gracePeriodEnds,
          streak_status: streak.streakStatus,
        })
        .eq('id', streak.id);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    // Check for streak milestones
    if (streak.currentStreak && MILESTONE_DAYS.includes(streak.currentStreak)) {
      await createRelationshipStreakMilestone(userId, contactId, streak.currentStreak);
    }
    
    return streak as RelationshipStreak;
  } catch (error) {
    console.error('Error updating relationship streak:', error);
    return null;
  }
};

/**
 * Check and update all streaks
 * This should be run daily, e.g. from a background task
 */
export const checkAndUpdateAllStreaks = async (userId: string): Promise<void> => {
  try {
    const today = new Date();
    
    // Get all active relationship streaks
    const { data: relationships, error } = await supabase
      .from('relationship_streaks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Process each relationship
    for (const relationship of relationships || []) {
      const streak = mapDbRelationshipStreakToRelationshipStreak(relationship);
      const nextContactDue = streak.nextContactDueDate ? new Date(streak.nextContactDueDate) : null;
      const gracePeriodEnds = streak.gracePeriodEnds ? new Date(streak.gracePeriodEnds) : null;
      
      // Only process if we have valid dates
      if (nextContactDue && gracePeriodEnds) {
        // If past next contact date but before grace period ends, mark as at risk
        if (isBefore(nextContactDue, today) && !isBefore(gracePeriodEnds, today)) {
          if (streak.streakStatus !== StreakStatus.AT_RISK) {
            await supabase
              .from('relationship_streaks')
              .update({ streak_status: StreakStatus.AT_RISK })
              .eq('id', streak.id);
            
            // TODO: Send notification that streak is at risk
          }
        }
        // If past grace period, mark as broken
        else if (isBefore(gracePeriodEnds, today)) {
          if (streak.streakStatus !== StreakStatus.BROKEN) {
            await supabase
              .from('relationship_streaks')
              .update({
                streak_status: StreakStatus.BROKEN,
                current_streak: 0
              })
              .eq('id', streak.id);
            
            // TODO: Send notification that streak is broken
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking and updating all streaks:', error);
  }
};

/**
 * Get suggested contacts for maintaining relationships
 */
export const getSuggestedContacts = async (userId: string, limit: number = 3): Promise<SuggestedContact[]> => {
  try {
    // Find contacts that:
    // 1. Are not broken
    // 2. Haven't been contacted recently
    // 3. Ordered by priority (closest to being at risk first)
    const { data, error } = await supabase
      .from('relationship_streaks')
      .select(`
        id,
        contact_id,
        last_contact_date,
        next_contact_due_date,
        contact_frequency_days,
        streak_status
      `)
      .eq('user_id', userId)
      .neq('streak_status', StreakStatus.BROKEN)
      .order('next_contact_due_date', { ascending: true })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    // Determine priority based on how close to due date
    const today = new Date();
    const suggestedContacts: SuggestedContact[] = data.map(streak => {
      const nextDueDate = new Date(streak.next_contact_due_date);
      const daysUntilDue = differenceInDays(nextDueDate, today);
      
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (daysUntilDue <= 1) priority = 'high';
      else if (daysUntilDue <= 3) priority = 'medium';
      else priority = 'low';
      
      // This is simplified - you would lookup contact details from your contacts table
      return {
        id: streak.contact_id,
        name: 'Contact Name', // Replace with actual contact lookup
        avatarUrl: null,
        lastContactDate: streak.last_contact_date,
        priority
      };
    });
    
    return suggestedContacts;
  } catch (error) {
    console.error('Error getting suggested contacts:', error);
    return [];
  }
};

/**
 * Get user streak statistics
 */
export const getStreakStats = async (userId: string): Promise<StreakStats | null> => {
  try {
    // Get summary from the view
    const { data, error } = await supabase
      .from('active_streaks_summary')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return {
        activeStreaks: 0,
        atRiskStreaks: 0,
        brokenStreaks: 0,
        averageStreakLength: 0,
        longestCurrentStreak: 0
      };
    }
    
    return {
      activeStreaks: data.active_streaks_count || 0,
      atRiskStreaks: data.at_risk_streaks_count || 0,
      brokenStreaks: data.broken_streaks_count || 0,
      averageStreakLength: data.avg_active_streak_length || 0,
      longestCurrentStreak: data.max_current_streak || 0
    };
  } catch (error) {
    console.error('Error getting streak stats:', error);
    return null;
  }
};

/**
 * Get streak milestones for a user
 */
export const getUserMilestones = async (userId: string, claimed: boolean = false): Promise<StreakMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('is_claimed', claimed)
      .order('achieved_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
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
    console.error('Error getting user milestones:', error);
    return [];
  }
};

/**
 * Additional helper functions
 */

// Map database relationship streak to app model
const mapDbRelationshipStreakToRelationshipStreak = (dbStreak: any): RelationshipStreak => ({
  id: dbStreak.id,
  userId: dbStreak.user_id,
  contactId: dbStreak.contact_id,
  currentStreak: dbStreak.current_streak,
  longestStreak: dbStreak.longest_streak,
  lastContactDate: dbStreak.last_contact_date,
  nextContactDueDate: dbStreak.next_contact_due_date,
  gracePeriodEnds: dbStreak.grace_period_ends,
  streakStatus: dbStreak.streak_status as StreakStatus,
  contactFrequencyDays: dbStreak.contact_frequency_days,
  createdAt: dbStreak.created_at,
  updatedAt: dbStreak.updated_at,
});

// Calculate points earned for a contact event based on streak and event type
const calculatePointsForContactEvent = (streak: RelationshipStreak, eventType: StreakEventType): number => {
  // Base points
  let points = 10;
  
  // Bonus points based on event type
  switch (eventType) {
    case StreakEventType.CONTACT_MEETING:
      points = 30; // Meetings are worth more
      break;
    case StreakEventType.CONTACT_CALL:
      points = 20; // Calls are worth more than messages
      break;
    case StreakEventType.CONTACT_MESSAGE:
      points = 15;
      break;
    default:
      points = 10;
  }
  
  // Bonus for streak maintenance
  if (streak.currentStreak >= 10) {
    points = Math.floor(points * 1.5); // 50% bonus for long streaks
  } else if (streak.currentStreak >= 5) {
    points = Math.floor(points * 1.2); // 20% bonus for medium streaks
  }
  
  return points;
};

// Create a relationship streak milestone
const createRelationshipStreakMilestone = async (userId: string, contactId: string, streakDays: number): Promise<void> => {
  try {
    // Determine reward based on streak days
    let rewardType = 'points';
    let rewardAmount = streakDays * 5;
    
    // For major milestones, give special rewards
    if (streakDays >= 30) {
      rewardType = 'streak_freeze';
      rewardAmount = 1;
    }
    
    // Create milestone in database
    await supabase
      .from('streak_milestones')
      .insert({
        user_id: userId,
        contact_id: contactId,
        milestone_type: `relationship_streak_${streakDays}_days`,
        streak_days: streakDays,
        reward_type: rewardType,
        reward_amount: rewardAmount,
        is_claimed: false,
      });
    
    // TODO: Trigger notification for relationship milestone achievement
  } catch (error) {
    console.error('Error creating relationship streak milestone:', error);
  }
}; 