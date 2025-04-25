import { ReactNode, useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/supabase-context';
import { AuthForms } from './AuthForms';
import { Loader2 } from 'lucide-react';
import { DEV_MODE, ALLOW_DEMO_LOGIN } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { setUserLoggedIn, setUserLoggedOut } from '@/App';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isInitialized, signOut } = useSupabase();
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);
  const navigate = useNavigate();
  
  // Check for development bypass token
  useEffect(() => {
    // Only allow bypass in development mode
    if (ALLOW_DEMO_LOGIN) {
      // Check if we have a bypass token in local storage
      const hasToken = localStorage.getItem('demo_bypass_token') === 'enabled';
      
      if (hasToken) {
        setBypassAuth(true);
      }
    }
  }, []);

  // Set user session when authenticated
  useEffect(() => {
    if (user && isInitialized && !isLoading) {
      setUserLoggedIn();
    }
  }, [user, isInitialized, isLoading]);
  
  // Set a timeout to show auth forms if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && (isLoading || !isInitialized) && !bypassAuth) {
        console.log('Loading timeout reached, showing auth forms');
        setShowAuthForms(true);
      }
    }, 3000); // Show login form after 3 seconds if still loading
    
    return () => clearTimeout(timer);
  }, [user, isLoading, isInitialized, bypassAuth]);

  const handleSignOut = async () => {
    try {
      // Clear demo token
      localStorage.removeItem('demo_bypass_token');
      setBypassAuth(false);
      
      // Clear user session
      setUserLoggedOut();
      
      // Only call sign out if we have a real user
      if (user) {
        await signOut();
      }
      
      // Force reload to clear any state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Allow bypassing auth in development mode
  if (bypassAuth) {
    return (
      <>
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 shadow-md fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
          <div>
            <p className="font-medium">Demo Mode Active</p>
            <p className="text-sm">You are using the application in demo mode.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              Exit Demo Mode
            </Button>
          </div>
        </div>
        <div className="pt-20">
          {children}
        </div>
      </>
    );
  }

  // Show loading state while initializing Supabase
  if (!isInitialized || isLoading) {
    // If loading is taking too long, show auth forms instead
    if (showAuthForms) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md">
            <AuthForms />
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If user is not authenticated, show login form
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <AuthForms />
        </div>
      </div>
    );
  }

  // If user is authenticated, show children
  return <>{children}</>;
} 