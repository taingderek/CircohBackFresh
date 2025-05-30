/**
 * Quality Rating Types
 * This file contains all type definitions for the Connection Quality Rating system
 */

/**
 * Rating categories
 */
export type RatingCategory = 'thoughtfulness' | 'responsiveness' | 'empathy' | 'overall';

/**
 * Rating privacy mode
 */
export type RatingPrivacyMode = 'anonymous' | 'identified' | 'private';

/**
 * Interface for a single rating
 */
export interface Rating {
  id?: string;
  ratedUserId: string;
  raterId?: string | null; // Nullable for anonymous ratings
  rating: number; // 1-5 stars
  category: RatingCategory;
  comment?: string | null; // Optional comment
  isAnonymous: boolean;
  createdAt?: Date;
}

/**
 * Rating creation input
 */
export interface RatingInput {
  ratedUserId: string;
  ratings: {
    overall: number;
    thoughtfulness?: number;
    responsiveness?: number;
    empathy?: number;
  };
  comment?: string;
  isAnonymous: boolean;
}

/**
 * Request for feedback
 */
export interface FeedbackRequest {
  id?: string;
  userId: string;
  requestedFromIds: string[]; // Array of contact IDs
  message?: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt?: Date;
  expiresAt: Date;
}

/**
 * Feedback request input
 */
export interface FeedbackRequestInput {
  contactIds: string[];
  message?: string;
  expirationDays?: number; // Default might be 14 days
}

/**
 * Aggregated user rating
 */
export interface AggregatedRating {
  userId: string;
  overallRating: number;
  categoryRatings: {
    thoughtfulness: number;
    responsiveness: number;
    empathy: number;
  };
  totalRatings: number;
  trend: 'improving' | 'declining' | 'stable' | 'new';
  lastUpdated: Date;
}

/**
 * Rating privacy settings for a user
 */
export interface RatingPrivacySettings {
  userId: string;
  allowReceivingRatings: boolean;
  allowAnonymousRatings: boolean;
  displayRatingsOnProfile: boolean;
  minimumRatingsToShow: number; // Only show ratings when this threshold is met
  allowDetailedBreakdown: boolean; // Show category breakdowns
  showTrend: boolean;
}

/**
 * Rating privacy settings input
 */
export interface RatingPrivacySettingsInput {
  allowReceivingRatings?: boolean;
  allowAnonymousRatings?: boolean;
  displayRatingsOnProfile?: boolean;
  minimumRatingsToShow?: number;
  allowDetailedBreakdown?: boolean;
  showTrend?: boolean;
}

/**
 * Rating notification settings
 */
export interface RatingNotificationSettings {
  userId: string;
  notifyOnNewRating: boolean;
  notifyOnRatingThreshold: boolean;
  notifyOnFeedbackRequest: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Rating statistics for a user
 */
export interface RatingStatistics {
  userId: string;
  ratingsGiven: number;
  ratingsReceived: number;
  averageRatingGiven: number;
  averageRatingReceived: number;
  ratingsComparedToNetwork: 'above' | 'below' | 'average';
  isPremiumStat: boolean; // Whether this stat is only available for premium
} 