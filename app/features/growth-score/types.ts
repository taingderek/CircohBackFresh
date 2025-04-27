/**
 * Growth Score System - Type Definitions
 * 
 * This file contains all the type definitions needed for the CircohBack
 * personal growth score system, including level definitions, scoring metrics,
 * and activity tracking types.
 */

/**
 * Level definitions
 */
export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const LEVEL_DEFINITIONS: Record<Level, { title: string, min: number, color: string }> = {
  1: { title: 'Newcomer', min: 0, color: '#BE93FD' },
  2: { title: 'Beginner', min: 100, color: '#BE93FD' },
  3: { title: 'Practitioner', min: 250, color: '#BE93FD' },
  4: { title: 'Explorer', min: 500, color: '#32FFA5' },
  5: { title: 'Adventurer', min: 1000, color: '#32FFA5' },
  6: { title: 'Networker', min: 2000, color: '#32FFA5' },
  7: { title: 'Connector', min: 3500, color: '#FF93B9' },
  8: { title: 'Influencer', min: 5000, color: '#FF93B9' },
  9: { title: 'Maestro', min: 7500, color: '#FF93B9' },
  10: { title: 'Relationship Guru', min: 10000, color: '#FF93B9' }
};

/**
 * Activity types that contribute to the growth score
 */
export type ActivityType = 
  | 'message_sent'
  | 'contact_added'
  | 'reminder_created'
  | 'reminder_completed'
  | 'note_added'
  | 'profile_updated'
  | 'birthday_added'
  | 'contact_tagged'
  | 'meeting_scheduled'
  | 'meeting_completed';

/**
 * A single tracked activity that contributes to the growth score
 */
export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  categories: Record<ScoreCategory, number>;
  contactId?: string;
  completed: boolean;
  points: number;
}

/**
 * Score category with weight and value
 */
export type ScoreCategory = 
  | 'engagement'
  | 'organization'
  | 'consistency'
  | 'proactivity';

/**
 * Score breakdown for detailed view
 */
export interface ScoreBreakdown {
  totalScore: number;
  categories: Array<{
    category: ScoreCategory;
    score: number;
    percentage: number;
  }>;
  lastUpdated: string;
}

/**
 * Level progress information
 */
export interface LevelProgress {
  level: Level;
  title: string;
  color: string;
  currentScore: number;
  scoreForCurrentLevel: number;
  scoreForNextLevel: number;
  progressPercentage: number;
  remainingPoints: number;
}

/**
 * Requirements to reach the next level
 */
export interface LevelRequirement {
  description: string;
  type: ActivityType | 'streak' | 'total_contacts';
  target: number;
  current?: number;
}

/**
 * Streak information for bonus multipliers
 */
export interface Streak {
  id: string;
  activityType: ActivityType;
  count: number;
  lastPerformed: string;
  active: boolean;
  multiplier: number;
}

/**
 * Growth score state for Redux store
 */
export interface GrowthScoreState {
  activities: Activity[];
  streaks: Streak[];
  scoreBreakdown: ScoreBreakdown;
  levelProgress: LevelProgress;
  achievements: string[];
  isInitialized: boolean;
  lastUpdateTime: string | null;
}

/**
 * Score categories with weights
 */
export const SCORE_CATEGORIES: Record<ScoreCategory, { weight: number, title: string, description: string }> = {
  engagement: {
    weight: 0.35,
    title: 'Engagement',
    description: 'How actively you interact with your contacts'
  },
  organization: {
    weight: 0.25,
    title: 'Organization',
    description: 'How well you manage and structure your network'
  },
  consistency: {
    weight: 0.25,
    title: 'Consistency',
    description: 'How regularly you maintain your relationships'
  },
  proactivity: {
    weight: 0.15,
    title: 'Proactivity',
    description: 'How often you initiate new relationships and activities'
  }
}; 