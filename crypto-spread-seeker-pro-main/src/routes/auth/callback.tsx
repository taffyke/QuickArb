import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Log for debugging
        console.log('Auth callback handler started');
        
        // Look for auth hash
        const hash = window.location.hash;
        console.log('URL hash:', hash ? 'Present' : 'Not present');
        
        // Check the URL hash for access_token which indicates OAuth flow
        if (hash && hash.includes('access_token')) {
          console.log('Found access token in URL hash');
          setMessage('Completing authentication...');
          
          // The Supabase client handles the token exchange automatically
          // Just need to verify it worked
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('Authentication successful, redirecting to dashboard');
            // Navigate to dashboard after successful login
            navigate('/dashboard');
            return;
          } else {
            console.error('No session found after OAuth flow');
            throw new Error('Failed to authenticate with Google. Please try again.');
          }
        }
        
        // If no hash with tokens, check if we already have a session
        console.log('Checking for existing session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        
        if (data.session) {
          console.log('Existing session found, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('No session found, redirecting to login');
          // No session found, redirect to login
          setError('No active session found. Please sign in again.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(error instanceof Error ? error.message : 'Failed to process authentication');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleRedirect();
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md text-center">
          <h2 className="font-semibold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">Redirecting to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg">{message}</p>
        </div>
      )}
    </div>
  );
} 