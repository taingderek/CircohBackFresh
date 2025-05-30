import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addHours, addDays, isAfter, parseISO, differenceInHours, isSameDay } from 'date-fns';
import { supabase } from '../../core/services/supabaseClient';
import { RelationshipStreak, StreakStatus, StreakMilestone, AtRiskContact } from './types';
import { Platform } from 'react-native';

// Storage keys
const NOTIFICATION_PREFERENCES_KEY = 'circohback_notification_preferences';
const NOTIFICATION_HISTORY_KEY = 'circohback_notification_history';

// Notification categories
const NOTIFICATION_CATEGORIES = {
  STREAK_DAILY: 'streak_daily',
  STREAK_AT_RISK: 'streak_at_risk',
  STREAK_MILESTONE: 'streak_milestone',
  STREAK_WEEKLY_SUMMARY: 'streak_weekly_summary'
};

// Notification channels
const CHANNELS = {
  STREAK_DAILY: 'streak-daily',
  STREAK_MILESTONE: 'streak-milestone',
  AT_RISK: 'streak-at-risk',
  BROKEN: 'streak-broken',
  STREAK_SUMMARY: 'streak-summary',
};

// Storage keys for notification settings
const STORAGE_KEYS = {
  NOTIFICATION_PREFERENCES: 'circohback_notification_preferences',
  LAST_DAILY_NOTIFICATION: 'circohback_last_daily_notification',
  SENT_MILESTONE_NOTIFICATIONS: 'circohback_sent_milestone_notifications',
};

// Default notification times
const DEFAULT_NOTIFICATION_HOUR = 19; // 7 PM
const DEFAULT_SUMMARY_DAY = 1; // Monday (0 = Sunday, 1 = Monday, etc.)

// Types for notification preferences
export interface NotificationPreferences {
  userId: string;
  dailyStreakTime?: string; // Format: "HH:MM", e.g. "08:00" for 8 AM
  atRiskThreshold: number; // Hours before streak breaks to send notification (default 24)
  weeklyReportDay: number; // 0-6 for Sunday-Saturday
  weeklyReportTime?: string; // Format: "HH:MM"
  enableDailyReminders: boolean;
  enableAtRiskAlerts: boolean;
  enableMilestoneAlerts: boolean;
  enableWeeklySummary: boolean;
  quietHoursStart?: string; // Format: "HH:MM"
  quietHoursEnd?: string; // Format: "HH:MM"
}

// Type for notification history
interface NotificationHistory {
  userId: string;
  notificationId: string;
  category: string;
  title: string;
  body: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
}

/**
 * Initialize notification preferences for a user
 */
