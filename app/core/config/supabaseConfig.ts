// Supabase configuration
// Import process.env variables
import { SUPABASE_URL as ENV_SUPABASE_URL, SUPABASE_ANON_KEY as ENV_SUPABASE_ANON_KEY } from '@env';

// Fallback to hardcoded values if environment variables are not available
export const SUPABASE_URL = ENV_SUPABASE_URL || 'https://zrfjkrinmhxuxhwapqch.supabase.co';
export const SUPABASE_ANON_KEY = ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmprcmlubWh4dXhod2FwcWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzcyNzUsImV4cCI6MjA1OTAxMzI3NX0.SVpH17OfNp9Vq0S75YmKEBqlYto7DY7X4emhJxSQGp0'; 