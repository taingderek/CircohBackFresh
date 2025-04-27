import { Session, User as SupabaseUser } from '@supabase/supabase-js';

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    contactReminders: boolean;
    birthdayReminders: boolean;
    travelAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  contactSettings: {
    defaultContactFrequency: string;
    birthdayReminderDays: number;
  };
}

/**
 * Travel preferences interface
 */
export interface TravelPreferences {
  reminderDaysBefore: number;
  notifyFriendsArriving: boolean;
}

/**
 * Geographic coordinates
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'premium' | 'pro';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'expired';

/**
 * User subscription information
 */
export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  isPremium: boolean;
  daysRemaining: number;
}

/**
 * User statistics across app features
 */
export interface UserStats {
  todoCount: number;
  completedTodoCount: number;
  categoriesCount: number;
  habitsCount: number;
  focusSessionsCount: number;
  gratitudeEntriesCount: number;
  moodLogsCount: number;
  contactsCount?: number;
  remindersCount?: number;
  upcomingBirthdaysCount?: number;
  travelPlansCount?: number;
}

/**
 * User location information
 */
export interface UserLocation {
  city: string | null;
  state: string | null;
  country: string | null;
  coordinates: GeoCoordinates | null;
}

/**
 * Complete user profile data
 */
export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  bio?: string | null;
  updated_at?: string | null;
  location: UserLocation;
  travelPreferences: TravelPreferences;
  preferences: UserPreferences;
  subscription: UserSubscription;
  joinedAt: Date;
  lastLoginAt: Date;
  stats: UserStats;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Basic profile update data
 */
export interface ProfileUpdateData {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  birthday?: Date | null;
  location?: Partial<UserLocation>;
  travelPreferences?: Partial<TravelPreferences>;
  preferences?: Partial<UserPreferences>;
}

/**
 * Subscription update data
 */
export interface SubscriptionUpdateData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  planId: string;
  planName: string;
  planDescription: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  features: {
    maxContacts: number;
    maxTravelPlans: number;
    aiMessagingEnabled: boolean;
    locationSharingEnabled: boolean;
    contactImportEnabled: boolean;
    customReminderFrequency: boolean;
  };
} 