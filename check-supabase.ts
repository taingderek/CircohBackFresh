/**
 * Supabase Connection Test Script
 * 
 * This script tests the connectivity to Supabase and verifies that
 * your environment is correctly configured.
 */

import 'react-native-url-polyfill/auto';
import * as dotenv from 'dotenv';
import { supabase, testSupabaseConnection } from './app/core/services/supabaseClient';
import Constants from 'expo-constants';

// Load environment variables
dotenv.config();

// Print header
console.log(`\n🔍 CircohBack - Supabase Connection Test\n`);
console.log('--------------------------------------');

async function runTests() {
  try {
    // Display configuration info
    console.log('📋 Configuration:');
    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '(not set)';
    console.log(` - Supabase URL: ${supabaseUrl.substring(0, 25)}...`);
    console.log(` - Environment: ${process.env.EXPO_PUBLIC_APP_ENV || 'development'}`);
    console.log('--------------------------------------');

    // Test 1: Basic connectivity
    console.log('\n🧪 Test 1: Basic Connectivity');
    const connResult = await testSupabaseConnection();
    if (connResult) {
      console.log('✅ Successfully connected to Supabase!');
    } else {
      console.error('❌ Failed to connect to Supabase');
      console.log('\nPlease check your configuration and try again.');
      process.exit(1);
    }

    // Test 2: Query health_check table
    console.log('\n🧪 Test 2: Query health_check table');
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Failed to query health_check table:', error.message);
      console.log('\nDo you need to run the migration? Try:');
      console.log('  npx supabase migration up');
    } else {
      console.log('✅ Successfully queried health_check table');
      console.log(`   Status: ${data?.[0]?.status || 'unknown'}`);
    }

    // Test 3: Auth configuration
    console.log('\n🧪 Test 3: Auth Configuration');
    const { data: authConfig, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth configuration issue:', authError.message);
    } else {
      console.log('✅ Auth is properly configured');
      console.log(`   Session present: ${authConfig.session ? 'Yes' : 'No'}`);
    }

    // Final results
    console.log('\n--------------------------------------');
    if (!error && !authError) {
      console.log('🎉 All tests passed! Your Supabase configuration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please review the issues above.');
    }
    
  } catch (err) {
    console.error('\n❌ Unexpected error during testing:', err);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error); 