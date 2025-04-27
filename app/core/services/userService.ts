import { supabase } from './supabaseClient';
import { UserProfile, ProfileUpdateData, SubscriptionTier } from '../types/user';
import { transformUserProfile, transformProfileForUpdate } from '../utils/userTransformers';

/**
 * User service for handling user profile operations
 */
class UserService {
  /**
   * Get the current user's complete profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('No user found');
        return null;
      }
      
      console.log('User found:', user.id);
      
      try {
        // First try to get the profile
        console.log('Attempting to get profile from table');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          
          // If no profile found, just return a basic profile based on auth user
          if (profileError.code === 'PGRST116') {
            console.log('No profile found in database - using auth user data only');
            
            // Create a basic profile object from auth user data
            // This bypasses the need to insert into the profiles table
            const basicProfile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              avatar_url: user.user_metadata?.avatar_url || null,
              // Add minimal required fields to match what the app expects
              subscription: {
                tier: 'free',
                status: 'inactive',
                startDate: null,
                endDate: null,
                isPremium: false,
                daysRemaining: 0
              },
              joinedAt: new Date(),
              lastLoginAt: new Date()
            };
            
            console.log('Using basic profile:', basicProfile);
            return basicProfile as UserProfile;
          } else {
            // For other errors, throw
            throw profileError;
          }
        }
        
        // If we found a profile in the database
        console.log('Profile found:', profileData.id);
        return transformUserProfile(profileData);
      } catch (error) {
        console.error('Error in profile operations:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's profile
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<UserProfile | null> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // If profile doesn't exist, we can't update it
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('No profile to update - returning auth user data only');
          // Return the same data we would in getCurrentUserProfile for non-existent profiles
          return this.getCurrentUserProfile();
        }
        throw checkError;
      }
      
      // Convert ProfileUpdateData to a format suitable for the database
      const dbData = transformProfileForUpdate({
        full_name: profileData.fullName,
        avatar_url: profileData.avatarUrl,
        username: profileData.username,
        bio: profileData.bio
      });
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Return the updated profile
      return this.getCurrentUserProfile();
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }
  
  /**
   * Upgrade user to premium
   */
  async upgradeToPremium(tier: SubscriptionTier = 'premium', durationDays: number = 30): Promise<UserProfile | null> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Check if the profile exists before trying to use RPC
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Profile not found, cannot upgrade:', profileError);
        throw new Error('Profile not found. Please create a profile first before upgrading.');
      }
      
      // Call our upgrade function
      const { error } = await supabase
        .rpc('upgrade_to_premium', {
          user_id: user.id,
          tier,
          duration_days: durationDays
        });
      
      if (error) {
        console.error('Error upgrading to premium:', error);
        throw error;
      }
      
      // Return the updated profile
      return this.getCurrentUserProfile();
    } catch (error) {
      console.error('Error in upgradeToPremium:', error);
      throw error;
    }
  }
  
  /**
   * Cancel premium subscription
   */
  async cancelSubscription(): Promise<UserProfile | null> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Check if the profile exists before trying to use RPC
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Profile not found, cannot cancel subscription:', profileError);
        throw new Error('Profile not found. No subscription to cancel.');
      }
      
      // Call our cancel function
      const { error } = await supabase
        .rpc('cancel_subscription', {
          user_id: user.id
        });
      
      if (error) {
        console.error('Error canceling subscription:', error);
        throw error;
      }
      
      // Return the updated profile
      return this.getCurrentUserProfile();
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 