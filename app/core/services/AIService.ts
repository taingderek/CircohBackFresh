import { supabase } from './supabaseClient';
import { storageService } from './StorageService';
import { store } from '../store';

// Types
export type MessageTone = 'casual' | 'caring' | 'celebratory' | 'empathetic' | 'romantic' | 'professional' | 'custom';

export interface MessageQuota {
  id: string;
  userId: string;
  weeklyQuota: number;
  usedThisWeek: number;
  resetDate: string;
}

export interface MessageGenerationParams {
  contactId: string;
  contactName: string;
  lastContacted?: string;
  notes?: string;
  tone: MessageTone;
  customPrompt?: string;
}

export interface MessageResult {
  message: string;
  success: boolean;
  quotaRemaining: number;
}

// Ensure we have a type for the user with subscription
interface UserWithSubscription {
  id: string;
  subscription: string;
  [key: string]: any; // Allow other properties
}

class AIServiceClass {
  private API_URL = 'https://api.openai.com/v1/chat/completions';
  private API_KEY = process.env.OPENAI_API_KEY || '';
  private QUOTA_STORAGE_KEY = 'circohback_message_quota';
  
  // Check if a tone is available based on subscription status
  public isToneAvailable(tone: MessageTone): boolean {
    const state = store.getState();
    // Get subscription status from the subscription slice instead of user
    const isPremium = state.subscription?.isPremium || false;
    
    // Free tones available to all users
    const freeTones: MessageTone[] = ['casual', 'caring'];
    
    // Premium tones only available to paid subscribers
    const premiumTones: MessageTone[] = ['celebratory', 'empathetic', 'romantic', 'professional', 'custom'];
    
    if (freeTones.includes(tone)) {
      return true;
    }
    
    return premiumTones.includes(tone) && isPremium;
  }
  
  // Check if user has available message quota
  public async hasAvailableQuota(): Promise<boolean> {
    const quota = await this.getUserQuota();
    return quota.usedThisWeek < quota.weeklyQuota;
  }
  
  // Get current user's message quota
  public async getUserQuota(): Promise<MessageQuota> {
    try {
      // Try to get from local storage using StorageService
      const storedQuota = await storageService.getMessageQuota<MessageQuota>();
      
      if (storedQuota) {
        // Check if we need to reset the quota (weekly)
        const resetDate = new Date(storedQuota.resetDate);
        const now = new Date();
        
        if (now > resetDate) {
          // Reset the quota since it's past the reset date
          const newResetDate = new Date();
          newResetDate.setDate(newResetDate.getDate() + 7); // Set next reset 7 days from now
          
          const updatedQuota: MessageQuota = {
            ...storedQuota,
            usedThisWeek: 0,
            resetDate: newResetDate.toISOString()
          };
          
          // Update local storage and Supabase
          await this.updateQuotaStorage(updatedQuota);
          return updatedQuota;
        }
        
        return storedQuota;
      }
    } catch (error) {
      console.warn('Error reading quota from storage:', error);
      // If there's an error, proceed to fetch from Supabase
    }
    
    // If not in local storage or there was an error, fetch from Supabase
    return this.fetchQuotaFromSupabase();
  }
  
