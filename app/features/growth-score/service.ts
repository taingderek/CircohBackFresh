/**
 * Growth Score Service
 * 
 * This service handles all growth score calculations, level determinations,
 * and provides methods for analyzing user activities to generate scores.
 */

import { 
  Level, 
  Activity, 
  ActivityType, 
  LevelProgress, 
  LEVEL_DEFINITIONS,
  ScoreCategory,
  SCORE_CATEGORIES,
  LevelRequirement,
  ScoreBreakdown,
  Streak
} from './types';

/**
 * Calculate level information based on a score
 * @param score Current score value
 * @returns Object with level, title, and progress information
 */
export function calculateLevel(score: number): LevelProgress {
  // Find the current level by checking which level's score range contains the current score
  const currentLevel = LEVEL_DEFINITIONS.find(
    level => score >= level.minScore && score <= level.maxScore
  ) || LEVEL_DEFINITIONS[0]; // Default to level 1 if not found
  
  // Get the next level if it exists, otherwise use the max level
  const nextLevelIndex = Math.min(currentLevel.level, LEVEL_DEFINITIONS.length - 1);
  const nextLevel = LEVEL_DEFINITIONS[nextLevelIndex];
  
  // Calculate progress percentage toward the next level
  const totalPointsInCurrentLevel = currentLevel.maxScore - currentLevel.minScore;
  const pointsGainedInCurrentLevel = score - currentLevel.minScore;
  const progressPercentage = Math.min(Math.floor((pointsGainedInCurrentLevel / totalPointsInCurrentLevel) * 100), 100);
  
  // Calculate remaining points needed for next level
  const remainingPoints = currentLevel.maxScore - score;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    color: currentLevel.color,
    currentScore: score,
    scoreForCurrentLevel: currentLevel.minScore,
    scoreForNextLevel: nextLevel.minScore,
    progressPercentage,
    remainingPoints: Math.max(0, remainingPoints)
  };
}

/**
 * Calculate total score from a list of activities
 * @param activities Array of user activities
 * @param streaks Optional array of active streaks
 * @returns Calculated total score and breakdown
 */
