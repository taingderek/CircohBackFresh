import { supabase } from '../app/core/services/supabaseClient';

async function initDatabase() {
  console.log('Initializing database tables...');
  
  try {
    // Create contacts table
    const { error: contactsError } = await supabase.rpc('create_contacts_table');
    if (contactsError) {
      console.error('Error creating contacts table:', contactsError);
    } else {
      console.log('Contacts table created successfully');
    }
    
    // Create reminders table
    const { error: remindersError } = await supabase.rpc('create_reminders_table');
    if (remindersError) {
      console.error('Error creating reminders table:', remindersError);
    } else {
      console.log('Reminders table created successfully');
    }
    
    // Create travel plans table
    const { error: travelError } = await supabase.rpc('create_travel_plans_table');
    if (travelError) {
      console.error('Error creating travel plans table:', travelError);
    } else {
      console.log('Travel plans table created successfully');
    }
    
    // Enable PostGIS extension if not already enabled
    const { error: postgisError } = await supabase.rpc('enable_postgis');
    if (postgisError) {
      console.error('Error enabling PostGIS extension:', postgisError);
    } else {
      console.log('PostGIS extension enabled successfully');
    }
    
    // Set up triggers for automatic reminders
    const { error: triggersError } = await supabase.rpc('setup_reminder_triggers');
    if (triggersError) {
      console.error('Error setting up reminder triggers:', triggersError);
    } else {
      console.log('Reminder triggers set up successfully');
    }
    
    console.log('Database initialization complete');
    
  } catch (err) {
    console.error('Unexpected error during database initialization:', err);
  }
}

initDatabase(); 