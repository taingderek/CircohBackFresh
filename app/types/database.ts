import { Point } from 'geojson';

export interface Contact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  birthday?: string | null; // date format
  relationship?: string | null;
  notes?: string | null;
  last_contact_date?: string | null; // ISO string timestamp
  next_contact_date?: string | null; // ISO string timestamp
  contact_frequency_days?: number | null; // days
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  coordinates?: Point | null; // PostGIS geography(POINT)
  reminder_settings?: {
    birthday_reminder: boolean;
    birthday_reminder_days: number;
    travel_reminder: boolean;
  };
  custom_fields?: Record<string, any> | null; // jsonb
  created_at: string; // ISO string timestamp
  updated_at: string; // ISO string timestamp
}

export interface Reminder {
  id: string;
  user_id: string;
  contact_id?: string | null;
  reminder_type: string; // type of reminder
  title: string;
  description?: string | null;
  due_date: string; // ISO string timestamp
  is_completed: boolean;
  priority?: string | null; // 'low', 'medium', 'high'
  notification_sent: boolean;
  created_at: string; // ISO string timestamp
  updated_at: string; // ISO string timestamp
}

export interface TravelPlan {
  id: string;
  user_id: string;
  destination_city: string;
  destination_state?: string | null;
  destination_country: string;
  arrival_date: string; // ISO string timestamp
  departure_date: string; // ISO string timestamp
  purpose?: string | null;
  notes?: string | null;
  coordinates?: Point | null; // PostGIS geography(POINT)
  notify_friends: boolean;
  friends_notified: boolean;
  created_at: string; // ISO string timestamp
  updated_at: string; // ISO string timestamp
}

export interface TravelContactLink {
  id: string;
  travel_plan_id: string;
  contact_id: string;
  notify: boolean;
  notified_at?: string | null; // ISO string timestamp
  created_at: string; // ISO string timestamp
}

// Input types for creating records
export type ContactInput = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ReminderInput = Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'notification_sent'>;
export type TravelPlanInput = Omit<TravelPlan, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'friends_notified'>;
export type TravelContactLinkInput = Omit<TravelContactLink, 'id' | 'created_at'>;

// Update types
export type ContactUpdate = Partial<ContactInput>;
export type ReminderUpdate = Partial<ReminderInput>;
export type TravelPlanUpdate = Partial<TravelPlanInput>;

// Keep other existing types...
// ... existing code ... 