export const initializeNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  try {
    const cachedPrefs = await AsyncStorage.getItem(`${NOTIFICATION_PREFERENCES_KEY}_${userId}`);
    
    if (cachedPrefs) {
      return JSON.parse(cachedPrefs);
    }
    
    // Default preferences
    const defaultPreferences: NotificationPreferences = {
      userId,
      dailyStreakTime: '09:00',
      atRiskThreshold: 24,
      weeklyReportDay: 1, // Monday
      weeklyReportTime: '18:00', // 6 PM
      enableDailyReminders: true,
      enableAtRiskAlerts: true,
      enableMilestoneAlerts: true,
      enableWeeklySummary: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '07:00'
    };
    
    await AsyncStorage.setItem(
      `${NOTIFICATION_PREFERENCES_KEY}_${userId}`, 
      JSON.stringify(defaultPreferences)
    );
    
    return defaultPreferences;
  } catch (error) {
    console.error('Error initializing notification preferences:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  try {
    const currentPrefs = await initializeNotificationPreferences(userId);
    const updatedPrefs = { ...currentPrefs, ...preferences };
    
    await AsyncStorage.setItem(
      `${NOTIFICATION_PREFERENCES_KEY}_${userId}`, 
      JSON.stringify(updatedPrefs)
    );
    
    // Reschedule notifications based on new preferences
    await scheduleAllNotifications(userId);
    
    return updatedPrefs;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Check if current time is within quiet hours
 */
const isInQuietHours = (preferences: NotificationPreferences): boolean => {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }
  
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  // Handle case where quiet hours cross midnight
  if (preferences.quietHoursStart > preferences.quietHoursEnd) {
    return currentTime >= preferences.quietHoursStart || currentTime < preferences.quietHoursEnd;
  }
  
  return currentTime >= preferences.quietHoursStart && currentTime < preferences.quietHoursEnd;
};

/**
 * Schedule all streak-related notifications
 */
export const scheduleAllNotifications = async (userId: string): Promise<void> => {
  try {
    // Get user preferences
    const preferences = await initializeNotificationPreferences(userId);
    
    // Cancel all existing streak notifications
    await cancelAllStreakNotifications();
    
    // Schedule daily streak reminder
    if (preferences.enableDailyReminders && preferences.dailyStreakTime) {
      await scheduleDailyStreakReminder(userId, preferences);
    }
    
    // Schedule weekly streak summary
    if (preferences.enableWeeklySummary && preferences.weeklyReportTime) {
      await scheduleWeeklyStreakSummary(userId, preferences);
    }
    
    // Schedule at-risk streak notifications (handled separately through checkStreaks)
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
  }
};

/**
 * Schedule daily streak reminder notification
 */
const scheduleDailyStreakReminder = async (
  userId: string, 
  preferences: NotificationPreferences
): Promise<string> => {
  try {
    if (!preferences.dailyStreakTime) {
      return '';
    }
    
    // Parse time
    const [hours, minutes] = preferences.dailyStreakTime.split(':').map(Number);
    
    // Calculate next trigger time
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const triggerDate = new Date(
      tomorrow.getFullYear(), 
      tomorrow.getMonth(), 
      tomorrow.getDate(), 
      hours, 
      minutes
    );
    
    // Handle case where the time today is still in the future
    if (isAfter(triggerDate, addHours(now, 24))) {
      triggerDate.setDate(triggerDate.getDate() - 1);
    }
    
    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Maintain Your CircohBack Streak!',
        body: 'Don\'t forget to check in today to keep your connection streak going.',
        data: {
          type: NOTIFICATION_CATEGORIES.STREAK_DAILY,
          userId
        }
      },
      trigger: {
        date: triggerDate,
        repeats: true,
        channelId: 'streak-reminders'
      }
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily streak reminder:', error);
    return '';
  }
};

/**
 * Schedule weekly streak summary notification
 */
const scheduleWeeklyStreakSummary = async (
  userId: string, 
  preferences: NotificationPreferences
): Promise<string> => {
  try {
    if (!preferences.weeklyReportTime) {
      return '';
    }
    
    // Parse time
    const [hours, minutes] = preferences.weeklyReportTime.split(':').map(Number);
    
    // Calculate next trigger date (next occurrence of the day of week)
    const now = new Date();
    const dayDiff = (preferences.weeklyReportDay + 7 - now.getDay()) % 7;
    const nextDate = addDays(now, dayDiff || 7); // If today, schedule for next week
    
    const triggerDate = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      hours,
      minutes
    );
    
    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Weekly CircohBack Summary',
        body: 'See how your relationship streaks are doing and who needs your attention this week.',
        data: {
          type: NOTIFICATION_CATEGORIES.STREAK_WEEKLY_SUMMARY,
          userId
        }
      },
      trigger: {
        date: triggerDate,
        repeats: true,
        channelId: 'streak-summaries'
      }
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling weekly streak summary:', error);
    return '';
  }
};

/**
 * Send notification for streak milestone
 */
export const sendStreakMilestoneNotification = async (
  userId: string,
  streakDays: number,
  isUserStreak: boolean = true,
  contactName?: string
): Promise<string> => {
  try {
    // Get user preferences
    const preferences = await initializeNotificationPreferences(userId);
    
    if (!preferences.enableMilestoneAlerts) {
      return '';
    }
    
    // Check if in quiet hours
    if (isInQuietHours(preferences)) {
      console.log('Skipping milestone notification during quiet hours');
      return '';
    }
    
    // Determine milestone message
    let title = '';
    let body = '';
    
    if (isUserStreak) {
      title = `${streakDays} Day Streak Milestone!`;
      body = `Amazing! You've maintained your CircohBack streak for ${streakDays} days.`;
    } else if (contactName) {
      title = `${streakDays} Day Streak with ${contactName}!`;
      body = `You've maintained consistent contact with ${contactName} for ${streakDays} days.`;
    } else {
      return '';
    }
    
    // Send notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: NOTIFICATION_CATEGORIES.STREAK_MILESTONE,
          userId,
          streakDays,
          isUserStreak,
          contactName
        }
      },
      trigger: null // Send immediately
    });
    
    // Add to notification history
    await addNotificationToHistory(userId, {
      notificationId,
      category: NOTIFICATION_CATEGORIES.STREAK_MILESTONE,
      title,
      body,
      data: {
        streakDays,
        isUserStreak,
        contactName
      },
      timestamp: new Date().toISOString(),
      isRead: false
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error sending streak milestone notification:', error);
    return '';
  }
};

