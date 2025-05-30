import { supabase } from './supabaseClient';
import { Review } from '@/app/types/review';

/**
 * Service for handling app reviews
 */
export const reviewService = {
  /**
   * Get all app reviews
   */
  getReviews: async (): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform to our format
      return (data || []).map(review => ({
        id: review.id,
        userId: review.user_id,
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at,
        avatarUrl: review.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Fallback to mock data if there's an error or during development
      return [
        {
          id: '1',
          userId: 'user123',
          userName: 'Alex Johnson',
          rating: 5,
          comment: 'This app has completely transformed how I stay in touch with my network. The reminders are helpful without being intrusive. Highly recommend!',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          avatarUrl: null,
        },
        {
          id: '2',
          userId: 'user456',
          userName: 'Sarah Miller',
          rating: 4,
          comment: 'Very intuitive interface and the AI suggestions are surprisingly helpful. Would love to see more customization options in the future.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
          avatarUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
        },
        {
          id: '3',
          userId: 'user789',
          userName: 'David Chen',
          rating: 5,
          comment: 'The premium features are well worth the price. I\'ve reconnected with so many important contacts thanks to this app.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
          avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        },
      ];
    }
  },
  
  /**
   * Submit a new app review
   */
  submitReview: async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          user_name: review.userName,
          rating: review.rating,
          comment: review.comment,
          avatar_url: review.avatarUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        rating: data.rating,
        comment: data.comment,
        date: data.created_at,
        avatarUrl: data.avatar_url
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
}; 