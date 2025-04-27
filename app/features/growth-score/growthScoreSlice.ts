import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { 
  GrowthScoreState, 
  Activity, 
  Streak, 
  ScoreBreakdown,
  Level,
  LevelProgress,
  LEVEL_DEFINITIONS
} from './types';

// Calculate the initial level progress
const calculateLevelProgress = (score: number): LevelProgress => {
  // Find the current level based on score
  let currentLevel: Level = 1;
  let nextLevel: Level = 2;
  
  for (let i = 10; i >= 1; i--) {
    if (score >= LEVEL_DEFINITIONS[i as Level].min) {
      currentLevel = i as Level;
      nextLevel = (i < 10 ? (i + 1) : i) as Level;
      break;
    }
  }

  const currentLevelDef = LEVEL_DEFINITIONS[currentLevel];
  const nextLevelDef = LEVEL_DEFINITIONS[nextLevel];
  const scoreForCurrentLevel = currentLevelDef.min;
  const scoreForNextLevel = nextLevelDef?.min || Infinity;
  
  const progressPoints = score - scoreForCurrentLevel;
  const totalPointsNeeded = scoreForNextLevel - scoreForCurrentLevel;
  const progressPercentage = Math.min(100, Math.max(0, (progressPoints / totalPointsNeeded) * 100));
  
  return {
    level: currentLevel,
    title: currentLevelDef.title,
    color: currentLevelDef.color,
    currentScore: score,
    scoreForCurrentLevel,
    scoreForNextLevel,
    progressPercentage,
    remainingPoints: scoreForNextLevel - score
  };
};

// Initial state
const initialState: GrowthScoreState = {
  activities: [],
  streaks: [],
  scoreBreakdown: {
    totalScore: 0,
    categories: [],
    lastUpdated: new Date().toISOString()
  },
  levelProgress: calculateLevelProgress(0),
  achievements: [],
  isInitialized: false,
  lastUpdateTime: null
};

// Helper function to calculate score breakdown
const calculateScoreBreakdown = (activities: Activity[]): ScoreBreakdown => {
  // Calculate total points from activities
  const totalScore = activities.reduce((sum, activity) => sum + activity.points, 0);
  
  // Initialize category scores
  const categoryScores: Record<string, number> = {
    engagement: 0,
    organization: 0,
    consistency: 0,
    proactivity: 0
  };
  
  // Calculate scores by category
  activities.forEach(activity => {
    Object.entries(activity.categories).forEach(([category, points]) => {
      categoryScores[category] = (categoryScores[category] || 0) + points;
    });
  });
  
  // Create breakdown with percentages
  const categories = Object.entries(categoryScores).map(([category, score]) => ({
    category: category as any,
    score,
    percentage: totalScore > 0 ? (score / totalScore) * 100 : 0
  }));
  
  return {
    totalScore,
    categories,
    lastUpdated: new Date().toISOString()
  };
};

// The growth score slice
const growthScoreSlice = createSlice({
  name: 'growthScore',
  initialState,
  reducers: {
    // Initialize with data (e.g., from storage)
    initialize: (state, action: PayloadAction<{
      activities: Activity[],
      streaks: Streak[],
      achievements: string[]
    }>) => {
      const { activities, streaks, achievements } = action.payload;
      state.activities = activities;
      state.streaks = streaks;
      state.achievements = achievements;
      state.scoreBreakdown = calculateScoreBreakdown(activities);
      state.levelProgress = calculateLevelProgress(state.scoreBreakdown.totalScore);
      state.isInitialized = true;
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Add a single activity
    addActivity: (state, action: PayloadAction<Omit<Activity, 'id'>>) => {
      const newActivity = {
        ...action.payload,
        id: uuidv4()
      };
      
      state.activities.push(newActivity);
      state.scoreBreakdown = calculateScoreBreakdown(state.activities);
      state.levelProgress = calculateLevelProgress(state.scoreBreakdown.totalScore);
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Add multiple activities at once
    addActivities: (state, action: PayloadAction<Omit<Activity, 'id'>[]>) => {
      const newActivities = action.payload.map(activity => ({
        ...activity,
        id: uuidv4()
      }));
      
      state.activities = [...state.activities, ...newActivities];
      state.scoreBreakdown = calculateScoreBreakdown(state.activities);
      state.levelProgress = calculateLevelProgress(state.scoreBreakdown.totalScore);
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Refresh streaks based on activities
    refreshStreaks: (state) => {
      const activityTypes = new Set(state.activities.map(a => a.type));
      const now = new Date();
      
      // Process existing streaks
      state.streaks = state.streaks.map(streak => {
        const lastPerformedDate = new Date(streak.lastPerformed);
        const daysSinceLastActivity = Math.floor((now.getTime() - lastPerformedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // If more than 2 days have passed, reset the streak
        if (daysSinceLastActivity > 2) {
          return {
            ...streak,
            count: 0,
            active: false,
            multiplier: 1.0
          };
        }
        
        return streak;
      });
      
      // Find activities from the last 24 hours
      const recentActivities = state.activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const hoursSince = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
        return hoursSince <= 24;
      });
      
      // Group by activity type
      const activityTypeMap: Record<string, Activity[]> = {};
      recentActivities.forEach(activity => {
        if (!activityTypeMap[activity.type]) {
          activityTypeMap[activity.type] = [];
        }
        activityTypeMap[activity.type].push(activity);
      });
      
      // Update streaks
      Object.entries(activityTypeMap).forEach(([type, activities]) => {
        if (activities.length > 0) {
          // Find existing streak or create a new one
          let streak = state.streaks.find(s => s.activityType === type);
          
          if (streak) {
            // Update existing streak
            streak.count += 1;
            streak.lastPerformed = new Date().toISOString();
            streak.active = true;
            // Increase multiplier with cap
            streak.multiplier = Math.min(2.0, 1.0 + (streak.count * 0.05));
          } else {
            // Create new streak
            const newStreak: Streak = {
              id: uuidv4(),
              activityType: type as any,
              count: 1,
              lastPerformed: new Date().toISOString(),
              active: true,
              multiplier: 1.0
            };
            state.streaks.push(newStreak);
          }
        }
      });
      
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Reset growth score (for testing or user reset)
    resetScore: (state) => {
      state.activities = [];
      state.streaks = [];
      state.scoreBreakdown = {
        totalScore: 0,
        categories: [],
        lastUpdated: new Date().toISOString()
      };
      state.levelProgress = calculateLevelProgress(0);
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Add a new achievement
    addAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
        state.lastUpdateTime = new Date().toISOString();
      }
    },
    
    // Update score breakdown manually 
    updateScoreBreakdown: (state) => {
      state.scoreBreakdown = calculateScoreBreakdown(state.activities);
      state.levelProgress = calculateLevelProgress(state.scoreBreakdown.totalScore);
      state.lastUpdateTime = new Date().toISOString();
    },
    
    // Set streaks directly
    setStreaks: (state, action: PayloadAction<Streak[]>) => {
      state.streaks = action.payload;
      state.lastUpdateTime = new Date().toISOString();
    }
  }
});

// Export actions and reducer
export const { 
  initialize,
  addActivity,
  addActivities,
  refreshStreaks,
  resetScore,
  addAchievement,
  updateScoreBreakdown,
  setStreaks
} = growthScoreSlice.actions;

export default growthScoreSlice.reducer; 