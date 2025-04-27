// Simple test to verify functions were set up
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSetup() {
  try {
    console.log('Checking for get_user_profile function...');
    const { data, error } = await supabase.rpc('get_user_profile', { 
      p_user_id: '00000000-0000-0000-0000-000000000000' 
    });
    
    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.error('❌ get_user_profile function does not exist');
        console.error('Error:', error.message);
      } else {
        console.log('✅ get_user_profile function exists! (Error is expected for non-existent user)');
      }
    } else {
      console.log('✅ get_user_profile function exists!');
    }
    
    console.log('\nChecking for profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      if (profilesError.message.includes('relation') && profilesError.message.includes('does not exist')) {
        console.error('❌ profiles table does not exist');
        console.error('Error:', profilesError.message);
      } else {
        console.error('❌ Other error with profiles table');
        console.error('Error:', profilesError.message);
      }
    } else {
      console.log('✅ profiles table exists!');
    }
    
    console.log('\nChecking for exec_sql function...');
    const testSql = "SELECT 1 as test";
    const { error: execSqlError } = await supabase.rpc('exec_sql', { sql: testSql });
    
    if (execSqlError) {
      if (execSqlError.message.includes('function') && execSqlError.message.includes('does not exist')) {
        console.error('❌ exec_sql function does not exist');
        console.error('Error:', execSqlError.message);
      } else {
        console.error('❌ Other error with exec_sql function');
        console.error('Error:', execSqlError.message);
      }
    } else {
      console.log('✅ exec_sql function exists!');
    }
    
    console.log('\nVerification complete.');
  } catch (err) {
    console.error('Unexpected error during verification:', err);
  }
}

// Run the check
checkSetup(); 