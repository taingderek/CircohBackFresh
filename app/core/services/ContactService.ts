import { supabase } from '../config/supabase';
import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  phone_number?: string;
  email?: string;
  category: 'friend' | 'family' | 'colleague' | 'other';
  platform_linked?: 'sms' | 'whatsapp' | 'imessage' | 'other' | null;
  reminder_frequency: number;
  last_contacted?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type NewContact = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

class ContactService {
  /**
   * Get all contacts for the current user
   */
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    return data as Contact[];
  }

  /**
   * Get a single contact by ID
   */
  async getContactById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Create a new contact
   */
  async createContact(contact: NewContact): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Update an existing contact
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Mark a contact as contacted
   */
  async markContacted(id: string): Promise<Contact> {
    const now = new Date().toISOString();
    return this.updateContact(id, { 
      last_contacted: now,
      updated_at: now 
    });
  }

  /**
   * Request permissions to access device contacts
   */
  async requestContactsPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    }
    return false;
  }

  /**
   * Sync contacts from device
   */
  async syncDeviceContacts(): Promise<{ imported: number; total: number }> {
    if (Platform.OS === 'web') {
      return { imported: 0, total: 0 };
    }

    const permission = await this.requestContactsPermission();
    if (!permission) {
      throw new Error('Contacts permission not granted');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    let imported = 0;
    for (const deviceContact of data) {
      if (deviceContact.name) {
        try {
          const phoneNumber = deviceContact.phoneNumbers && deviceContact.phoneNumbers.length > 0
            ? deviceContact.phoneNumbers[0].number
            : undefined;
            
          const email = deviceContact.emails && deviceContact.emails.length > 0
            ? deviceContact.emails[0].email
            : undefined;

          // Check if contact already exists to avoid duplicates
          const { data: existingContacts } = await supabase
            .from('contacts')
            .select('id')
            .or(`phone_number.eq.${phoneNumber},email.eq.${email}`)
            .limit(1);

          if (!existingContacts || existingContacts.length === 0) {
            await this.createContact({
              name: deviceContact.name,
              phone_number: phoneNumber,
              email: email,
              category: 'other',
              reminder_frequency: 14, // Default to 2 weeks
            });
            imported++;
          }
        } catch (error) {
          console.error('Error importing contact:', deviceContact.name, error);
        }
      }
    }

    return { imported, total: data.length };
  }

  /**
   * Filter contacts by category
   */
  async filterByCategory(category: Contact['category']): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error filtering contacts by category:', error);
      throw error;
    }

    return data as Contact[];
  }

  /**
   * Search contacts by name
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }

    return data as Contact[];
  }
}

export const contactService = new ContactService();
export default contactService; 