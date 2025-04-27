import { UserProfile, UserPreferences, UserSubscription, UserStats, UserLocation, TravelPreferences, GeoCoordinates } from '../types/user';

/**
 * Transforms the raw database response from Supabase to our UserProfile type
 */
export const transformUserProfile = (rawData: any): UserProfile => {
  if (!rawData) {
    throw new Error('No user data provided to transform');
  }

  // Transform the subscription data
  const subscription: UserSubscription = {
    tier: rawData.subscription?.tier || 'free',
    status: rawData.subscription?.status || 'inactive',
    startDate: rawData.subscription?.start_date ? new Date(rawData.subscription.start_date) : null,
    endDate: rawData.subscription?.end_date ? new Date(rawData.subscription.end_date) : null,
    isPremium: !!rawData.subscription?.is_premium,
    daysRemaining: rawData.subscription?.days_remaining || 0,
  };

  // Transform the stats data
  const stats: UserStats = {
    todoCount: rawData.stats?.todo_count || 0,
    completedTodoCount: rawData.stats?.completed_todo_count || 0,
    categoriesCount: rawData.stats?.categories_count || 0,
    habitsCount: rawData.stats?.habits_count || 0,
    focusSessionsCount: rawData.stats?.focus_sessions_count || 0,
    gratitudeEntriesCount: rawData.stats?.gratitude_entries_count || 0,
    moodLogsCount: rawData.stats?.mood_logs_count || 0,
    contactsCount: rawData.stats?.contacts_count || 0,
    remindersCount: rawData.stats?.reminders_count || 0,
    upcomingBirthdaysCount: rawData.stats?.upcoming_birthdays_count || 0,
    travelPlansCount: rawData.stats?.travel_plans_count || 0,
  };

  // Transform coordinates if they exist
  let coordinates: GeoCoordinates | null = null;
  if (rawData.coordinates) {
    try {
      // Parse the coordinates from the POINT format
      const pointString = rawData.coordinates.toString();
      const match = pointString.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match && match.length === 3) {
        coordinates = {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
  }

  // Transform location data
  const location: UserLocation = {
    city: rawData.location_city,
    state: rawData.location_state,
    country: rawData.location_country,
    coordinates
  };

  // Transform travel preferences
  const travelPreferencesRaw = rawData.travel_preferences || {};
  const travelPreferences: TravelPreferences = {
    reminderDaysBefore: travelPreferencesRaw.reminder_days_before || 7,
    notifyFriendsArriving: travelPreferencesRaw.notify_friends_arriving !== false, // default to true if not specified
  };

  // Transform to camelCase and proper types
  return {
    id: rawData.id,
    email: rawData.email,
    username: rawData.username,
    full_name: rawData.full_name,
    avatar_url: rawData.avatar_url,
    bio: rawData.bio,
    updated_at: rawData.updated_at,
    location,
    travelPreferences,
    preferences: rawData.preferences as UserPreferences,
    subscription,
    joinedAt: rawData.joined_at ? new Date(rawData.joined_at) : new Date(),
    lastLoginAt: rawData.last_login_at ? new Date(rawData.last_login_at) : new Date(),
    stats,
  };
};

/**
 * Transforms our frontend model to the format expected by the database
 */
export const transformProfileForUpdate = (profile: Partial<UserProfile>): Record<string, any> => {
  const dbProfile: Record<string, any> = {};
  
  // Map camelCase to snake_case for the database
  if (profile.username !== undefined) dbProfile.username = profile.username;
  if (profile.full_name !== undefined) dbProfile.full_name = profile.full_name;
  if (profile.avatar_url !== undefined) dbProfile.avatar_url = profile.avatar_url;
  if (profile.bio !== undefined) dbProfile.bio = profile.bio;
  if (profile.updated_at !== undefined) dbProfile.updated_at = profile.updated_at;
  
  // Handle location updates
  if (profile.location) {
    if (profile.location.city !== undefined) dbProfile.location_city = profile.location.city;
    if (profile.location.state !== undefined) dbProfile.location_state = profile.location.state;
    if (profile.location.country !== undefined) dbProfile.location_country = profile.location.country;
    
    // Handle coordinates (convert to PostGIS POINT format)
    if (profile.location.coordinates) {
      const { longitude, latitude } = profile.location.coordinates;
      dbProfile.coordinates = `POINT(${longitude} ${latitude})`;
    }
  }
  
  // Handle travel preferences
  if (profile.travelPreferences) {
    dbProfile.travel_preferences = {
      reminder_days_before: profile.travelPreferences.reminderDaysBefore,
      notify_friends_arriving: profile.travelPreferences.notifyFriendsArriving
    };
  }
  
  return dbProfile;
}; 