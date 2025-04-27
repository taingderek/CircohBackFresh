import { supabase } from './supabaseClient';
import { 
  Contact, 
  ContactCreateData, 
  ContactUpdateData, 
  Reminder, 
  ReminderCreateData, 
  ReminderUpdateData,
  TravelPlan,
  TravelPlanCreateData,
  TravelPlanUpdateData,
  TravelContactLink,
  TravelContactLinkCreateData
} from '../types/contact';
import { GeoCoordinates } from '../types/user';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * Transforms a database contact to our Contact type
 */
const transformContact = (raw: any): Contact => {
  // Parse coordinates if they exist
  let coordinates: GeoCoordinates | null = null;
  if (raw.coordinates) {
    try {
      const pointString = raw.coordinates.toString();
      const match = pointString.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match && match.length === 3) {
        coordinates = {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
  }

  // Transform reminder settings from JSON
  const reminderSettings = raw.reminder_settings || {
    birthdayReminder: true,
    birthdayReminderDays: 7,
    travelReminder: true
  };

  return {
    id: raw.id,
    userId: raw.user_id,
    contactName: raw.contact_name,
    contactEmail: raw.contact_email,
    contactPhone: raw.contact_phone,
    birthday: raw.birthday ? new Date(raw.birthday) : null,
    relationship: raw.relationship,
    notes: raw.notes,
    lastContactDate: raw.last_contact_date ? new Date(raw.last_contact_date) : null,
    nextContactDate: raw.next_contact_date ? new Date(raw.next_contact_date) : null,
    contactFrequencyDays: raw.contact_frequency_days || 30,
    city: raw.location_city,
    state: raw.location_state,
    country: raw.location_country,
    coordinates,
    reminderSettings: {
      birthdayReminder: reminderSettings.birthday_reminder || false,
      birthdayReminderDays: reminderSettings.birthday_reminder_days || 7,
      travelReminder: reminderSettings.travel_reminder || false,
      customReminderFrequency: raw.contact_frequency_days || 30,
    },
    customFields: raw.custom_fields || {},
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at)
  };
};

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

/**
 * Transforms a database travel plan to our TravelPlan type
 */
const transformTravelPlan = (raw: any): TravelPlan => {
  // Parse coordinates if they exist
  let coordinates: GeoCoordinates | null = null;
  if (raw.coordinates) {
    try {
      const pointString = raw.coordinates.toString();
      const match = pointString.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match && match.length === 3) {
        coordinates = {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
  }

  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.purpose || `Trip to ${raw.destination_city}`,
    destination: `${raw.destination_city}${raw.destination_state ? ', ' + raw.destination_state : ''}${raw.destination_country ? ', ' + raw.destination_country : ''}`,
    destination_coords: coordinates,
    start_date: new Date(raw.arrival_date),
    end_date: new Date(raw.departure_date),
    description: raw.notes,
    notify_contacts: raw.notify_friends || false,
    created_at: new Date(raw.created_at),
    updated_at: new Date(raw.updated_at)
  };
};

/**
 * Transforms a database travel contact link
 */
const transformTravelContactLink = (raw: any): TravelContactLink => {
  return {
    id: raw.id,
    travel_plan_id: raw.travel_plan_id,
    contact_id: raw.contact_id,
    notify: raw.notify || false,
    notified_at: raw.notified_at ? new Date(raw.notified_at) : null,
    created_at: new Date(raw.created_at)
  };
};

class ContactService {
  // CONTACTS METHODS
  
  /**
   * Get all contacts for the current user
   */
  async getContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('contact_name', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(transformContact);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific contact by ID
   */
  async getContact(contactId: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
        
      if (error) throw error;
      
      return data ? transformContact(data) : null;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }
  
  /**
   * Create a new contact
   */
  async createContact(contactData: ContactCreateData): Promise<Contact> {
    try {
      // Transform to database format
      const dbContact: Record<string, any> = {
        contact_name: contactData.contactName,
        contact_email: contactData.contactEmail,
        contact_phone: contactData.contactPhone,
        birthday: contactData.birthday,
        relationship: contactData.relationship,
        notes: contactData.notes,
        last_contact_date: contactData.lastContactDate,
        next_contact_date: contactData.nextContactDate,
        contact_frequency_days: contactData.contactFrequencyDays || 30,
        location_city: contactData.city,
        location_state: contactData.state,
        location_country: contactData.country,
        custom_fields: contactData.customFields || {}
      };
      
      // Add coordinates if provided
      if (contactData.coordinates) {
        const { longitude, latitude } = contactData.coordinates;
        dbContact.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      // Add reminder settings if provided
      if (contactData.reminderSettings) {
        dbContact.reminder_settings = {
          birthday_reminder: contactData.reminderSettings.birthdayReminder,
          birthday_reminder_days: contactData.reminderSettings.birthdayReminderDays || 7,
          travel_reminder: contactData.reminderSettings.travelReminder
        };
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(dbContact)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformContact(data);
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing contact
   */
  async updateContact(contactId: string, contactData: ContactUpdateData): Promise<Contact> {
    try {
      // Transform to database format
      const dbContact: Record<string, any> = {};
      
      if (contactData.contactName !== undefined) dbContact.contact_name = contactData.contactName;
      if (contactData.contactEmail !== undefined) dbContact.contact_email = contactData.contactEmail;
      if (contactData.contactPhone !== undefined) dbContact.contact_phone = contactData.contactPhone;
      if (contactData.birthday !== undefined) dbContact.birthday = contactData.birthday;
      if (contactData.relationship !== undefined) dbContact.relationship = contactData.relationship;
      if (contactData.notes !== undefined) dbContact.notes = contactData.notes;
      if (contactData.lastContactDate !== undefined) dbContact.last_contact_date = contactData.lastContactDate;
      if (contactData.nextContactDate !== undefined) dbContact.next_contact_date = contactData.nextContactDate;
      if (contactData.contactFrequencyDays !== undefined) dbContact.contact_frequency_days = contactData.contactFrequencyDays;
      if (contactData.city !== undefined) dbContact.location_city = contactData.city;
      if (contactData.state !== undefined) dbContact.location_state = contactData.state;
      if (contactData.country !== undefined) dbContact.location_country = contactData.country;
      if (contactData.customFields !== undefined) dbContact.custom_fields = contactData.customFields;
      
      // Update coordinates if provided
      if (contactData.coordinates) {
        const { longitude, latitude } = contactData.coordinates;
        dbContact.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      // Update reminder settings if provided
      if (contactData.reminderSettings) {
        const { data: existing } = await supabase
          .from('contacts')
          .select('reminder_settings')
          .eq('id', contactId)
          .single();
          
        const currentSettings = existing?.reminder_settings || {
          birthday_reminder: true,
          birthday_reminder_days: 7,
          travel_reminder: true
        };
        
        dbContact.reminder_settings = {
          ...currentSettings,
          birthday_reminder: contactData.reminderSettings.birthdayReminder !== undefined 
            ? contactData.reminderSettings.birthdayReminder 
            : currentSettings.birthday_reminder,
          birthday_reminder_days: contactData.reminderSettings.birthdayReminderDays !== undefined 
            ? contactData.reminderSettings.birthdayReminderDays 
            : currentSettings.birthday_reminder_days,
          travel_reminder: contactData.reminderSettings.travelReminder !== undefined 
            ? contactData.reminderSettings.travelReminder 
            : currentSettings.travel_reminder
        };
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .update(dbContact)
        .eq('id', contactId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformContact(data);
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }
  
  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
  
  // REMINDERS METHODS
  
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
      
      // Schedule notification
      await this.scheduleReminderNotification(data.id, reminderData.title, reminderData.reminder_date);
      
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
      
      // If reminder date changed, reschedule notification
      if (reminderData.reminder_date) {
        await this.cancelReminderNotification(reminderId);
        await this.scheduleReminderNotification(data.id, data.title, new Date(data.due_date));
      }
      
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
      // Cancel notification first
      await this.cancelReminderNotification(reminderId);
      
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
      
      // Cancel notification
      await this.cancelReminderNotification(reminderId);
      
      return transformReminder(data);
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }
  
  /**
   * Schedule a notification for a reminder
   */
  private async scheduleReminderNotification(
    reminderId: string, 
    title: string, 
    date: Date
  ): Promise<void> {
    try {
      // Request notification permissions if needed
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
      }
      
      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder',
          body: title,
          data: { reminderId },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: date
        },
      });
      
      console.log(`Scheduled notification: ${notificationId} for reminder: ${reminderId}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
  
  /**
   * Cancel a notification for a reminder
   */
  private async cancelReminderNotification(reminderId: string): Promise<void> {
    try {
      // Get all scheduled notifications
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Find and cancel matching notification
      for (const notification of notifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled notification for reminder: ${reminderId}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }
  
  // TRAVEL PLANS METHODS
  
  /**
   * Get all travel plans for the current user
   */
  async getTravelPlans(): Promise<TravelPlan[]> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('arrival_date', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(transformTravelPlan);
    } catch (error) {
      console.error('Error fetching travel plans:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific travel plan by ID
   */
  async getTravelPlan(travelPlanId: string): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', travelPlanId)
        .single();
        
      if (error) throw error;
      
      return data ? transformTravelPlan(data) : null;
    } catch (error) {
      console.error('Error fetching travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Create a new travel plan
   */
  async createTravelPlan(travelPlanData: TravelPlanCreateData): Promise<TravelPlan> {
    try {
      // Extract city, state, country from destination
      const { city, state, country } = this.parseDestination(travelPlanData.destination);
      
      // Transform to database format
      const dbTravelPlan: Record<string, any> = {
        destination_city: city,
        destination_state: state,
        destination_country: country,
        arrival_date: travelPlanData.start_date,
        departure_date: travelPlanData.end_date,
        purpose: travelPlanData.title,
        notes: travelPlanData.description,
        notify_friends: travelPlanData.notify_contacts !== undefined ? travelPlanData.notify_contacts : true,
        friends_notified: false
      };
      
      // Add coordinates if provided
      if (travelPlanData.destination_coords) {
        const { longitude, latitude } = travelPlanData.destination_coords;
        dbTravelPlan.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      const { data, error } = await supabase
        .from('travel_plans')
        .insert(dbTravelPlan)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelPlan(data);
    } catch (error) {
      console.error('Error creating travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing travel plan
   */
  async updateTravelPlan(travelPlanId: string, travelPlanData: TravelPlanUpdateData): Promise<TravelPlan> {
    try {
      // Transform to database format
      const dbTravelPlan: Record<string, any> = {};
      
      if (travelPlanData.title !== undefined) dbTravelPlan.purpose = travelPlanData.title;
      if (travelPlanData.description !== undefined) dbTravelPlan.notes = travelPlanData.description;
      if (travelPlanData.start_date !== undefined) dbTravelPlan.arrival_date = travelPlanData.start_date;
      if (travelPlanData.end_date !== undefined) dbTravelPlan.departure_date = travelPlanData.end_date;
      if (travelPlanData.notify_contacts !== undefined) dbTravelPlan.notify_friends = travelPlanData.notify_contacts;
      
      // Parse destination if provided
      if (travelPlanData.destination !== undefined) {
        const { city, state, country } = this.parseDestination(travelPlanData.destination);
        dbTravelPlan.destination_city = city;
        dbTravelPlan.destination_state = state;
        dbTravelPlan.destination_country = country;
      }
      
      // Update coordinates if provided
      if (travelPlanData.destination_coords) {
        const { longitude, latitude } = travelPlanData.destination_coords;
        dbTravelPlan.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      const { data, error } = await supabase
        .from('travel_plans')
        .update(dbTravelPlan)
        .eq('id', travelPlanId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelPlan(data);
    } catch (error) {
      console.error('Error updating travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Delete a travel plan
   */
  async deleteTravelPlan(travelPlanId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('travel_plans')
        .delete()
        .eq('id', travelPlanId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Parse a destination string into city, state, country
   */
  private parseDestination(destination: string): { city: string; state: string | null; country: string | null } {
    const parts = destination.split(',').map(part => part.trim());
    
    if (parts.length === 1) {
      return { city: parts[0], state: null, country: null };
    } else if (parts.length === 2) {
      return { city: parts[0], state: null, country: parts[1] };
    } else if (parts.length >= 3) {
      return { city: parts[0], state: parts[1], country: parts[2] };
    }
    
    return { city: destination, state: null, country: null };
  }
  
  /**
   * Get travel contact links for a travel plan
   */
  async getTravelContactLinks(travelPlanId: string): Promise<TravelContactLink[]> {
    try {
      const { data, error } = await supabase
        .from('travel_contact_links')
        .select('*')
        .eq('travel_plan_id', travelPlanId);
        
      if (error) throw error;
      
      return (data || []).map(transformTravelContactLink);
    } catch (error) {
      console.error('Error fetching travel contact links:', error);
      throw error;
    }
  }
  
  /**
   * Create a new travel contact link
   */
  async createTravelContactLink(linkData: TravelContactLinkCreateData): Promise<TravelContactLink> {
    try {
      const { data, error } = await supabase
        .from('travel_contact_links')
        .insert({
          travel_plan_id: linkData.travel_plan_id,
          contact_id: linkData.contact_id,
          notify: linkData.notify !== undefined ? linkData.notify : true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelContactLink(data);
    } catch (error) {
      console.error('Error creating travel contact link:', error);
      throw error;
    }
  }
  
  /**
   * Delete a travel contact link
   */
  async deleteTravelContactLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('travel_contact_links')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting travel contact link:', error);
      throw error;
    }
  }
}

export default new ContactService(); 