/**
 * Check streak statuses and send at-risk notifications
 */
export const checkAndNotifyAtRiskStreaks = async (userId: string): Promise<void> => {
  try {
    // Get user preferences
    const preferences = await initializeNotificationPreferences(userId);
    
    if (!preferences.enableAtRiskAlerts) {
      return;
    }
    
    // Check if in quiet hours
    if (isInQuietHours(preferences)) {
      console.log('Skipping at-risk notifications during quiet hours');
      return;
    }
    
    // Get at-risk relationship streaks that are close to breaking
    const { data: atRiskStreaks, error } = await supabase
      .from('relationship_streaks')
      .select('*, contacts:contact_id(name)')
      .eq('user_id', userId)
      .eq('streak_status', StreakStatus.AT_RISK);
      
    if (error) {
      throw new Error(`Error fetching at-risk streaks: ${error.message}`);
    }
    
    if (!atRiskStreaks || atRiskStreaks.length === 0) {
      return;
    }
    
    // Get notification history to avoid duplicate alerts
    const history = await getNotificationHistory(userId);
    
    // Check each streak and send notifications if approaching deadline
    for (const streak of atRiskStreaks) {
      if (!streak.grace_period_ends) {
        continue;
      }
      
      const graceEnds = parseISO(streak.grace_period_ends);
      const now = new Date();
      const hoursUntilBreak = differenceInHours(graceEnds, now);
      
      // Only notify if within threshold and not already notified
      if (hoursUntilBreak <= preferences.atRiskThreshold && 
          hoursUntilBreak > 0 &&
          !hasRecentNotification(history, NOTIFICATION_CATEGORIES.STREAK_AT_RISK, streak.contact_id)) {
            
        const contactName = streak.contacts?.name || 'a contact';
        const title = `Streak at Risk: ${contactName}`;
        const body = `Your ${streak.current_streak} day streak with ${contactName} will break in ${Math.round(hoursUntilBreak)} hours!`;
        
        // Send notification
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              type: NOTIFICATION_CATEGORIES.STREAK_AT_RISK,
              userId,
              contactId: streak.contact_id,
              streakDays: streak.current_streak,
              gracePeriodEnds: streak.grace_period_ends
            }
          },
          trigger: null // Send immediately
        });
        
        // Add to notification history
        await addNotificationToHistory(userId, {
          notificationId,
          category: NOTIFICATION_CATEGORIES.STREAK_AT_RISK,
          title,
          body,
          data: {
            contactId: streak.contact_id,
            streakDays: streak.current_streak,
            gracePeriodEnds: streak.grace_period_ends
          },
          timestamp: new Date().toISOString(),
          isRead: false
        });
      }
    }
  } catch (error) {
    console.error('Error checking and notifying at-risk streaks:', error);
  }
};

/**
 * Cancel all streak-related notifications
 */
export const cancelAllStreakNotifications = async (): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter for streak notifications
    const streakNotificationIds = scheduledNotifications
      .filter(notification => {
        const data = notification.content.data as any;
        return data?.type && Object.values(NOTIFICATION_CATEGORIES).includes(data.type);
      })
      .map(notification => notification.identifier);
    
    // Cancel each notification
    for (const id of streakNotificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Error cancelling streak notifications:', error);
  }
};

/**
 * Add notification to history
 */
