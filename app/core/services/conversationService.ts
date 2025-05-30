import { supabase } from './supabaseClient';
import { Message } from '../store/slices/messagingSlice';

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  category: string;
  circohBackScore: number;
  lastMeaningfulInteraction: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  memoryPrompts?: string[];
  hasGratitudeMoment: boolean;
}

/**
 * Service to handle conversations with contacts
 */
export const conversationService = {
  /**
   * Fetch all conversations for the current user
   */
  getConversations: async (): Promise<Conversation[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch contacts first
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id, contactName, relationship, city, state, country, lastContactDate')
        .eq('userId', user.id);
        
      if (contactError) {
        throw contactError;
      }
      
      if (!contacts || contacts.length === 0) {
        return [];
      }
      
      // Fetch messages for each contact
      const contactIds = contacts.map(contact => contact.id);
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('contactId', contactIds)
        .order('timestamp', { ascending: false });
        
      if (messagesError) {
        throw messagesError;
      }
      
      // Group messages by contact
      const messagesByContact: Record<string, any[]> = {};
      messages?.forEach(message => {
        if (!messagesByContact[message.contactId]) {
          messagesByContact[message.contactId] = [];
        }
        messagesByContact[message.contactId].push(message);
      });
      
      // Fetch memory prompts for each contact
      const { data: memoryPrompts, error: promptsError } = await supabase
        .from('contact_memory_prompts')
        .select('*')
        .in('contactId', contactIds);
        
      if (promptsError) {
        throw promptsError;
      }
      
      // Group prompts by contact
      const promptsByContact: Record<string, string[]> = {};
      memoryPrompts?.forEach(prompt => {
        if (!promptsByContact[prompt.contactId]) {
          promptsByContact[prompt.contactId] = [];
        }
        promptsByContact[prompt.contactId].push(prompt.content);
      });
      
      // Build the conversation objects
      const conversations: Conversation[] = contacts.map(contact => {
        const contactMessages = messagesByContact[contact.id] || [];
        const lastMsg = contactMessages[0] || null;
        
        // Calculate days since last meaningful interaction
        const daysSinceLastInteraction = contact.lastContactDate
          ? Math.floor((new Date().getTime() - new Date(contact.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999; // Use a high number if no interaction recorded
        
        // For demo, use simple algorithm to determine CircohBack Score
        // In production, this would be calculated with more complex factors
        const contactFrequency = calculateContactFrequency(contactMessages);
        const circohBackScore = calculateCircohBackScore(daysSinceLastInteraction, contactFrequency);
        
        return {
          id: contact.id,
          contactId: contact.id,
          contactName: contact.contactName,
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`, // Placeholder for demo
          lastMessage: lastMsg ? lastMsg.content : 'Start a conversation',
          timestamp: lastMsg ? new Date(lastMsg.timestamp) : new Date(),
          unread: lastMsg ? !lastMsg.read : false,
          category: contact.relationship || 'Other',
          circohBackScore,
          lastMeaningfulInteraction: contact.lastContactDate ? new Date(contact.lastContactDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          sentiment: determineSentiment(lastMsg),
          memoryPrompts: promptsByContact[contact.id] || [],
          hasGratitudeMoment: contactMessages.some(msg => msg.type === 'gratitude'),
        };
      });
      
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },
  
  /**
   * Mark a conversation as read
   */
  markConversationAsRead: async (contactId: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update all unread messages for this contact
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('contactId', contactId)
        .eq('read', false);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },
  
  /**
   * Get conversations needing attention
   */
  getConversationsNeedingAttention: async (): Promise<Conversation[]> => {
    const conversations = await conversationService.getConversations();
    
    // Filter conversations that need attention (30+ days since last interaction)
    return conversations.filter(conversation => {
      const lastInteraction = new Date(conversation.lastMeaningfulInteraction);
      const daysSince = Math.floor((new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= 30;
    });
  },
};

/**
 * Helper functions
 */

// Calculate contact frequency score based on message history
function calculateContactFrequency(messages: any[]): number {
  if (!messages || messages.length === 0) return 0;
  
  // Simple implementation - can be enhanced in production
  // More messages = higher frequency score
  if (messages.length >= 20) return 5;
  if (messages.length >= 15) return 4;
  if (messages.length >= 10) return 3;
  if (messages.length >= 5) return 2;
  return 1;
}

// Calculate CircohBack Score based on various factors
function calculateCircohBackScore(daysSinceLastInteraction: number, contactFrequency: number): number {
  // Base score
  let score = 3.0;
  
  // Deduct points for long periods without interaction
  if (daysSinceLastInteraction > 60) {
    score -= 1.5;
  } else if (daysSinceLastInteraction > 30) {
    score -= 1.0;
  } else if (daysSinceLastInteraction > 14) {
    score -= 0.5;
  }
  
  // Add points for frequent contact
  score += (contactFrequency * 0.4);
  
  // Ensure score is within bounds
  return Math.max(1, Math.min(5, score));
}

// Determine sentiment from message content
function determineSentiment(message: any): 'positive' | 'negative' | 'neutral' {
  if (!message) return 'neutral';
  
  // In a real app, this would use NLP or the stored sentiment from analysis
  // For now, just a simple keyword search
  const content = message.content.toLowerCase();
  
  if (content.includes('happy') || content.includes('thanks') || content.includes('great') || 
      content.includes('love') || content.includes('appreciate')) {
    return 'positive';
  }
  
  if (content.includes('sad') || content.includes('sorry') || content.includes('upset') || 
      content.includes('worried') || content.includes('concerned')) {
    return 'negative';
  }
  
  return 'neutral';
} 