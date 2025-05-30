import { supabase } from './supabaseClient';

/**
 * Interface for user profile data
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  avatarUrl?: string | null;
  bio?: string | null;
  joinedAt: Date;
  contacts: number;
  dueReminders: number;
  completedReminders: number;
  score: {
    total: number;
    consistency: number;
    empathy: number;
    thoughtfulness: number;
  };
  isPremium: boolean;
}

/**
 * Service to handle user profile data from Supabase
 */
export const profileService = {
  /**
   * Get the current user's profile
   */
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      // Get contact count
      const { count: contactCount, error: contactError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('userId', user.id);
        
      if (contactError) {
        throw contactError;
      }
      
      // Get due reminders count
      const { count: dueCount, error: dueError } = await supabase
        .from('reminders')
        .select('id', { count: 'exact', head: true })
        .eq('userId', user.id)
        .eq('is_complete', false)
        .lte('reminder_date', new Date().toISOString());
        
      if (dueError) {
        throw dueError;
      }
      
      // Get completed reminders count
      const { count: completedCount, error: completedError } = await supabase
        .from('reminders')
        .select('id', { count: 'exact', head: true })
        .eq('userId', user.id)
        .eq('is_complete', true);
        
      if (completedError) {
        throw completedError;
      }
      
      // Get user score data
      const { data: scoreData, error: scoreError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (scoreError && scoreError.code !== 'PGRST116') { // Not found is ok
        throw scoreError;
      }
      
      // Get premium status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('is_active')
        .eq('user_id', user.id)
        .single();
        
      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // Not found is ok
        throw subscriptionError;
      }
      
      // Generate initials from name
      const fullName = profile?.full_name || user.email?.split('@')[0] || 'User';
      const initials = fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      // Build user profile object
      return {
        id: user.id,
        email: user.email || '',
        fullName,
        initials,
        avatarUrl: profile?.avatar_url || null,
        bio: profile?.bio || null,
        joinedAt: new Date(user.created_at || profile?.created_at || Date.now()),
        contacts: contactCount || 0,
        dueReminders: dueCount || 0,
        completedReminders: completedCount || 0,
        score: {
          total: scoreData?.total_score || 750,
          consistency: scoreData?.consistency_score || 65,
          empathy: scoreData?.empathy_score || 60,
          thoughtfulness: scoreData?.thoughtfulness_score || 70
        },
        isPremium: subscriptionData?.is_active || false
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile data
   */
  updateProfile: async (profileData: Partial<UserProfile>): Promise<void> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          avatar_url: profileData.avatarUrl,
          bio: profileData.bio,
          updated_at: new Date()
        })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user avatar
   */
  updateAvatar: async (filePath: string, fileBlob: Blob): Promise<string> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      // Upload file to storage
      const filename = `avatar-${user.id}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, fileBlob);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);
      
      // Update user profile with new avatar URL
      await profileService.updateProfile({
        avatarUrl: publicUrl
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }
}; 