  // Fetch quota from Supabase
  private async fetchQuotaFromSupabase(): Promise<MessageQuota> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('message_quotas')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      // Create a new quota if none exists
      return this.createInitialQuota(userId);
    }
    
    // Transform the data to match our interface
    const quota: MessageQuota = {
      id: data.id,
      userId: data.user_id,
      weeklyQuota: data.weekly_quota,
      usedThisWeek: data.used_this_week,
      resetDate: data.reset_date
    };
    
    // Store in storage for faster access
    await this.updateQuotaStorage(quota);
    
    return quota;
  }
  
  // Create initial quota for new user
  private async createInitialQuota(userId: string): Promise<MessageQuota> {
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 7); // 7 days from now
    
    const newQuota: MessageQuota = {
      id: '', // Will be assigned by Supabase
      userId,
      weeklyQuota: 5, // Free tier default
      usedThisWeek: 0,
      resetDate: resetDate.toISOString()
    };
    
    const { data, error } = await supabase
      .from('message_quotas')
      .insert({
        user_id: userId,
        weekly_quota: newQuota.weeklyQuota,
        used_this_week: newQuota.usedThisWeek,
        reset_date: newQuota.resetDate
      })
      .select('*')
      .single();
    
    if (error || !data) {
      console.error('Failed to create message quota:', error);
      // Return the default quota anyway even if save failed
      return newQuota;
    }
    
    // Update with the actual ID from Supabase
    newQuota.id = data.id;
    
    // Store in storage
    await this.updateQuotaStorage(newQuota);
    
    return newQuota;
  }
  
  // Update quota in both storage and Supabase
  private async updateQuotaStorage(quota: MessageQuota): Promise<void> {
    try {
      // Update local storage
      await storageService.setMessageQuota(quota);
    } catch (error) {
      console.warn('Error updating quota in storage:', error);
      // Continue with Supabase update even if storage update fails
    }
    
    try {
      // Update Supabase
      await supabase
        .from('message_quotas')
        .update({
          weekly_quota: quota.weeklyQuota,
          used_this_week: quota.usedThisWeek,
          reset_date: quota.resetDate
        })
        .eq('id', quota.id);
    } catch (error) {
      console.error('Error updating quota in Supabase:', error);
    }
  }
  
  // Generate a message using AI
  public async generateMessage(params: MessageGenerationParams): Promise<MessageResult> {
    // Check if tone is available for user's subscription
    if (!this.isToneAvailable(params.tone)) {
      return {
        message: 'This message tone is only available for premium subscribers.',
        success: false,
        quotaRemaining: 0
      };
    }
    
    // Check quota
    const quota = await this.getUserQuota();
    if (quota.usedThisWeek >= quota.weeklyQuota) {
      return {
        message: 'You have used all your message quota for this week.',
        success: false,
        quotaRemaining: 0
      };
    }
    
    try {
      // Create prompt based on parameters
      const prompt = this.createPrompt(params);
      
      // Call AI API
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that helps people maintain their relationships by suggesting thoughtful messages.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate message');
      }
      
      // Extract message text from response
      const messageText = data.choices[0].message.content;
      
      // Update quota usage
      quota.usedThisWeek += 1;
      await this.updateQuotaStorage(quota);
      
      return {
        message: messageText,
        success: true,
        quotaRemaining: quota.weeklyQuota - quota.usedThisWeek
      };
    } catch (error) {
      console.error('AI message generation error:', error);
      
      // Return fallback message if API call fails
      return {
        message: this.getFallbackMessage(params),
        success: true,
        quotaRemaining: quota.weeklyQuota - quota.usedThisWeek
      };
    }
  }
  
  // Create AI prompt based on message parameters
  private createPrompt({ contactName, lastContacted, notes, tone, customPrompt }: MessageGenerationParams): string {
    if (tone === 'custom' && customPrompt) {
      return `Generate a message for ${contactName}. ${customPrompt}`;
    }
    
    const lastContactedText = lastContacted 
      ? `You last contacted them on ${new Date(lastContacted).toLocaleDateString()}.` 
      : '';
    
    const notesText = notes 
      ? `Information about your relationship: ${notes}` 
      : '';
    
    let toneInstruction = '';
    
    switch (tone) {
      case 'casual':
        toneInstruction = 'The message should be casual and friendly.';
        break;
      case 'caring':
        toneInstruction = 'The message should show that you care about their wellbeing.';
        break;
      case 'celebratory':
        toneInstruction = 'The message should be celebratory and enthusiastic.';
        break;
      case 'empathetic':
        toneInstruction = 'The message should be empathetic and understanding.';
        break;
      case 'romantic':
        toneInstruction = 'The message should be romantic and affectionate.';
        break;
      case 'professional':
        toneInstruction = 'The message should be professional and respectful.';
        break;
    }
    
    return `Generate a thoughtful message to reach out to ${contactName}. ${lastContactedText} ${notesText} ${toneInstruction} Keep it concise (2-3 sentences) and genuine.`;
  }
  
  // Get fallback message if AI generation fails
  private getFallbackMessage({ contactName, tone }: MessageGenerationParams): string {
    const templates = {
      casual: `Hey ${contactName}! Just wanted to check in and see how you're doing. Would love to catch up soon!`,
      caring: `Hi ${contactName}, I've been thinking about you lately and wanted to check in. Hope you're doing well!`,
      celebratory: `Hey ${contactName}! Just wanted to send some good vibes your way today. You're awesome!`,
      empathetic: `Hi ${contactName}, I know things have been challenging lately. Just wanted you to know I'm thinking of you.`,
      romantic: `Hey ${contactName}, just wanted to let you know you're on my mind today. Missing your smile!`,
      professional: `Hello ${contactName}, I hope this message finds you well. I wanted to reach out and check in.`,
      custom: `Hi ${contactName}, I was thinking about you and wanted to say hello. Hope all is well!`
    };
    
    return templates[tone] || templates.casual;
  }
}

export const AIService = new AIServiceClass();
export default AIService; 