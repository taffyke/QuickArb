/**
 * Environment variables utility
 * 
 * This centralizes access to environment variables and provides fallbacks
 */

// Helper to get environment variables with fallbacks
const getEnv = (key: string, fallback: string = ''): string => {
  // Try both Vite style and Next.js style variables for compatibility
  return (
    import.meta.env[`VITE_${key}`] || 
    import.meta.env[`NEXT_PUBLIC_${key}`] || 
    process.env[`VITE_${key}`] || 
    process.env[`NEXT_PUBLIC_${key}`] || 
    fallback
  );
};

// Development configuration
export const DEV_MODE = import.meta.env.DEV || process.env.NODE_ENV === 'development';
export const ALLOW_DEMO_LOGIN = false; // Set to false to disable demo account login

// Supabase configuration
export const SUPABASE_URL = getEnv('SUPABASE_URL', 'https://sqzbftpiqbqxurwdjqsw.supabase.co');
export const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxemJmdHBpcWJxeHVyd2RqcXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0ODMxNDYsImV4cCI6MjAzMjA1OTE0Nn0.Nkno0TQHbSRfgvHEr1L-0vdIL_s2W2Hv2Z7Ny9Bxzns');

// Encryption settings
export const ENCRYPTION_KEY = getEnv('ENCRYPTION_KEY', 'fallback-dev-key-not-for-production');

// Application settings
export const APP_URL = getEnv('APP_URL', 'http://localhost:3000');
export const APP_NAME = getEnv('APP_NAME', 'QuickArb');

// Check for missing critical variables
const warnIfMissing = (key: string, value: string): void => {
  if (!value) {
    console.warn(`Warning: ${key} environment variable is not set!`);
  }
};

// Check critical variables
warnIfMissing('SUPABASE_URL', SUPABASE_URL);
warnIfMissing('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
warnIfMissing('ENCRYPTION_KEY', ENCRYPTION_KEY); 