# Supabase Quick-Start Guide

This guide will help you quickly set up Supabase for the Crypto Spread Seeker Pro application.

## Step 1: Set Up Supabase Project

1. Go to [Supabase](https://supabase.com/) and create an account or log in
2. Create a new project
3. Choose a name for your project (e.g., "crypto-spread-seeker")
4. Set a secure database password
5. Choose a region close to your users
6. Once the project is created, go to Project Settings > API
7. Copy the URL and anon key to use in the next steps

## Step 2: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENCRYPTION_KEY=your_secure_encryption_key
```

3. Replace `your_supabase_url` and `your_supabase_anon_key` with the values from step 1
4. In Project Settings > API, find and copy the "service_role key" for `SUPABASE_SERVICE_ROLE_KEY`
5. Generate a secure encryption key (e.g., using `openssl rand -base64 32`) and set it as `ENCRYPTION_KEY`

## Step 3: Initialize the Database

Run the initialization script to create the necessary tables and functions:

```bash
npm run init-supabase
```

This script will:
1. Create the user_profiles table
2. Create the api_keys table
3. Set up Row Level Security policies
4. Create necessary functions and triggers

## Step 4: Start the Application

Once Supabase is set up, you can start the application:

```bash
npm run dev
```

Visit http://localhost:3000 in your browser, and you should see the login screen.

## Troubleshooting

### Database Initialization Errors

If you encounter errors during database initialization:

1. Check that your service role key is correct
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and run them manually

### Authentication Issues

If users can't sign up or sign in:

1. Go to Authentication > Settings in your Supabase dashboard
2. Make sure Email Auth is enabled
3. Check if you need to disable "Confirm email" for testing purposes

### API Key Storage Issues

If API keys aren't being stored correctly:

1. Check that the `ENCRYPTION_KEY` is set correctly
2. Verify that the api_keys table was created successfully
3. Check the browser console for any encryption-related errors 