const addNotificationToHistory = async (
  userId: string, 
  notification: Omit<NotificationHistory, 'userId'>
): Promise<void> => {
  try {
    const history = await getNotificationHistory(userId);
    
    // Add new notification
    history.push({
      userId,
      ...notification
    });
    
    // Keep only the most recent 100 notifications
    const recentHistory = history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);
    
    // Update storage
    await AsyncStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${userId}`, 
      JSON.stringify(recentHistory)
    );
  } catch (error) {
    console.error('Error adding notification to history:', error);
  }
};

/**
 * Get notification history
 */
export const getNotificationHistory = async (userId: string): Promise<NotificationHistory[]> => {
  try {
    const historyStr = await AsyncStorage.getItem(`${NOTIFICATION_HISTORY_KEY}_${userId}`);
    
    if (!historyStr) {
      return [];
    }
    
    return JSON.parse(historyStr);
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
};

/**
 * Check if there's a recent notification of a certain type for a specific contact
 */
const hasRecentNotification = (
  history: NotificationHistory[],
  category: string,
  contactId?: string,
  hoursThreshold: number = 12
): boolean => {
  const now = new Date();
  
  // Filter for notifications of the same category and contact (if specified)
  return history.some(notification => {
    if (notification.category !== category) {
      return false;
    }
    
    // If contactId is specified, check if it matches
    if (contactId && notification.data?.contactId !== contactId) {
      return false;
    }
    
    // Check if notification is recent (within threshold)
    const notificationTime = parseISO(notification.timestamp);
    const hoursDiff = differenceInHours(now, notificationTime);
    
    return hoursDiff < hoursThreshold;
  });
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    const history = await getNotificationHistory(userId);
    
    // Find and update the notification
    const updatedHistory = history.map(notification => {
      if (notification.notificationId === notificationId) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    // Update storage
    await AsyncStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${userId}`, 
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Initialize notification channels
 */
export const initializeNotifications = async (): Promise<void> => {
  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
    
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    // Create notification channels for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNELS.STREAK_DAILY, {
        name: 'Daily Streak Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#32FFA5',
      });
      
      await Notifications.setNotificationChannelAsync(CHANNELS.STREAK_MILESTONE, {
        name: 'Streak Milestones',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#BE93FD',
      });
      
      await Notifications.setNotificationChannelAsync(CHANNELS.AT_RISK, {
        name: 'At-Risk Relationships',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF93B9',
      });
      
      await Notifications.setNotificationChannelAsync(CHANNELS.BROKEN, {
        name: 'Broken Streaks',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
      
      await Notifications.setNotificationChannelAsync(CHANNELS.STREAK_SUMMARY, {
        name: 'Weekly Streak Summary',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

/**
 * Schedule notification for at-risk relationships
 */
export const scheduleAtRiskReminders = async (
  atRiskContacts: AtRiskContact[]
): Promise<number> => {
  try {
    let scheduledCount = 0;
    
    // Limit to max 3 notifications to avoid notification fatigue
    const contactsToNotify = atRiskContacts.slice(0, 3);
    
    for (const contact of contactsToNotify) {
      // Create notification ID
      const notificationId = `at-risk-${contact.id}`;
      
      // Cancel any existing notification for this contact
      await cancelScheduledNotification(notificationId);
      
      // Get the time remaining
      const gracePeriodEnds = new Date(contact.gracePeriodEnds);
      const now = new Date();
      
      // Only notify if grace period ends in the future
      if (gracePeriodEnds.getTime() > now.getTime()) {
        // Create notification content
        const daysLeft = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const title = `Streak with ${contact.name} at risk!`;
        const body = daysLeft <= 1
          ? `Your ${contact.currentStreak}-day streak will break tomorrow. Reach out now!`
          : `Your ${contact.currentStreak}-day streak will break in ${daysLeft} days. Don't lose it!`;
        
        // Schedule notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              type: 'at_risk',
              contactId: contact.id,
              contactName: contact.name,
            },
            badge: 1,
          },
          trigger: {
            date: now.getTime() + 1000, // Schedule for almost immediate delivery
            channelId: CHANNELS.AT_RISK,
          },
          identifier: notificationId,
        });
        
        scheduledCount++;
      }
    }
    
    return scheduledCount;
  } catch (error) {
    console.error('Error scheduling at-risk reminders:', error);
    return 0;
  }
};

/**
 * Send milestone achievement notification
 */