export function calculateScoreFromActivities(
  activities: Activity[], 
  streaks: Streak[] = []
): ScoreBreakdown {
  // Initialize score categories with values from constants
  const categories = [...SCORE_CATEGORIES].map(category => ({...category}));
  
  // First pass: group activities by category and calculate raw values
  activities.forEach(activity => {
    // Find which categories this activity contributes to
    for (const category of categories) {
      if (category.activities.includes(activity.type)) {
        // Apply activity value to category
        processActivityForCategory(category, activity, streaks);
      }
    }
  });
  
  // Second pass: calculate weighted score
  let totalScore = 0;
  categories.forEach(category => {
    // Apply weight to the category value
    const weightedValue = category.value * category.weight;
    totalScore += weightedValue;
  });
  
  // Round the total score to an integer
  totalScore = Math.round(totalScore);
  
  return {
    totalScore,
    categories,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get requirements to reach the next level
 * @param currentLevel User's current level
 * @returns Array of requirements needed to reach the next level
 */
export function getNextLevelRequirements(currentLevel: number): LevelRequirement[] {
  // Don't provide requirements if at max level
  if (currentLevel >= 100) {
    return [];
  }
  
  // Get the next level definition
  const nextLevelIndex = Math.min(currentLevel, LEVEL_DEFINITIONS.length - 1);
  const nextLevel = LEVEL_DEFINITIONS[nextLevelIndex];
  
  // Create custom requirements based on level
  const requirements: LevelRequirement[] = [];
  
  // Early levels: Focus on adding contacts and basic interactions
  if (currentLevel < 10) {
    requirements.push({
      description: "Add new contacts to your network",
      type: ActivityType.CONTACT_ADDED,
      count: 5,
      points: 50
    });
    requirements.push({
      description: "Complete your due reminders",
      type: ActivityType.REMINDER_COMPLETION,
      count: 3,
      points: 30
    });
  }
  // Intermediate levels: More complex interactions
  else if (currentLevel < 30) {
    requirements.push({
      description: "Log memories with your contacts",
      type: ActivityType.MEMORY_LOGGING,
      count: 5,
      points: 100
    });
    requirements.push({
      description: "Complete reminders within 24 hours",
      type: ActivityType.REMINDER_COMPLETION,
      count: 7,
      points: 120
    });
  } 
  // Advanced levels: Quality over quantity
  else if (currentLevel < 60) {
    requirements.push({
      description: "Send personalized messages",
      type: ActivityType.MESSAGE_SENT,
      count: 10,
      points: 200
    });
    requirements.push({
      description: "Update contact information",
      type: ActivityType.CONTACT_UPDATED,
      count: 5,
      points: 150
    });
    requirements.push({
      description: "Create travel plans with contacts",
      type: ActivityType.TRAVEL_PLAN_CREATED,
      count: 1,
      points: 300
    });
  }
  // Expert and legendary levels: Consistency and excellence
  else {
    requirements.push({
      description: "Maintain a 7-day streak of interactions",
      type: ActivityType.CONTACT_INTERACTION,
      count: 7,
      points: 500
    });
    requirements.push({
      description: "Log detailed memories with media",
      type: ActivityType.MEMORY_LOGGING,
      count: 10,
      points: 400
    });
    requirements.push({
      description: "Complete all reminders within 12 hours",
      type: ActivityType.REMINDER_COMPLETION,
      count: 15,
      points: 600
    });
  }
  
  return requirements;
}

/**
 * Get recommended actions to improve score
 * @param breakdown User's current score breakdown
 * @returns Array of recommended actions
 */
export function getScoreImprovementRecommendations(breakdown: ScoreBreakdown): string[] {
  const recommendations: string[] = [];
  
  // Find the lowest scoring category
  const sortedCategories = [...breakdown.categories].sort((a, b) => 
    (a.value / a.maxValue) - (b.value / b.maxValue)
  );
  
  const lowestCategory = sortedCategories[0];
  const lowestCategoryPercentage = (lowestCategory.value / lowestCategory.maxValue) * 100;
  
  // Add recommendations based on lowest category
  if (lowestCategory.id === 'contact_consistency') {
    recommendations.push("Try to interact with at least one contact each day");
    recommendations.push("Set up reminders for your most important relationships");
    recommendations.push("Review your contacts list weekly to identify those you haven't connected with recently");
  } 
  else if (lowestCategory.id === 'response_time') {
    recommendations.push("Respond to due reminders within 24 hours for maximum points");
    recommendations.push("Set aside a specific time each day to check and complete reminders");
    recommendations.push("Enable notification settings for reminders to stay on top of them");
  } 
  else if (lowestCategory.id === 'memory_logging') {
    recommendations.push("Take a moment to log memorable interactions after they happen");
    recommendations.push("Add photos to your memory logs for a more complete record");
    recommendations.push("Review your recent messages and calls to identify memories worth saving");
  } 
  else if (lowestCategory.id === 'message_personalization') {
    recommendations.push("Include specific details about your contact in messages");
    recommendations.push("Reference previous conversations or shared experiences");
    recommendations.push("Use the AI message generator but customize the output further");
  }
  
  // Add general recommendations
  recommendations.push("Complete daily connection suggestions for steady progress");
  recommendations.push("Building streaks gives you score multipliers - try not to break them!");
  
  return recommendations;
}

/**
 * Process an individual activity for a score category
 * @param category Score category to update
 * @param activity Activity to process
 * @param streaks Active streaks to consider
 */
function processActivityForCategory(
  category: ScoreCategory, 
  activity: Activity, 
  streaks: Streak[]
): void {
  let points = activity.value;
  
  // Apply streak multipliers if applicable
  const relevantStreak = streaks.find(streak => streak.type === activity.type);
  if (relevantStreak) {
    points *= relevantStreak.multiplier;
  }
  
  // Apply category-specific processing
  switch (category.id) {
    case 'contact_consistency':
      // Contact consistency is cumulative but with diminishing returns
      category.value = Math.min(category.value + points, category.maxValue);
      break;
      
    case 'response_time':
      // Response time is based on how quickly reminders are completed
      if (activity.type === ActivityType.REMINDER_COMPLETION && activity.metadata?.responseTimeMinutes) {
        const responseTime = activity.metadata.responseTimeMinutes;
        
        // Calculate response time score (higher for faster responses)
        // 0-30 mins: 100% of points
        // 30-60 mins: 90% of points
        // 1-3 hours: 80% of points
        // 3-12 hours: 60% of points
        // 12-24 hours: 40% of points
        // >24 hours: 20% of points
        if (responseTime <= 30) {
          // No reduction
        } else if (responseTime <= 60) {
          points *= 0.9;
        } else if (responseTime <= 180) {
          points *= 0.8;
        } else if (responseTime <= 720) {
          points *= 0.6;
        } else if (responseTime <= 1440) {
          points *= 0.4;
        } else {
          points *= 0.2;
        }
        
        category.value = Math.min(category.value + points, category.maxValue);
      }
      break;
      
    case 'memory_logging':
      // Memory logging is cumulative
      category.value = Math.min(category.value + points, category.maxValue);
      break;
      
    case 'message_personalization':
      // Message personalization is based on the personalization score
      if (activity.type === ActivityType.MESSAGE_SENT && activity.metadata?.personalizationScore) {
        const personalizationScore = activity.metadata.personalizationScore;
        // Scale the points based on personalization score (0-100)
        points = points * (personalizationScore / 100);
        category.value = Math.min(category.value + points, category.maxValue);
      }
      break;
      
    default:
      // Default behavior for other categories is simple addition
      category.value = Math.min(category.value + points, category.maxValue);
      break;
  }
}

/**
 * Update streak information based on a new activity
 * @param currentStreaks Current streak information
 * @param newActivity Newly completed activity
 * @returns Updated streaks array
 */
export function updateStreaks(currentStreaks: Streak[], newActivity: Activity): Streak[] {
  const updatedStreaks = [...currentStreaks];
  
  // Find or create a streak for this activity type
  let streak = updatedStreaks.find(s => s.type === newActivity.type);
  
  if (!streak) {
    // Create a new streak
    streak = {
      type: newActivity.type,
      count: 1,
      lastActivity: newActivity.timestamp,
      multiplier: 1.0
    };
    updatedStreaks.push(streak);
  } else {
    // Check if the streak is still active (within 48 hours)
    const lastActivityDate = new Date(streak.lastActivity);
    const newActivityDate = new Date(newActivity.timestamp);
    const hoursDifference = (newActivityDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDifference <= 48) {
      // Streak continues
      streak.count += 1;
      streak.lastActivity = newActivity.timestamp;
      
      // Update multiplier based on streak length
      if (streak.count >= 30) {
        streak.multiplier = 2.0; // 30+ days: 2x multiplier
      } else if (streak.count >= 14) {
        streak.multiplier = 1.5; // 14+ days: 1.5x multiplier
      } else if (streak.count >= 7) {
        streak.multiplier = 1.25; // 7+ days: 1.25x multiplier
      } else if (streak.count >= 3) {
        streak.multiplier = 1.1; // 3+ days: 1.1x multiplier
      }
    } else {
      // Streak broken, reset it
      streak.count = 1;
      streak.lastActivity = newActivity.timestamp;
      streak.multiplier = 1.0;
    }
  }
  
  return updatedStreaks;
}

/**
 * Check if streaks are still active and update accordingly
 * @param streaks Current streaks array
 * @returns Updated streaks with expired ones reset
 */
export function checkAndUpdateStreaks(streaks: Streak[]): Streak[] {
  const now = new Date();
  
  return streaks.map(streak => {
    const lastActivityDate = new Date(streak.lastActivity);
    const hoursDifference = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
    
    // If it's been more than 48 hours, reset the streak
    if (hoursDifference > 48) {
      return {
        ...streak,
        count: 0,
        multiplier: 1.0
      };
    }
    
    return streak;
  });
} 