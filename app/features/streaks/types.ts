/**
 * Streak Types
 * This file contains all type definitions for the streak tracking system
 */

/**
 * Streak Feature Types
 * Contains all type definitions for the streak tracking functionality
 */

/**
 * User streak information
 */
export interface UserStreak {
  id: string;
  userId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  currentMultiplier: number;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  lastActivityDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Relationship streak information
 */
export interface RelationshipStreak {
  id: string;
  userId: string;
  contactId: string;
  currentStreak: number;
  longestStreak: number;
  lastContactDate: string | null;
  nextContactDueDate: string | null;
  gracePeriodEnds: string | null;
  streakStatus: StreakStatus;
  contactFrequencyDays: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enum for streak status
 */
export enum StreakStatus {
  ACTIVE = 'active',
  AT_RISK = 'at_risk',
  BROKEN = 'broken',
}

/**
 * Event that can affect a streak
 */
export interface StreakEvent {
  id: string;
  userId: string;
  contactId?: string;
  eventType: StreakEventType;
  eventDate: string;
  pointsEarned: number;
  createdAt: string;
}

/**
 * Types of events that can affect streaks
 */
export enum StreakEventType {
  APP_LOGIN = 'app_login',
  APP_ACTION = 'app_action',
  CONTACT_MESSAGE = 'contact_message',
  CONTACT_CALL = 'contact_call',
  CONTACT_MEETING = 'contact_meeting',
  CONTACT_OTHER = 'contact_other',
}

/**
 * Requirements for maintaining today's streak
 */
export interface StreakRequirement {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  requirementType: string;
  requiredAction?: string;
}

/**
 * Streak milestone for rewards
 */
export interface StreakMilestone {
  id: string;
  userId: string;
  contactId?: string;
  milestoneType: string;
  streakDays: number;
  rewardType?: string;
  rewardAmount?: number;
  isClaimed: boolean;
  achievedAt: string;
}

/**
 * Streak insights for analytics
 */
export interface StreakInsight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'achievement' | 'trend';
  createdAt: string;
}

/**
 * Streak recovery option
 */
export interface StreakRecoveryItem {
  id: string;
  userId: string;
  itemType: StreakRecoveryItemType;
  quantity: number;
  isPremium: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enum for streak recovery item types
 */
export enum StreakRecoveryItemType {
  STREAK_FREEZE = 'streak_freeze',
  STREAK_SAVER = 'streak_saver',
}

/**
 * At-risk relationship with additional contact info
 */
export interface AtRiskContact {
  id: string;
  name: string;
  avatarUrl: string | null;
  currentStreak: number;
  gracePeriodEnds: string;
  contactFrequencyDays: number;
}

/**
 * Suggested contact with priority
 */
export interface SuggestedContact {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastContactDate: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * User streak statistics
 */
export interface StreakStats {
  activeStreaks: number;
  atRiskStreaks: number;
  brokenStreaks: number;
  averageStreakLength: number;
  longestCurrentStreak: number;
} 