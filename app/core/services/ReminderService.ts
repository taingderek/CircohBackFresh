import { supabase } from './supabaseClient';

/**
 * Interface for reminder data
 */
export interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  userId: string;
  title: string;
  description?: string;
  reminderDate: Date;
  isComplete: boolean;
  completedDate?: Date | null;
  frequency?: 'one-time' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service to handle reminders from Supabase
 */
export const reminderService = {
  /**
   * Get all reminders for the current user
   */
  getAllReminders: async (showCompleted = false): Promise<Reminder[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      let query = supabase
        .from('reminders')
        .select(`
          *,
          contacts (
            full_name
          )
        `)
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true });
        
      if (!showCompleted) {
        query = query.eq('is_complete', false);
      }
      
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        contactId: item.contact_id,
        contactName: item.contacts?.full_name || 'Unknown',
        userId: item.user_id,
        title: item.title,
        description: item.description,
        reminderDate: new Date(item.reminder_date),
        isComplete: item.is_complete,
        completedDate: item.completed_date ? new Date(item.completed_date) : null,
        frequency: item.frequency,
        priority: item.priority || 'medium',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },
  
  /**
   * Get completed reminders
   */
  getCompletedReminders: async (): Promise<Reminder[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          contacts (
            full_name
          )
        `)
        .eq('user_id', user.id)
        .eq('is_complete', true)
        .order('completed_date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        contactId: item.contact_id,
        contactName: item.contacts?.full_name || 'Unknown',
        userId: item.user_id,
        title: item.title,
        description: item.description,
        reminderDate: new Date(item.reminder_date),
        isComplete: item.is_complete,
        completedDate: item.completed_date ? new Date(item.completed_date) : null,
        frequency: item.frequency,
        priority: item.priority || 'medium',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching completed reminders:', error);
      throw error;
    }
  },
  
  /**
   * Get reminders for a specific contact
   */
  getContactReminders: async (contactId: string, showCompleted = false): Promise<Reminder[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      let query = supabase
        .from('reminders')
        .select(`
          *,
          contacts (
            full_name
          )
        `)
        .eq('user_id', user.id)
        .eq('contact_id', contactId)
        .order('reminder_date', { ascending: true });
        
      if (!showCompleted) {
        query = query.eq('is_complete', false);
      }
      
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        contactId: item.contact_id,
        contactName: item.contacts?.full_name || 'Unknown',
        userId: item.user_id,
        title: item.title,
        description: item.description,
        reminderDate: new Date(item.reminder_date),
        isComplete: item.is_complete,
        completedDate: item.completed_date ? new Date(item.completed_date) : null,
        frequency: item.frequency,
        priority: item.priority || 'medium',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching contact reminders:', error);
      throw error;
    }
  },
  
  /**
   * Mark a reminder as complete
   */
  completeReminder: async (reminderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          is_complete: true,
          completed_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  },
  
  /**
   * Mark a reminder as incomplete
   */
  uncompleteReminder: async (reminderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          is_complete: false,
          completed_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error uncompleting reminder:', error);
      throw error;
    }
  },
  
  /**
   * Create a new reminder
   */
  createReminder: async (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          contact_id: reminderData.contactId,
          title: reminderData.title,
          description: reminderData.description,
          reminder_date: reminderData.reminderDate.toISOString(),
          is_complete: reminderData.isComplete,
          completed_date: reminderData.completedDate ? reminderData.completedDate.toISOString() : null,
          frequency: reminderData.frequency,
          priority: reminderData.priority
        })
        .select(`
          *,
          contacts (
            full_name
          )
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        contactId: data.contact_id,
        contactName: data.contacts?.full_name || 'Unknown',
        userId: data.user_id,
        title: data.title,
        description: data.description,
        reminderDate: new Date(data.reminder_date),
        isComplete: data.is_complete,
        completedDate: data.completed_date ? new Date(data.completed_date) : null,
        frequency: data.frequency,
        priority: data.priority || 'medium',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing reminder
   */
  updateReminder: async (reminderId: string, reminderData: Partial<Reminder>): Promise<Reminder> => {
    try {
      const updateData: Record<string, any> = {};
      
      if (reminderData.title !== undefined) updateData.title = reminderData.title;
      if (reminderData.description !== undefined) updateData.description = reminderData.description;
      if (reminderData.reminderDate !== undefined) updateData.reminder_date = reminderData.reminderDate.toISOString();
      if (reminderData.isComplete !== undefined) updateData.is_complete = reminderData.isComplete;
      if (reminderData.completedDate !== undefined) updateData.completed_date = reminderData.completedDate?.toISOString();
      if (reminderData.frequency !== undefined) updateData.frequency = reminderData.frequency;
      if (reminderData.priority !== undefined) updateData.priority = reminderData.priority;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', reminderId)
        .select(`
          *,
          contacts (
            full_name
          )
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        contactId: data.contact_id,
        contactName: data.contacts?.full_name || 'Unknown',
        userId: data.user_id,
        title: data.title,
        description: data.description,
        reminderDate: new Date(data.reminder_date),
        isComplete: data.is_complete,
        completedDate: data.completed_date ? new Date(data.completed_date) : null,
        frequency: data.frequency,
        priority: data.priority || 'medium',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },
  
  /**
   * Delete a reminder
   */
  deleteReminder: async (reminderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
}; 