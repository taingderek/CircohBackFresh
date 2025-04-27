import { supabase } from './supabaseClient';
import { 
  Reminder, 
  ReminderCreateData, 
  ReminderUpdateData
} from '../types/contact';

/**
 * Transforms a database reminder to our Reminder type
 */
const transformReminder = (raw: any): Reminder => {
  return {
    id: raw.id,
    userId: raw.user_id,
    contactId: raw.contact_id,
    title: raw.title,
    description: raw.description,
    reminder_date: new Date(raw.due_date),
    is_complete: raw.is_completed,
    frequency: raw.reminder_type === 'recurring' ? raw.priority : null,
    created_at: new Date(raw.created_at),
    updated_at: new Date(raw.updated_at)
  };
};

class ReminderService {
  /**
   * Get all reminders for the current user
   */
  async getReminders(showCompleted = false): Promise<Reminder[]> {
    try {
      let query = supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });
        
      if (!showCompleted) {
        query = query.eq('is_completed', false);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return (data || []).map(transformReminder);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  }
  
  /**
   * Get reminders for a specific contact
   */
  async getContactReminders(contactId: string, showCompleted = false): Promise<Reminder[]> {
    try {
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('contact_id', contactId)
        .order('due_date', { ascending: true });
        
      if (!showCompleted) {
        query = query.eq('is_completed', false);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return (data || []).map(transformReminder);
    } catch (error) {
      console.error('Error fetching contact reminders:', error);
      throw error;
    }
  }
  
  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_completed', false)
        .gte('due_date', now.toISOString())
        .lte('due_date', future.toISOString())
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(transformReminder);
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific reminder by ID
   */
  async getReminder(reminderId: string): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', reminderId)
        .single();
        
      if (error) throw error;
      
      return data ? transformReminder(data) : null;
    } catch (error) {
      console.error('Error fetching reminder:', error);
      throw error;
    }
  }
  
  /**
   * Create a new reminder
   */
  async createReminder(reminderData: ReminderCreateData): Promise<Reminder> {
    try {
      // Transform to database format
      const dbReminder: Record<string, any> = {
        contact_id: reminderData.contactId,
        title: reminderData.title,
        description: reminderData.description,
        due_date: reminderData.reminder_date,
        reminder_type: reminderData.frequency ? 'recurring' : 'one-time',
        priority: reminderData.frequency || 'medium',
        is_completed: false,
        notification_sent: false
      };
      
      const { data, error } = await supabase
        .from('reminders')
        .insert(dbReminder)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformReminder(data);
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing reminder
   */
  async updateReminder(reminderId: string, reminderData: ReminderUpdateData): Promise<Reminder> {
    try {
      // Transform to database format
      const dbReminder: Record<string, any> = {};
      
      if (reminderData.contactId !== undefined) dbReminder.contact_id = reminderData.contactId;
      if (reminderData.title !== undefined) dbReminder.title = reminderData.title;
      if (reminderData.description !== undefined) dbReminder.description = reminderData.description;
      if (reminderData.reminder_date !== undefined) dbReminder.due_date = reminderData.reminder_date;
      if (reminderData.is_complete !== undefined) dbReminder.is_completed = reminderData.is_complete;
      if (reminderData.frequency !== undefined) {
        dbReminder.reminder_type = reminderData.frequency ? 'recurring' : 'one-time';
        dbReminder.priority = reminderData.frequency;
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .update(dbReminder)
        .eq('id', reminderId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformReminder(data);
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }
  
  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
  
  /**
   * Mark a reminder as complete
   */
  async completeReminder(reminderId: string): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformReminder(data);
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }
  
  /**
   * Snooze a reminder for a specified number of days
   */
  async snoozeReminder(reminderId: string, days: number = 1): Promise<Reminder> {
    try {
      // Get current reminder
      const { data: currentReminder, error: fetchError } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', reminderId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculate new due date
      const currentDate = new Date(currentReminder.due_date);
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      
      // Update reminder
      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          due_date: newDate.toISOString(),
          notification_sent: false
        })
        .eq('id', reminderId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformReminder(data);
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      throw error;
    }
  }
}

export default new ReminderService(); 