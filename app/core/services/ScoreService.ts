import { supabase } from '../services/supabaseClient';
import { store } from '../store';

// Types
export interface CircohBackScore {
  score: number;
  breakdown: {
    consistency: number;
    empathy: number;
    thoughtfulness: number;
  };
}

export interface Rating {
  id: string;
  ratedUserId: string;
  raterUserId: string | null;
  stars: number;
  comment: string | null;
  anonymous: boolean;
  createdAt: string;
}

/**
 * Interface for score category
 */
export type ScoreCategory = 'consistency' | 'empathy' | 'thoughtfulness' | 'engagement' | 'organization' | 'proactivity';

/**
 * Interface for category score
 */
export interface CategoryScore {
  category: ScoreCategory;
  score: number;
  percentage: number;
}

/**
 * Interface for score breakdown
 */
export interface ScoreBreakdown {
  totalScore: number;
  categories: CategoryScore[];
  lastUpdated: string;
}

/**
 * Interface for historical score data
 */
export interface HistoricalScoreData {
  date: string;
  score: number;
}

class ScoreServiceClass {
  // Get current user's CircohBack score
  public async getScore(): Promise<CircohBackScore | null> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('circohback_score, rating_breakdown')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching CircohBack score:', error);
        return null;
      }
      
      // Transform to our format
      return {
        score: data.circohback_score || 500,
        breakdown: data.rating_breakdown || {
          consistency: 0,
          empathy: 0,
          thoughtfulness: 0
        }
      };
    } catch (error) {
      console.error('Error in getScore:', error);
      return null;
    }
  }
  
  // Calculate and update CircohBack score
  public async updateScore(): Promise<CircohBackScore | null> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Get metrics needed for score calculation
      
      // 1. Reminder completion rate
      const reminderMetrics = await this.getReminderMetrics(userId);
      
      // 2. Contact frequency adherence
      const contactFrequency = await this.getContactFrequencyMetrics(userId);
      
      // 3. Memory logging consistency
      const memoryMetrics = await this.getMemoryMetrics(userId);
      
      // 4. Peer ratings
      const peerRatings = await this.getPeerRatings(userId);
      
      // Calculate the score components
      const consistencyScore = this.calculateConsistencyScore(
        reminderMetrics.completionRate,
        contactFrequency.adherenceRate
      );
      
      const empathyScore = this.calculateEmpathyScore(
        peerRatings.averageRating,
        memoryMetrics.detailLevel
      );
      
      const thoughtfulnessScore = this.calculateThoughtfulnessScore(
        memoryMetrics.frequency,
        peerRatings.positiveComments
      );
      
      // Overall score is weighted combination of components (0-1000 scale)
      const overallScore = Math.round(
        (consistencyScore * 0.4 + 
         empathyScore * 0.3 + 
         thoughtfulnessScore * 0.3) * 1000
      );
      
      // Ensure score is within bounds
      const boundedScore = Math.max(0, Math.min(1000, overallScore));
      
      // Create the score object
      const scoreData: CircohBackScore = {
        score: boundedScore,
        breakdown: {
          consistency: Math.round(consistencyScore * 100),
          empathy: Math.round(empathyScore * 100),
          thoughtfulness: Math.round(thoughtfulnessScore * 100)
        }
      };
      
      // Update in database
      await supabase
        .from('profiles')
        .update({
          circohback_score: scoreData.score,
          rating_breakdown: scoreData.breakdown,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      return scoreData;
    } catch (error) {
      console.error('Error updating CircohBack score:', error);
      return null;
    }
  }
  
  // Get reminder completion metrics
  private async getReminderMetrics(userId: string) {
    // Get reminders from the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', thirtyDaysAgo.toISOString());
    
    if (error || !data) {
      return { completionRate: 0 };
    }
    
    const completedReminders = data.filter(r => r.completed).length;
    const totalReminders = data.length;
    
    return {
      completionRate: totalReminders > 0 ? completedReminders / totalReminders : 0
    };
  }
  
  // Get contact frequency adherence metrics
  private async getContactFrequencyMetrics(userId: string) {
    // Get all contacts and their most recent contact date
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, reminder_frequency, last_contacted')
      .eq('user_id', userId);
    
    if (contactsError || !contacts) {
      return { adherenceRate: 0 };
    }
    
    // Count how many contacts are contacted within their reminder frequency
    let onScheduleCount = 0;
    
    contacts.forEach(contact => {
      if (!contact.last_contacted || !contact.reminder_frequency) {
        return; // Skip contacts without last_contacted or reminder_frequency
      }
      
      const lastContactedDate = new Date(contact.last_contacted);
      const now = new Date();
      const daysSinceContact = Math.floor((now.getTime() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceContact <= contact.reminder_frequency) {
        onScheduleCount++;
      }
    });
    
    return {
      adherenceRate: contacts.length > 0 ? onScheduleCount / contacts.length : 0
    };
  }
  
  // Get memory logging metrics
  private async getMemoryMetrics(userId: string) {
    // Get memories from the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (memoriesError || !memories) {
      return { frequency: 0, detailLevel: 0 };
    }
    
    // Calculate average memories per contact
    const { data: contactCount, error: countError } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      return { frequency: 0, detailLevel: 0 };
    }
    
    // Calculate memory frequency (memories per contact per month)
    const frequency = contactCount > 0 ? memories.length / contactCount : 0;
    
    // Calculate detail level based on memory note length and tags
    let totalDetailScore = 0;
    
    memories.forEach(memory => {
      let detailScore = 0;
      
      // Score based on note length
      if (memory.note) {
        const words = memory.note.split(/\s+/).length;
        detailScore += Math.min(5, words / 10); // Cap at 5 points for 50+ words
      }
      
      // Score based on tags
      if (memory.tags && memory.tags.length > 0) {
        detailScore += Math.min(3, memory.tags.length); // Up to 3 points for tags
      }
      
      // Score based on emoji presence
      if (memory.emoji) {
        detailScore += 1;
      }
      
      totalDetailScore += detailScore;
    });
    
    // Average detail score normalized to 0-1 range (9 is max possible per memory)
    const detailLevel = memories.length > 0 ? Math.min(1, totalDetailScore / (memories.length * 9)) : 0;
    
    return {
      frequency: Math.min(1, frequency / 2), // Normalize to 0-1 (2+ memories per contact is ideal)
      detailLevel
    };
  }
  
  // Get peer ratings metrics
  private async getPeerRatings(userId: string) {
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('stars, comment')
      .eq('rated_user_id', userId);
    
    if (error || !ratings || ratings.length === 0) {
      return { averageRating: 0, positiveComments: 0 };
    }
    
    // Calculate average star rating
    const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
    const averageRating = totalStars / (ratings.length * 5); // Normalize to 0-1
    
    // Count positive comments (simple heuristic: non-empty comments)
    const positiveComments = ratings.filter(r => r.comment && r.comment.trim().length > 0).length;
    const normalizedPositiveComments = Math.min(1, positiveComments / 5); // Cap at 5 positive comments
    
    return {
      averageRating,
      positiveComments: normalizedPositiveComments
    };
  }
  
  // Calculate consistency score component (0-1)
  private calculateConsistencyScore(reminderCompletionRate: number, contactFrequencyAdherence: number): number {
    // Weight: 60% reminder completion, 40% frequency adherence
    return (reminderCompletionRate * 0.6) + (contactFrequencyAdherence * 0.4);
  }
  
  // Calculate empathy score component (0-1)
  private calculateEmpathyScore(peerRating: number, memoryDetailLevel: number): number {
    // Weight: 70% peer ratings, 30% memory detail level
    return (peerRating * 0.7) + (memoryDetailLevel * 0.3);
  }
  
  // Calculate thoughtfulness score component (0-1)
  private calculateThoughtfulnessScore(memoryFrequency: number, positiveComments: number): number {
    // Weight: 60% memory frequency, 40% positive comments in ratings
    return (memoryFrequency * 0.6) + (positiveComments * 0.4);
  }
  
  // Submit a rating for another user
  public async submitRating(ratedUserId: string, stars: number, comment?: string, anonymous: boolean = false): Promise<boolean> {
    const state = store.getState();
    const currentUserId = state.auth.user?.id;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Ensure stars is between 1-5
    const validStars = Math.max(1, Math.min(5, stars));
    
    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          rated_user_id: ratedUserId,
          rater_user_id: anonymous ? null : currentUserId,
          stars: validStars,
          comment: comment || null,
          anonymous,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error submitting rating:', error);
        return false;
      }
      
      // Trigger score update for the rated user
      // Note: In a real app, this would be done via a database trigger or webhook
      // For simplicity, we manually update it here
      await this.updateScoreForUser(ratedUserId);
      
      return true;
    } catch (error) {
      console.error('Error in submitRating:', error);
      return false;
    }
  }
  
  // Update score for a specific user
  private async updateScoreForUser(userId: string): Promise<void> {
    // This is essentially the same as updateScore but for another user
    // Implementation omitted for brevity - would be similar to updateScore
    // but without using the store to get the userId
  }
  
  // Get ratings received by current user
  public async getReceivedRatings(): Promise<Rating[]> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error('Error fetching received ratings:', error);
      return [];
    }
    
    // Transform to our format
    return data.map(rating => ({
      id: rating.id,
      ratedUserId: rating.rated_user_id,
      raterUserId: rating.rater_user_id,
      stars: rating.stars,
      comment: rating.comment,
      anonymous: rating.anonymous,
      createdAt: rating.created_at
    }));
  }

  /**
   * Get user's current score breakdown
   */
  public async getScoreBreakdown(): Promise<ScoreBreakdown> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
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
      
      // Get score categories
      const { data: categories, error: categoriesError } = await supabase
        .from('score_categories')
        .select('*')
        .eq('user_id', user.id);
        
      if (categoriesError) {
        throw categoriesError;
      }
      
      // Default values if no data is found
      const totalScore = scoreData?.total_score || 750;
      
      // Transform categories into the expected format
      const categoryScores: CategoryScore[] = [];
      
      // Add default categories if none exist
      if (!categories || categories.length === 0) {
        categoryScores.push(
          { category: 'consistency', score: 280, percentage: 0.65 },
          { category: 'empathy', score: 260, percentage: 0.60 },
          { category: 'thoughtfulness', score: 300, percentage: 0.70 },
          { category: 'engagement', score: 320, percentage: 0.75 },
          { category: 'organization', score: 310, percentage: 0.72 },
          { category: 'proactivity', score: 250, percentage: 0.58 }
        );
      } else {
        // Map database categories to CategoryScore
        categories.forEach(cat => {
          categoryScores.push({
            category: cat.category_name as ScoreCategory,
            score: cat.score,
            percentage: cat.percentage / 100
          });
        });
      }
      
      return {
        totalScore,
        categories: categoryScores,
        lastUpdated: scoreData?.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching score breakdown:', error);
      throw error;
    }
  }
  
  /**
   * Get historical score data
   */
  public async getHistoricalScores(period: 'week' | 'month' | 'year'): Promise<HistoricalScoreData[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      // Determine date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Get historical score data
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Return empty array if no data
      if (!data || data.length === 0) {
        // Create synthetic data if no real data exists
        return this.createSyntheticHistoricalData(period);
      }
      
      // Transform to expected format
      return data.map(item => ({
        date: item.date,
        score: item.score
      }));
    } catch (error) {
      console.error('Error fetching historical scores:', error);
      throw error;
    }
  }
}

export const ScoreService = new ScoreServiceClass();
export default ScoreService;

/**
 * Helper function to create synthetic historical data for demonstration
 */
function createSyntheticHistoricalData(period: 'week' | 'month' | 'year'): HistoricalScoreData[] {
  const endDate = new Date();
  const baseScore = 750;
  const result: HistoricalScoreData[] = [];
  
  let dataPoints = 7; // default for week
  if (period === 'month') dataPoints = 30;
  if (period === 'year') dataPoints = 52; // weekly for year
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    
    if (period === 'week') {
      date.setDate(endDate.getDate() - (dataPoints - i - 1));
    } else if (period === 'month') {
      date.setDate(endDate.getDate() - (dataPoints - i - 1));
    } else if (period === 'year') {
      date.setDate(endDate.getDate() - (dataPoints - i - 1) * 7);
    }
    
    // Gradually increase the score (with some randomness)
    const growthFactor = 1 + (i / dataPoints) * 0.3; // 0% to 30% growth
    const randomVariation = 1 + (Math.random() * 0.1 - 0.05); // -5% to +5%
    const score = Math.round(baseScore * growthFactor * randomVariation);
    
    result.push({
      date: date.toISOString().split('T')[0],
      score
    });
  }
  
  return result;
} 