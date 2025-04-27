import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getSession, signInWithGoogle } from '@/lib/supabase';
import { ProfileService } from '@/services/ProfileService';
import { DEV_MODE, ALLOW_DEMO_LOGIN } from '@/lib/env';

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isInitialized: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Mock user for development
const ENABLE_MOCK_AUTH = DEV_MODE && ALLOW_DEMO_LOGIN;
const mockUser = ENABLE_MOCK_AUTH ? {
  id: 'mock-user-id',
  email: 'demo@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
} : null;

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const profileService = ProfileService.getInstance();

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        console.log('[SupabaseContext] Initializing auth session...');
        
        if (ENABLE_MOCK_AUTH) {
          // Use mock user and session for development
          console.log('[DEV] Using mock authentication');
          setUser(mockUser as User);
          setSession({ 
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            user: mockUser as User 
          } as Session);
          
          // Initialize mock profile
          if (mockUser) {
            await profileService.initializeUserProfile(mockUser.id);
          }
        } else {
          // Real authentication
          console.log('[SupabaseContext] Getting current session...');
          const currentSession = await getSession();
          console.log('[SupabaseContext] Session found:', !!currentSession);
          
          if (currentSession?.user) {
            console.log('[SupabaseContext] User is authenticated:', currentSession.user.id);
          } else {
            console.log('[SupabaseContext] No authenticated user found');
          }
          
          setSession(currentSession);
          setUser(currentSession?.user || null);

          // Initialize user profile if logged in
          if (currentSession?.user) {
            console.log('[SupabaseContext] Initializing user profile...');
            try {
              await profileService.initializeUserProfile(currentSession.user.id);
              console.log('[SupabaseContext] User profile initialized successfully');
            } catch (profileError) {
              console.error('[SupabaseContext] Error initializing profile:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        // Always finish loading and mark as initialized
        // This ensures the login screen appears if auth fails
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Start initialization with a small timeout to avoid getting stuck
    const timer = setTimeout(() => {
      initSession();
    }, 500);

    // Set a fallback timeout to ensure we don't stay loading forever
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timeout reached, forcing initialization');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 5000);

    // Set up auth state listener (only if not using mock)
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (!ENABLE_MOCK_AUTH) {
      const authListener = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user || null);

          // Initialize user profile when user logs in
          if (session?.user) {
            try {
              await profileService.initializeUserProfile(session.user.id);
            } catch (error) {
              console.error('Error initializing user profile:', error);
            }
          }
        }
      );
      subscription = authListener.data.subscription;
    }

    // Clean up
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (ENABLE_MOCK_AUTH) {
        // Mock successful login
        console.log('[DEV] Mock sign in with:', email);
        setUser(mockUser as User);
        setSession({ 
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          user: mockUser as User 
        } as Session);
        
        if (mockUser) {
          await profileService.initializeUserProfile(mockUser.id);
        }
      } else {
        // Real authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Initialize user profile after login
        if (data.user) {
          await profileService.initializeUserProfile(data.user.id);
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (ENABLE_MOCK_AUTH) {
        // Mock successful registration
        console.log('[DEV] Mock sign up with:', email);
        // In a real app, we would just return success but not log in automatically
      } else {
        // Real registration
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (ENABLE_MOCK_AUTH) {
        // Mock sign out
        console.log('[DEV] Mock sign out');
        setUser(null);
        setSession(null);
      } else {
        // Real sign out
        await profileService.logout(); // This also calls supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      if (ENABLE_MOCK_AUTH) {
        // Mock sign in with Google
        console.log('[DEV] Mock sign in with Google');
        setUser(mockUser as User);
        setSession({ 
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          user: mockUser as User 
        } as Session);
        
        if (mockUser) {
          await profileService.initializeUserProfile(mockUser.id);
        }
      } else {
        // Real sign in with Google using the imported function
        await signInWithGoogle();
        
        // The session and user will be updated by the auth state listener
        // so we don't need to manually update them here
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle: handleGoogleSignIn,
    isInitialized,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 