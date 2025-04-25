import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// These would normally be in environment variables
const supabaseUrl = 'https://sqzbftpiqbqxurwdjqsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxemJmdHBpcWJxeHVyd2RqcXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0ODMxNDYsImV4cCI6MjAzMjA1OTE0Nn0.Nkno0TQHbSRfgvHEr1L-0vdIL_s2W2Hv2Z7Ny9Bxzns';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Profile() {
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      // Redirect to login or home page
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
      {/* Header Section */}
        <div className="bg-card/50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            
            <div className="flex flex-row gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-500 rounded hover:bg-gray-800">
                Export Data
              </button>
              <button 
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* You can add other profile sections here */}
        <div className="bg-card/50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Profile Settings</h2>
          </div>
          
          <div className="text-center py-8">
            <p className="mb-4 text-muted-foreground">Profile settings go here</p>
          </div>
        </div>
      </div>
    </div>
  );
} 