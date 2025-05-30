import supabase from '../app/core/services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User Authentication
export const signUp = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    // Create a profile in the profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name: displayName,
      email,
      created_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;
  }

  return data.user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  await AsyncStorage.removeItem('user');
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const updateEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

// Subscription Management
export const addSubscription = async (userId: string, subscriptionData: any) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription: subscriptionData,
      is_premium: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};

export const cancelSubscription = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      'subscription.status': 'canceled',
      is_premium: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};

export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.subscription;
};

// Contact Management
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  frequency: number; // in days
  next_contact_date: string; // ISO string
  last_contacted?: string; // ISO string
  created_at: string;
  updated_at: string;
  category?: string;
  avatar_url?: string;
}

export const addContact = async (userId: string, contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const now = new Date().toISOString();
  
  const newContact = {
    ...contactData,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };
  
  const { data, error } = await supabase
    .from('contacts')
    .insert(newContact)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getContacts = async (userId: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('next_contact_date');

  if (error) throw error;
  return data || [];
};

export const getDailyContacts = async (userId: string) => {
  // Get today's date at the beginning of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get tomorrow's date at the beginning of the day
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Convert to ISO strings for comparison
  const todayStr = today.toISOString();
  const tomorrowStr = tomorrow.toISOString();
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .lte('next_contact_date', tomorrowStr)
    .order('next_contact_date');

  if (error) throw error;
  return data || [];
};

export const getContact = async (contactId: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) throw error;
  return data;
};

export const updateContact = async (contactId: string, contactData: Partial<Contact>) => {
  const updateData = {
    ...contactData,
    updated_at: new Date().toISOString(),
  };
  
  const { error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', contactId);

  if (error) throw error;
};

export const updateContactLastContacted = async (contactId: string, lastContactedDate: string) => {
  // First get the contact to know its frequency
  const { data: contact, error: fetchError } = await supabase
    .from('contacts')
    .select('frequency')
    .eq('id', contactId)
    .single();

  if (fetchError) throw fetchError;
  
  // Calculate the next contact date based on frequency
  const nextContactDate = new Date(lastContactedDate);
  nextContactDate.setDate(nextContactDate.getDate() + contact.frequency);
  
  // Update the contact
  const { error } = await supabase
    .from('contacts')
    .update({
      last_contacted: lastContactedDate,
      next_contact_date: nextContactDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId);

  if (error) throw error;
};

export const updateContactFrequency = async (contactId: string, frequency: number) => {
  // First get the contact to recalculate next contact date if it's been contacted before
  const { data: contact, error: fetchError } = await supabase
    .from('contacts')
    .select('last_contacted')
    .eq('id', contactId)
    .single();

  if (fetchError) throw fetchError;
  
  const updateData: any = {
    frequency,
    updated_at: new Date().toISOString()
  };

  // If the contact has been contacted before, recalculate next contact date
  if (contact.last_contacted) {
    const nextContactDate = new Date(contact.last_contacted);
    nextContactDate.setDate(nextContactDate.getDate() + frequency);
    updateData.next_contact_date = nextContactDate.toISOString();
  }
  
  const { error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', contactId);

  if (error) throw error;
};

export const deleteContact = async (contactId: string) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
}; 