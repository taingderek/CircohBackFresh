import { GeoCoordinates } from './user';

/**
 * Relationship types with contacts
 */
export type RelationshipType = 
  | 'friend' 
  | 'family' 
  | 'colleague' 
  | 'acquaintance' 
  | 'business'
  | 'other';

/**
 * Contact interface representing a contact in the system
 */
export interface Contact {
  id: string;
  userId: string;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  birthday?: Date | null;
  relationship?: string | null;
  notes?: string | null;
  lastContactDate?: Date | null;
  nextContactDate?: Date | null;
  contactFrequencyDays?: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: GeoCoordinates | null;
  reminderSettings: ContactReminderSettings;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contact reminder settings
 */
export interface ContactReminderSettings {
  birthdayReminder: boolean;
  birthdayReminderDays: number;
  travelReminder: boolean;
  customReminderFrequency?: number; // days
}

/**
 * Data required to create a new contact
 */
export interface ContactCreateData {
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  birthday?: Date | null;
  relationship?: string | null;
  notes?: string | null;
  lastContactDate?: Date | null;
  nextContactDate?: Date | null;
  contactFrequencyDays?: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: GeoCoordinates | null;
  reminderSettings?: Partial<ContactReminderSettings>;
  customFields?: Record<string, any>;
}

/**
 * Data that can be updated on an existing contact
 */
export interface ContactUpdateData {
  contactName?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  birthday?: Date | null;
  relationship?: string | null;
  notes?: string | null;
  lastContactDate?: Date | null;
  nextContactDate?: Date | null;
  contactFrequencyDays?: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: GeoCoordinates | null;
  reminderSettings?: Partial<ContactReminderSettings>;
  customFields?: Record<string, any>;
}

/**
 * Reminder interface for contacts
 */
export interface Reminder {
  id: string;
  userId: string;
  contactId?: string | null;
  title: string;
  description?: string | null;
  reminder_date: Date;
  is_complete: boolean;
  frequency?: string | null; // 'one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  created_at: Date;
  updated_at: Date;
}

/**
 * Data required to create a new reminder
 */
export interface ReminderCreateData {
  contactId?: string | null;
  title: string;
  description?: string | null;
  reminder_date: Date;
  frequency?: string | null;
}

/**
 * Data that can be updated on an existing reminder
 */
export interface ReminderUpdateData {
  contactId?: string | null;
  title?: string;
  description?: string | null;
  reminder_date?: Date;
  is_complete?: boolean;
  frequency?: string | null;
}

/**
 * Travel plan interface
 */
export interface TravelPlan {
  id: string;
  userId: string;
  title: string;
  destination: string;
  destination_coords?: GeoCoordinates | null;
  start_date: Date;
  end_date: Date;
  description?: string | null;
  notify_contacts: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Data required to create a new travel plan
 */
export interface TravelPlanCreateData {
  title: string;
  destination: string;
  destination_coords?: GeoCoordinates | null;
  start_date: Date;
  end_date: Date;
  description?: string | null;
  notify_contacts?: boolean;
}

/**
 * Data that can be updated on an existing travel plan
 */
export interface TravelPlanUpdateData {
  title?: string;
  destination?: string;
  destination_coords?: GeoCoordinates | null;
  start_date?: Date;
  end_date?: Date;
  description?: string | null;
  notify_contacts?: boolean;
}

/**
 * Travel contact link interface
 */
export interface TravelContactLink {
  id: string;
  travel_plan_id: string;
  contact_id: string;
  notify: boolean;
  notified_at?: Date | null;
  created_at: Date;
}

/**
 * Data required to create a new travel contact link
 */
export interface TravelContactLinkCreateData {
  travel_plan_id: string;
  contact_id: string;
  notify?: boolean;
}

/**
 * Data that can be updated on an existing travel contact link
 */
export interface TravelContactLinkUpdateData {
  notify?: boolean;
  notified_at?: Date | null;
} 