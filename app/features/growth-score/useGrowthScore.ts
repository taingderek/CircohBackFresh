import { useDispatch, useSelector } from 'react-redux';
import { 
  addActivity, 
  addAchievement, 
  refreshStreaks, 
  resetScore,
  updateScoreBreakdown,
  initialize
} from './growthScoreSlice';
import {
  selectActivities,
  selectScoreBreakdown,
  selectLevelProgress,
  selectStreaks,
  selectIsInitialized,
  selectTotalScore,
  selectCurrentLevel,
  selectLevelTitle,
  selectLevelProgressPercentage,
  selectActivitiesByType,
  selectActivitiesByContactId,
  selectActiveStreaks
} from './selectors';
import { 
  Activity,
  ActivityType,
  ScoreBreakdown,
  Streak,
  LevelProgress,
  ScoreCategory
} from './types';
import { useCallback, useEffect, useState } from 'react';
import { RootState } from '../../core/store';

/**
 * Hook for managing the growth score feature
 */
export const useGrowthScore = () => {
  const dispatch = useDispatch();
  
  // Selectors for state
  const activities = useSelector(selectActivities);
  const scoreBreakdown = useSelector(selectScoreBreakdown);
  const levelProgress = useSelector(selectLevelProgress);
  const streaks = useSelector(selectStreaks);
  const isInitialized = useSelector(selectIsInitialized);
  const totalScore = useSelector(selectTotalScore);
  const currentLevel = useSelector(selectCurrentLevel);
  const levelTitle = useSelector(selectLevelTitle);
  const levelProgressPercentage = useSelector(selectLevelProgressPercentage);
  const activeStreaks = useSelector(selectActiveStreaks);
  
  // Flag to track if we need to refresh streaks
  const [shouldRefreshStreaks, setShouldRefreshStreaks] = useState(false);
  
  // Initialize if needed (loading from AsyncStorage handled by Redux persist)
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initialize({ 
        activities: [],
        streaks: [],
        achievements: []
      }));
    }
  }, [isInitialized, dispatch]);
  
  // Refresh streaks if flag is set and we have activities
  useEffect(() => {
    if (shouldRefreshStreaks && activities.length > 0) {
      dispatch(refreshStreaks());
      setShouldRefreshStreaks(false);
    }
  }, [shouldRefreshStreaks, activities, dispatch]);
  
  // Log an activity and add points to the growth score
  const logActivity = useCallback((
    activityType: ActivityType,
    categoryPoints: Partial<Record<ScoreCategory, number>>,
    contactId?: string
  ) => {
    // Create a complete category record with defaults
    const categories: Record<ScoreCategory, number> = {
      engagement: categoryPoints.engagement || 0,
      organization: categoryPoints.organization || 0,
      consistency: categoryPoints.consistency || 0,
      proactivity: categoryPoints.proactivity || 0
    };
    
    // Calculate total points
    const points = Object.values(categories).reduce((sum, value) => sum + value, 0);
    
    // Create the activity
    const activity: Omit<Activity, 'id'> = {
      type: activityType,
      timestamp: new Date().toISOString(),
      categories,
      contactId,
      completed: true,
      points
    };
    
    // Dispatch the action
    dispatch(addActivity(activity));
    
    // Set flag to refresh streaks
    setShouldRefreshStreaks(true);
    
    return points;
  }, [dispatch]);
  
  // Add an achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    dispatch(addAchievement(achievementId));
  }, [dispatch]);
  
  // Reset the score (for testing or user reset)
  const resetGrowthScore = useCallback(() => {
    dispatch(resetScore());
  }, [dispatch]);
  
  // Recalculate score breakdown
  const recalculateScore = useCallback(() => {
    dispatch(updateScoreBreakdown());
  }, [dispatch]);
  
  // Get activities for a specific contact
  const getContactActivities = useCallback((contactId: string) => {
    return selectActivitiesByContactId(
      useSelector((state: RootState) => state), 
      contactId
    );
  }, []);
  
  // Get activities of a specific type
  const getActivitiesByType = useCallback((type: ActivityType) => {
    return selectActivitiesByType(
      useSelector((state: RootState) => state), 
      type
    );
  }, []);
  
  // Get active streak for a specific activity type
  const getActiveStreak = useCallback((activityType: ActivityType) => {
    return streaks.find(streak => streak.activityType === activityType && streak.active);
  }, [streaks]);
  
  return {
    // State
    activities,
    scoreBreakdown,
    levelProgress,
    streaks,
    isInitialized,
    totalScore,
    currentLevel,
    levelTitle,
    levelProgressPercentage,
    activeStreaks,
    
    // Actions
    logActivity,
    unlockAchievement,
    resetGrowthScore,
    recalculateScore,
    
    // Getters
    getContactActivities,
    getActivitiesByType,
    getActiveStreak
  };
}; 