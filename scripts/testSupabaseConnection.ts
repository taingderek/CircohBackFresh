import { supabase } from '../app/core/services/supabaseClient';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to get the current time from the database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Retrieved data:', data);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 