export const sendMilestoneNotification = async (
  milestone: StreakMilestone
): Promise<string | null> => {
  try {
    // Check if we've already sent a notification for this milestone
    const sentMilestonesStr = await AsyncStorage.getItem(STORAGE_KEYS.SENT_MILESTONE_NOTIFICATIONS);
    const sentMilestones = sentMilestonesStr ? JSON.parse(sentMilestonesStr) : [];
    
    if (sentMilestones.includes(milestone.id)) {
      // Already sent notification for this milestone
      return null;
    }
    
    // Format notification based on milestone type
    let title, body;
    
    if (milestone.contactId) {
      // Relationship milestone
      title = `${milestone.streakDays} Day Streak Achievement!`;
      body = `You've maintained contact with a relationship for ${milestone.streakDays} days! Keep it up!`;
    } else {
      // User streak milestone
      title = `${milestone.streakDays} Day Streak Achievement!`;
      body = `You've used CircohBack for ${milestone.streakDays} days in a row! Amazing dedication!`;
    }
    
    // Add reward info if available
    if (milestone.rewardType && milestone.rewardAmount) {
      if (milestone.rewardType === 'points') {
        body += ` You've earned ${milestone.rewardAmount} points!`;
      } else if (milestone.rewardType === 'streak_freeze') {
        body += ' You\'ve earned a Streak Freeze to use when needed!';
      }
    }
    
    // Send notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'milestone',
          milestoneId: milestone.id,
          streakDays: milestone.streakDays,
        },
        badge: 1,
      },
      trigger: null, // Send immediately
    });
    
    // Record that we've sent this notification
    sentMilestones.push(milestone.id);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SENT_MILESTONE_NOTIFICATIONS,
      JSON.stringify(sentMilestones)
    );
    
    return identifier;
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    return null;
  }
};

/**
 * Schedule weekly streak summary notification
 */
export const scheduleWeeklySummary = async (
  activeStreaks: number,
  weeklyDay = DEFAULT_SUMMARY_DAY,
  preferredHour = DEFAULT_NOTIFICATION_HOUR
): Promise<string | null> => {
  try {
    // Cancel any existing weekly summary
    await cancelScheduledNotification('weekly-streak-summary');
    
    // Calculate next occurrence of the specified day
    const now = new Date();
    const targetDay = new Date();
    
    // Set time to preferred hour
    targetDay.setHours(preferredHour, 0, 0, 0);
    
    // Find the next occurrence of the specified day of the week
    const currentDay = targetDay.getDay();
    const daysToAdd = (weeklyDay + 7 - currentDay) % 7;
    
    targetDay.setDate(targetDay.getDate() + daysToAdd);
    
    // If it's today and already past the notification time, add 7 days
    if (daysToAdd === 0 && now.getTime() > targetDay.getTime()) {
      targetDay.setDate(targetDay.getDate() + 7);
    }
    
    // Create notification content
    const title = 'Your Weekly Streak Summary';
    const body = activeStreaks > 0
      ? `You're maintaining ${activeStreaks} active relationship streaks. Check your weekly progress!`
      : 'Time to build some relationship streaks! Check your progress and get suggestions.';
    
    // Schedule notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'weekly_summary' },
        badge: 1,
      },
      trigger: {
        date: targetDay,
        channelId: CHANNELS.STREAK_SUMMARY,
      },
      identifier: 'weekly-streak-summary',
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling weekly summary:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelScheduledNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error(`Error canceling notification ${identifier}:`, error);
  }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (): Promise<{
  dailyReminders: boolean;
  atRiskAlerts: boolean;
  milestoneAlerts: boolean;
  weeklySummary: boolean;
  preferredTime: number;
  summaryDay: number;
}> => {
  try {
    const prefsStr = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
    
    if (prefsStr) {
      return JSON.parse(prefsStr);
    }
    
    // Default preferences
    return {
      dailyReminders: true,
      atRiskAlerts: true,
      milestoneAlerts: true,
      weeklySummary: true,
      preferredTime: DEFAULT_NOTIFICATION_HOUR,
      summaryDay: DEFAULT_SUMMARY_DAY,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    
    // Return defaults on error
    return {
      dailyReminders: true,
      atRiskAlerts: true,
      milestoneAlerts: true,
      weeklySummary: true,
      preferredTime: DEFAULT_NOTIFICATION_HOUR,
      summaryDay: DEFAULT_SUMMARY_DAY,
    };
  }
}; 