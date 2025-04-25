/**
 * Environment variables for the application
 * 
 * This file handles environment variable configuration for the app.
 * For local development, you can use the default values provided.
 * For production, set these variables in your environment or .env file.
 * 
 * Required environment variables:
 * - EXPO_PUBLIC_SUPABASE_URL: URL of your Supabase project
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: Anonymous key for Supabase API access
 */

// Check if environment variables are defined
const validateEnvVar = (value: string | undefined, defaultValue: string, name: string): string => {
  if (!value && !defaultValue) {
    console.warn(`Missing required environment variable: ${name}`);
    return '';
  }
  return value || defaultValue;
};

// Export environment variables with fallbacks
export const SUPABASE_URL = validateEnvVar(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  'https://zrfjkrinmhxuxhwapqch.supabase.co',
  'EXPO_PUBLIC_SUPABASE_URL'
);

export const SUPABASE_ANON_KEY = validateEnvVar(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmprcmlubWh4dXhod2FwcWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzcyNzUsImV4cCI6MjA1OTAxMzI3NX0.SVpH17OfNp9Vq0S75YmKEBqlYto7DY7X4emhJxSQGp0',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY'
); 