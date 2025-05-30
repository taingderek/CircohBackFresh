/**
 * Streak Storage Utilities
 * Manages local storage of streak data for offline usage and sync
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/core/services/supabaseClient';
import {
  UserStreak,
  RelationshipStreak,
  StreakEvent,
  StreakStatus
} from './types';

// Storage keys
export const STORAGE_KEYS = {
  USER_STREAK: 'circohback_user_streak',
  RELATIONSHIP_STREAKS: 'circohback_relationship_streaks',
  PENDING_EVENTS: 'circohback_pending_events',
  LAST_SYNC: 'circohback_last_sync',
  STREAK_STATS: 'circohback_streak_stats',
};

/**
 * Cache user streak locally
 */
export const cacheUserStreak = async (userStreak: UserStreak): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_STREAK, JSON.stringify(userStreak));
};

/**
 * Get cached user streak
 */
export const getCachedUserStreak = async (): Promise<UserStreak | null> => {
  try {
    const streakStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_STREAK);
    if (streakStr) {
      return JSON.parse(streakStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached user streak:', error);
    return null;
  }
};

/**
 * Cache relationship streaks locally
 */
export const cacheRelationshipStreaks = async (streaks: RelationshipStreak[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.RELATIONSHIP_STREAKS, JSON.stringify(streaks));
};

/**
 * Get cached relationship streaks
 */
export const getCachedRelationshipStreaks = async (): Promise<RelationshipStreak[]> => {
  try {
    const streaksStr = await AsyncStorage.getItem(STORAGE_KEYS.RELATIONSHIP_STREAKS);
    if (streaksStr) {
      return JSON.parse(streaksStr);
    }
    return [];
  } catch (error) {
    console.error('Error getting cached relationship streaks:', error);
    return [];
  }
};

/**
 * Queue a streak event for syncing later
 */
export const queueStreakEvent = async (event: Partial<StreakEvent>): Promise<void> => {
  try {
    const eventsStr = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_EVENTS);
    let events: Partial<StreakEvent>[] = eventsStr ? JSON.parse(eventsStr) : [];
    
    events.push(event);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Error queuing streak event:', error);
  }
};

/**
 * Sync queued streak events with the server
 */
export const syncQueuedEvents = async (): Promise<number> => {
  try {
    const eventsStr = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_EVENTS);
    if (!eventsStr) return 0;
    
    const events: Partial<StreakEvent>[] = JSON.parse(eventsStr);
    if (events.length === 0) return 0;
    
    let syncedCount = 0;
    
    // Process events in batches to avoid large requests
    const BATCH_SIZE = 10;
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      
      // Convert to database format
      const dbEvents = batch.map(event => ({
        user_id: event.userId,
        contact_id: event.contactId,
        event_type: event.eventType,
        event_date: event.eventDate,
        points_earned: event.pointsEarned || 10,
      }));
      
      // Insert batch
      const { error } = await supabase
        .from('streak_events')
        .insert(dbEvents);
      
      if (!error) {
        syncedCount += batch.length;
      } else {
        console.error('Error syncing events batch:', error);
        break;
      }
    }
    
    // Remove synced events
    if (syncedCount > 0) {
      const remainingEvents = events.slice(syncedCount);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_EVENTS, JSON.stringify(remainingEvents));
    }
    
    return syncedCount;
  } catch (error) {
    console.error('Error syncing queued events:', error);
    return 0;
  }
};

/**
 * Full sync of streak data from server
 */
export const syncStreakData = async (userId: string): Promise<boolean> => {
  try {
    // First sync any pending events
    await syncQueuedEvents();
    
    // Fetch and cache user streak
    const { data: userStreakData, error: userStreakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!userStreakError && userStreakData) {
      const userStreak: UserStreak = {
        id: userStreakData.id,
        userId: userStreakData.user_id,
        currentStreakDays: userStreakData.current_streak_days,
        longestStreakDays: userStreakData.longest_streak_days,
        currentMultiplier: userStreakData.current_multiplier,
        totalPoints: userStreakData.total_points,
        level: userStreakData.level,
        pointsToNextLevel: userStreakData.points_to_next_level,
        lastActivityDate: userStreakData.last_activity_date,
        createdAt: userStreakData.created_at,
        updatedAt: userStreakData.updated_at,
      };
      
      await cacheUserStreak(userStreak);
    }
    
    // Fetch and cache relationship streaks
    const { data: relationshipData, error: relationshipError } = await supabase
      .from('relationship_streaks')
      .select('*')
      .eq('user_id', userId);
    
    if (!relationshipError && relationshipData) {
      const relationshipStreaks: RelationshipStreak[] = relationshipData.map(streak => ({
        id: streak.id,
        userId: streak.user_id,
        contactId: streak.contact_id,
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastContactDate: streak.last_contact_date,
        nextContactDueDate: streak.next_contact_due_date,
        gracePeriodEnds: streak.grace_period_ends,
        streakStatus: streak.streak_status as StreakStatus,
        contactFrequencyDays: streak.contact_frequency_days,
        createdAt: streak.created_at,
        updatedAt: streak.updated_at,
      }));
      
      await cacheRelationshipStreaks(relationshipStreaks);
    }
    
    // Update last sync time
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error syncing streak data:', error);
    return false;
  }
};

/**
 * Check if we need to sync
 */
export const shouldSync = async (): Promise<boolean> => {
  try {
    const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!lastSyncStr) return true;
    
    const lastSync = new Date(lastSyncStr);
    const now = new Date();
    
    // If last sync was more than 1 hour ago
    return now.getTime() - lastSync.getTime() > 60 * 60 * 1000;
  } catch {
    return true;
  }
};

/**
 * Clear all streak data from local storage
 * Use when logging out
 */
export const clearStreakData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing streak data:', error);
  }
}; 