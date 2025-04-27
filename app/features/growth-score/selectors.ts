import { RootState } from '../../core/store';
import { 
  Activity,
  ActivityType,
  ScoreCategory,
  Streak,
  SCORE_CATEGORIES
} from './types';
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectGrowthScoreState = (state: RootState) => state.growthScore;
export const selectActivities = (state: RootState) => state.growthScore.activities;
export const selectStreaks = (state: RootState) => state.growthScore.streaks;
export const selectScoreBreakdown = (state: RootState) => state.growthScore.scoreBreakdown;
export const selectLevelProgress = (state: RootState) => state.growthScore.levelProgress;
export const selectAchievements = (state: RootState) => state.growthScore.achievements;
export const selectIsInitialized = (state: RootState) => state.growthScore.isInitialized;
export const selectLastUpdateTime = (state: RootState) => state.growthScore.lastUpdateTime;

// Computed selectors
export const selectTotalScore = createSelector(
  [selectScoreBreakdown],
  (scoreBreakdown) => scoreBreakdown.totalScore
);

export const selectCurrentLevel = createSelector(
  [selectLevelProgress],
  (levelProgress) => levelProgress.level
);

export const selectLevelTitle = createSelector(
  [selectLevelProgress],
  (levelProgress) => levelProgress.title
);

export const selectLevelColor = createSelector(
  [selectLevelProgress],
  (levelProgress) => levelProgress.color
);

export const selectLevelProgressPercentage = createSelector(
  [selectLevelProgress],
  (levelProgress) => levelProgress.progressPercentage
);

export const selectRemainingPointsForNextLevel = createSelector(
  [selectLevelProgress],
  (levelProgress) => levelProgress.remainingPoints
);

// Filter activities by type
export const selectActivitiesByType = createSelector(
  [selectActivities, (_: RootState, activityType: ActivityType) => activityType],
  (activities, activityType) => activities.filter((activity: Activity) => activity.type === activityType)
);

// Get active streaks
export const selectActiveStreaks = createSelector(
  [selectStreaks],
  (streaks) => streaks.filter((streak: Streak) => streak.active)
);

// Get streak by activity type
export const selectStreakByActivityType = createSelector(
  [selectStreaks, (_: RootState, activityType: ActivityType) => activityType],
  (streaks, activityType) => streaks.find((streak: Streak) => streak.activityType === activityType)
);

// Get score breakdown by category
export const selectScoreByCategoryType = createSelector(
  [selectScoreBreakdown, (_: RootState, category: ScoreCategory) => category],
  (scoreBreakdown, category) => 
    scoreBreakdown.categories.find((cat: { category: ScoreCategory }) => cat.category === category)?.score || 0
);

// Get score percentage by category
export const selectScorePercentageByCategoryType = createSelector(
  [selectScoreBreakdown, (_: RootState, category: ScoreCategory) => category],
  (scoreBreakdown, category) => 
    scoreBreakdown.categories.find((cat: { category: ScoreCategory }) => cat.category === category)?.percentage || 0
);

// Get recent activities (last N days)
export const selectRecentActivities = createSelector(
  [selectActivities, (_: RootState, days: number) => days],
  (activities, days) => {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days));
    
    return activities.filter((activity: Activity) => 
      new Date(activity.timestamp) >= cutoff
    ).sort((a: Activity, b: Activity) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
);

// Get activities by contact ID
export const selectActivitiesByContactId = createSelector(
  [selectActivities, (_: RootState, contactId: string) => contactId],
  (activities, contactId) => 
    activities.filter((activity: Activity) => activity.contactId === contactId)
);

// Get total score for a specific contact
export const selectTotalScoreByContactId = createSelector(
  [selectActivitiesByContactId],
  (activities) => activities.reduce((sum: number, activity: Activity) => sum + activity.points, 0)
);

// Get category weights
export const selectCategoryWeights = createSelector(
  [],
  () => Object.entries(SCORE_CATEGORIES).map(([category, details]) => ({
    category: category as ScoreCategory,
    weight: details.weight,
    title: details.title,
    description: details.description
  }))
);

// Get most frequent activity types
export const selectMostFrequentActivityTypes = createSelector(
  [selectActivities, (_: RootState, limit: number) => limit],
  (activities, limit) => {
    const typeCount: Record<string, number> = {};
    
    activities.forEach((activity: Activity) => {
      typeCount[activity.type] = (typeCount[activity.type] || 0) + 1;
    });
    
    return Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type]) => type as ActivityType);
  }
);

// Check if the user has achieved a specific achievement
export const selectHasAchievement = createSelector(
  [selectAchievements, (_: RootState, achievementId: string) => achievementId],
  (achievements, achievementId) => achievements.includes(achievementId)
);

// Get activities by date range
export const selectActivitiesByDateRange = createSelector(
  [selectActivities, (_: RootState, startDate: Date, endDate: Date) => ({ startDate, endDate })],
  (activities, { startDate, endDate }) => 
    activities.filter((activity: Activity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    })
); 