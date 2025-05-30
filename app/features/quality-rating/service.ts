import { supabase } from '@/app/core/services/supabaseClient';
import { 
  Rating, 
  RatingInput, 
  FeedbackRequest, 
  FeedbackRequestInput,
  AggregatedRating,
  RatingPrivacySettings, 
  RatingPrivacySettingsInput,
  RatingStatistics 
} from './types';
import { userService } from '@/app/core/services/userService';

/**
 * Request feedback from contacts
 * @param input The feedback request input
 */
export const requestFeedback = async (input: FeedbackRequestInput): Promise<string> => {
  try {
    // Check if contacts exist and user has permissions
    const user = await userService.getCurrentUserProfile();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Calculate expiration date (default to 14 days if not specified)
    const expirationDays = input.expirationDays || 14;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    // Create feedback request in database
    const { data, error } = await supabase
      .from('feedback_requests')
      .insert({
        user_id: user.id,
        requested_from_ids: input.contactIds,
        message: input.message || 'I would appreciate your feedback on our interactions.',
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    // Check rate limits for free users
    if (!user.subscription.isPremium) {
      // Get requests in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error: countError } = await supabase
        .from('feedback_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (countError) throw countError;
      
      // Free tier limits: 3 requests per month
      if (count && count > 3) {
        throw new Error('Free tier limit reached: Upgrade to premium for unlimited feedback requests');
      }
    }
    
    return data.id;
  } catch (error) {
    console.error('Error requesting feedback:', error);
    throw error;
  }
};

/**
 * Submit a rating for a user
 * @param input The rating input
 */
export const submitRating = async (input: RatingInput): Promise<void> => {
  try {
    const user = await userService.getCurrentUserProfile();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the rated user allows ratings
    const { data: privacySettings, error: privacyError } = await supabase
      .from('rating_privacy_settings')
      .select('*')
      .eq('user_id', input.ratedUserId)
      .single();
    
    if (privacyError) throw privacyError;
    
    if (privacySettings && !privacySettings.allow_receiving_ratings) {
      throw new Error('This user has disabled receiving ratings');
    }
    
    // If anonymous rating is not allowed by the user
    if (input.isAnonymous && privacySettings && !privacySettings.allow_anonymous_ratings) {
      throw new Error('This user does not accept anonymous ratings');
    }

    // Prepare individual ratings for each category
    const ratingEntries: Partial<Rating>[] = [];
    
    // Always include overall rating
    ratingEntries.push({
      ratedUserId: input.ratedUserId,
      raterId: input.isAnonymous ? null : user.id,
      rating: input.ratings.overall,
      category: 'overall',
      comment: input.comment || null,
      isAnonymous: input.isAnonymous,
    });
    
    // Add category ratings if provided
    if (input.ratings.thoughtfulness) {
      ratingEntries.push({
        ratedUserId: input.ratedUserId,
        raterId: input.isAnonymous ? null : user.id,
        rating: input.ratings.thoughtfulness,
        category: 'thoughtfulness',
        isAnonymous: input.isAnonymous,
      });
    }
    
    if (input.ratings.responsiveness) {
      ratingEntries.push({
        ratedUserId: input.ratedUserId,
        raterId: input.isAnonymous ? null : user.id,
        rating: input.ratings.responsiveness,
        category: 'responsiveness',
        isAnonymous: input.isAnonymous,
      });
    }
    
    if (input.ratings.empathy) {
      ratingEntries.push({
        ratedUserId: input.ratedUserId,
        raterId: input.isAnonymous ? null : user.id,
        rating: input.ratings.empathy,
        category: 'empathy',
        isAnonymous: input.isAnonymous,
      });
    }
    
    // Insert all ratings into the database
    const { error } = await supabase
      .from('ratings')
      .insert(ratingEntries.map(entry => ({
        rated_user_id: entry.ratedUserId,
        rater_id: entry.raterId,
        rating: entry.rating,
        category: entry.category,
        comment: entry.comment,
        is_anonymous: entry.isAnonymous,
      })));
    
    if (error) throw error;
    
    // After submitting rating, update aggregated ratings
    await updateAggregatedRatings(input.ratedUserId);
    
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

/**
 * Get aggregated ratings for a user
 * @param userId The user ID to get ratings for
 */
export const getAggregatedRatings = async (userId: string): Promise<AggregatedRating | null> => {
  try {
    // Check if the user exists and allows ratings to be viewed
    const { data: privacySettings, error: privacyError } = await supabase
      .from('rating_privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (privacyError) {
      // If no settings exist, create default settings
      if (privacyError.code === 'PGRST116') {
        return null;
      }
      throw privacyError;
    }
    
    if (!privacySettings.display_ratings_on_profile) {
      return null;
    }
    
    // Get the aggregated ratings from the aggregated_ratings table
    const { data, error } = await supabase
      .from('aggregated_ratings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    // Check minimum threshold
    if (data.total_ratings < privacySettings.minimum_ratings_to_show) {
      return null;
    }
    
    // Format the response
    const aggregatedRating: AggregatedRating = {
      userId: data.user_id,
      overallRating: data.overall_rating,
      categoryRatings: {
        thoughtfulness: data.thoughtfulness_rating,
        responsiveness: data.responsiveness_rating,
        empathy: data.empathy_rating,
      },
      totalRatings: data.total_ratings,
      trend: data.trend,
      lastUpdated: new Date(data.last_updated),
    };
    
    return aggregatedRating;
  } catch (error) {
    console.error('Error getting aggregated ratings:', error);
    throw error;
  }
};

/**
 * Update the user's aggregated ratings
 * @param userId The user ID to update ratings for
 */
const updateAggregatedRatings = async (userId: string): Promise<void> => {
  try {
    // Calculate average ratings for each category
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('category, rating')
      .eq('rated_user_id', userId);
    
    if (error) throw error;
    
    if (!ratings || ratings.length === 0) return;
    
    // Group ratings by category and calculate averages
    const ratingsByCategory = ratings.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = [];
      }
      acc[curr.category].push(curr.rating);
      return acc;
    }, {} as Record<string, number[]>);
    
    // Calculate averages
    const overallRatings = ratingsByCategory['overall'] || [];
    const thoughtfulnessRatings = ratingsByCategory['thoughtfulness'] || [];
    const responsivenessRatings = ratingsByCategory['responsiveness'] || [];
    const empathyRatings = ratingsByCategory['empathy'] || [];
    
    const calculateAverage = (arr: number[]) => {
      if (arr.length === 0) return 0;
      return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    };
    
    const totalRatings = overallRatings.length;
    const overallRating = calculateAverage(overallRatings);
    const thoughtfulnessRating = calculateAverage(thoughtfulnessRatings);
    const responsivenessRating = calculateAverage(responsivenessRatings);
    const empathyRating = calculateAverage(empathyRatings);
    
    // Determine trend based on recent ratings vs. older ones
    // For simplicity, compare last 3 ratings with previous ones
    let trend: 'improving' | 'declining' | 'stable' | 'new' = 'stable';
    
    if (totalRatings <= 3) {
      trend = 'new';
    } else {
      const recentRatings = overallRatings.slice(-3);
      const olderRatings = overallRatings.slice(0, -3);
      
      const recentAvg = calculateAverage(recentRatings);
      const olderAvg = calculateAverage(olderRatings);
      
      if (recentAvg > olderAvg + 0.5) {
        trend = 'improving';
      } else if (recentAvg < olderAvg - 0.5) {
        trend = 'declining';
      }
    }
    
    // Upsert the aggregated ratings
    const { error: upsertError } = await supabase
      .from('aggregated_ratings')
      .upsert({
        user_id: userId,
        overall_rating: overallRating,
        thoughtfulness_rating: thoughtfulnessRating,
        responsiveness_rating: responsivenessRating,
        empathy_rating: empathyRating,
        total_ratings: totalRatings,
        trend: trend,
        last_updated: new Date().toISOString(),
      });
    
    if (upsertError) throw upsertError;
    
  } catch (error) {
    console.error('Error updating aggregated ratings:', error);
    throw error;
  }
};

/**
 * Get user's rating privacy settings
 * @param userId The user ID to get settings for
 */
export const getRatingPrivacySettings = async (userId: string): Promise<RatingPrivacySettings> => {
  try {
    const { data, error } = await supabase
      .from('rating_privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          userId,
          allowReceivingRatings: true,
          allowAnonymousRatings: true,
          displayRatingsOnProfile: true,
          minimumRatingsToShow: 3,
          allowDetailedBreakdown: true,
          showTrend: true,
        };
      }
      throw error;
    }
    
    return {
      userId: data.user_id,
      allowReceivingRatings: data.allow_receiving_ratings,
      allowAnonymousRatings: data.allow_anonymous_ratings,
      displayRatingsOnProfile: data.display_ratings_on_profile,
      minimumRatingsToShow: data.minimum_ratings_to_show,
      allowDetailedBreakdown: data.allow_detailed_breakdown,
      showTrend: data.show_trend,
    };
  } catch (error) {
    console.error('Error getting rating privacy settings:', error);
    throw error;
  }
};

/**
 * Update user's rating privacy settings
 * @param userId The user ID to update settings for
 * @param settings The settings to update
 */
export const updateRatingPrivacySettings = async (
  userId: string, 
  settings: RatingPrivacySettingsInput
): Promise<void> => {
  try {
    const updateData: Record<string, any> = {
      user_id: userId,
    };
    
    if (settings.allowReceivingRatings !== undefined) {
      updateData.allow_receiving_ratings = settings.allowReceivingRatings;
    }
    
    if (settings.allowAnonymousRatings !== undefined) {
      updateData.allow_anonymous_ratings = settings.allowAnonymousRatings;
    }
    
    if (settings.displayRatingsOnProfile !== undefined) {
      updateData.display_ratings_on_profile = settings.displayRatingsOnProfile;
    }
    
    if (settings.minimumRatingsToShow !== undefined) {
      updateData.minimum_ratings_to_show = settings.minimumRatingsToShow;
    }
    
    if (settings.allowDetailedBreakdown !== undefined) {
      updateData.allow_detailed_breakdown = settings.allowDetailedBreakdown;
    }
    
    if (settings.showTrend !== undefined) {
      updateData.show_trend = settings.showTrend;
    }
    
    const { error } = await supabase
      .from('rating_privacy_settings')
      .upsert(updateData);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating rating privacy settings:', error);
    throw error;
  }
};

/**
 * Get user's rating statistics
 * Only available for premium users
 * @param userId The user ID to get statistics for
 */
export const getRatingStatistics = async (userId: string): Promise<RatingStatistics | null> => {
  try {
    const user = await userService.getCurrentUserProfile();
    
    // Only premium users can access detailed statistics
    if (!user?.subscription.isPremium) {
      return null;
    }
    
    // Get ratings given by the user
    const { data: ratingsGiven, error: givenError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rater_id', userId)
      .eq('category', 'overall');
    
    if (givenError) throw givenError;
    
    // Get ratings received by the user
    const { data: ratingsReceived, error: receivedError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', userId)
      .eq('category', 'overall');
    
    if (receivedError) throw receivedError;
    
    // Calculate averages
    const averageRatingGiven = ratingsGiven.length > 0
      ? ratingsGiven.reduce((sum, item) => sum + item.rating, 0) / ratingsGiven.length
      : 0;
    
    const averageRatingReceived = ratingsReceived.length > 0
      ? ratingsReceived.reduce((sum, item) => sum + item.rating, 0) / ratingsReceived.length
      : 0;
    
    // Get network average for comparison (premium feature)
    const { data: networkData, error: networkError } = await supabase
      .rpc('get_network_rating_average');
    
    if (networkError) throw networkError;
    
    let ratingsComparedToNetwork: 'above' | 'below' | 'average' = 'average';
    
    if (networkData && networkData.average) {
      if (averageRatingReceived > networkData.average + 0.5) {
        ratingsComparedToNetwork = 'above';
      } else if (averageRatingReceived < networkData.average - 0.5) {
        ratingsComparedToNetwork = 'below';
      }
    }
    
    return {
      userId,
      ratingsGiven: ratingsGiven.length,
      ratingsReceived: ratingsReceived.length,
      averageRatingGiven,
      averageRatingReceived,
      ratingsComparedToNetwork,
      isPremiumStat: true,
    };
  } catch (error) {
    console.error('Error getting rating statistics:', error);
    throw error;
  }
}; 