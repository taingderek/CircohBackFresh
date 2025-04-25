import { supabase } from '../config/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type Reminder = {
  id: string;
  contact_id: string;
  user_id: string;
  due_date: string;
  snoozed: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type NewReminder = Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

class ReminderService {
  /**
   * Get all due reminders
   */
  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('completed', false)
      .lte('due_date', now)
      .eq('snoozed', false)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching due reminders:', error);
      throw error;
    }

    return data as Reminder[];
  }

  /**
   * Get all reminders for a contact
   */
  async getRemindersForContact(contactId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching reminders for contact:', error);
      throw error;
    }

    return data as Reminder[];
  }

  /**
   * Create a new reminder
   */
  async createReminder(reminder: NewReminder): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert([reminder])
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }

    // Schedule a notification for this reminder
    await this.scheduleNotification(data as Reminder);

    return data as Reminder;
  }

  /**
   * Update a reminder
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }

    // If the due date changed, reschedule notification
    if (updates.due_date) {
      await this.scheduleNotification(data as Reminder);
    }

    return data as Reminder;
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }

    // Cancel any scheduled notification for this reminder
    await this.cancelNotification(id);
  }

  /**
   * Mark a reminder as completed
   */
  async completeReminder(id: string): Promise<Reminder> {
    return this.updateReminder(id, {
      completed: true,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Snooze a reminder
   */
  async snoozeReminder(id: string, daysToSnooze: number = 1): Promise<Reminder> {
    const now = new Date();
    const snoozeDate = new Date(now);
    snoozeDate.setDate(now.getDate() + daysToSnooze);

    return this.updateReminder(id, {
      due_date: snoozeDate.toISOString(),
      snoozed: true,
      updated_at: now.toISOString(),
    });
  }

  /**
   * Create reminders for a new contact based on reminder frequency
   */
  async setupReminderForContact(contactId: string, reminderFrequency: number): Promise<Reminder> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + reminderFrequency);

    return this.createReminder({
      contact_id: contactId,
      due_date: dueDate.toISOString(),
      snoozed: false,
      completed: false,
    });
  }

  /**
   * Schedule a notification for a reminder
   */
  async scheduleNotification(reminder: Reminder): Promise<void> {
    if (Platform.OS === 'web') {
      return; // No notifications on web
    }

    // First make sure we have permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel any existing notification for this reminder
    await this.cancelNotification(reminder.id);

    // Get contact details for the notification
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('name')
      .eq('id', reminder.contact_id)
      .single();

    if (contactError) {
      console.error('Error fetching contact for notification:', contactError);
      return;
    }

    const contactName = contactData?.name || 'Someone';
    const dueDate = new Date(reminder.due_date);

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to connect with ${contactName}`,
        body: `It's been a while since you've been in touch.`,
        data: { reminderId: reminder.id, contactId: reminder.contact_id },
      },
      trigger: { 
        channelId: 'reminders',
        date: dueDate 
      },
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(reminderId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return; // No notifications on web
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const notification = scheduledNotifications.find(
      n => n.content.data?.reminderId === reminderId
    );

    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  /**
   * Setup notifications permissions
   */
  async setupNotifications(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get upcoming reminders (not yet due)
   */
  async getUpcomingReminders(limit: number = 5): Promise<Reminder[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('completed', false)
      .gt('due_date', now)
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming reminders:', error);
      throw error;
    }

    return data as Reminder[];
  }
}

export const reminderService = new ReminderService();
export default reminderService; 