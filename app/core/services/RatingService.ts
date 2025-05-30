import { supabase } from './supabaseClient';

/**
 * Interface for rating data
 */
export interface Rating {
  id: string;
  overallRating: number;
  thoughtfulnessRating: number;
  responsivenessRating: number;
  empathyRating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

/**
 * Interface for submitting a new rating
 */
export interface RatingSubmission {
  userId: string;
  overallRating: number;
  thoughtfulnessRating?: number;
  responsivenessRating?: number;
  empathyRating?: number;
  comment?: string;
  isAnonymous?: boolean;
}

/**
 * Service for handling user ratings
 */
export const ratingService = {
  /**
   * Get ratings received by the current user
   */
  getReceivedRatings: async (): Promise<Rating[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater:rater_id(id, full_name, avatar_url)
        `)
        .eq('rated_user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform to our format
      return (data || []).map(rating => ({
        id: rating.id,
        overallRating: rating.overall_rating,
        thoughtfulnessRating: rating.thoughtfulness_rating || 0,
        responsivenessRating: rating.responsiveness_rating || 0,
        empathyRating: rating.empathy_rating || 0,
        comment: rating.comment || '',
        isAnonymous: rating.is_anonymous,
        createdAt: rating.created_at,
        fromUser: rating.is_anonymous ? null : {
          id: rating.rater?.id || '',
          name: rating.rater?.full_name || 'Unknown User',
          avatar: rating.rater?.avatar_url
        }
      }));
    } catch (error) {
      console.error('Error fetching received ratings:', error);
      
      // Fallback to mock data if there's an error or during development
      return [
        {
          id: '1',
          overallRating: 4,
          thoughtfulnessRating: 3,
          responsivenessRating: 5,
          empathyRating: 4,
          comment: 'Very helpful and listened to my concerns. Would recommend!',
          isAnonymous: false,
          createdAt: new Date(2023, 5, 15).toISOString(),
          fromUser: {
            id: '101',
            name: 'Alex Johnson',
            avatar: null
          }
        },
        {
          id: '2',
          overallRating: 5,
          thoughtfulnessRating: 5,
          responsivenessRating: 4,
          empathyRating: 5,
          comment: 'Excellent communication and follow-through on all commitments.',
          isAnonymous: true,
          createdAt: new Date(2023, 6, 2).toISOString(),
          fromUser: null
        }
      ];
    }
  },
  
  /**
   * Submit a new rating for a user
   */
  submitRating: async (rating: RatingSubmission): Promise<Rating> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          rated_user_id: rating.userId,
          rater_id: rating.isAnonymous ? null : user.id,
          overall_rating: rating.overallRating,
          thoughtfulness_rating: rating.thoughtfulnessRating,
          responsiveness_rating: rating.responsivenessRating,
          empathy_rating: rating.empathyRating,
          comment: rating.comment,
          is_anonymous: !!rating.isAnonymous,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          rater:rater_id(id, full_name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        overallRating: data.overall_rating,
        thoughtfulnessRating: data.thoughtfulness_rating || 0,
        responsivenessRating: data.responsiveness_rating || 0,
        empathyRating: data.empathy_rating || 0,
        comment: data.comment || '',
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
        fromUser: data.is_anonymous ? null : {
          id: data.rater?.id || '',
          name: data.rater?.full_name || 'Unknown User',
          avatar: data.rater?.avatar_url
        }
      };
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }
}; 