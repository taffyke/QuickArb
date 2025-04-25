# Supabase Setup for Crypto-Spread-Seeker-Pro

This guide will walk you through setting up Supabase as the backend for the Crypto-Spread-Seeker-Pro application.

## Prerequisites

- A Supabase account (free tier is sufficient to start)
- Basic knowledge of PostgreSQL

## Step 1: Create a Supabase Project

1. Visit [https://app.supabase.io/](https://app.supabase.io/) and log in
2. Click "New Project"
3. Enter a project name (e.g., "crypto-spread-seeker")
4. Set a secure database password
5. Choose a region close to your users
6. Click "Create New Project"

## Step 2: Set Up the Database

1. Once your project is ready, go to the SQL Editor tab
2. Copy the contents of the `supabase/schema.sql` file from this repository
3. Paste it into the SQL Editor
4. Run the SQL commands to create the necessary tables and functions

## Step 3: Configure Authentication

1. Go to the Authentication tab
2. Under Settings → Email, configure email settings:
   - Enable "Enable Email Signup"
   - Optionally, customize email templates
3. If you want to add social login (optional):
   - Go to Authentication → Settings → OAuth Providers
   - Configure the providers you want to support (GitHub, Google, etc.)

## Step 4: Configure Environment Variables

Create a `.env.local` file at the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-project-id` and `your-supabase-anon-key` with the values from your Supabase project settings (API section).

## Step 5: Test the Setup

To make sure everything is working correctly:

1. Run your application locally
2. Try to create a user account using the authentication system
3. Check that the user appears in the Supabase Auth section
4. Verify that a user profile was automatically created in the `user_profiles` table

## Database Schema

The application uses two main tables:

### user_profiles

Stores user preferences and settings:

- `id`: UUID primary key
- `user_id`: References the user in the auth.users table
- `email`: User email
- `name`: Optional user name
- `preferred_exchanges`: Array of exchange IDs
- `settings`: JSON object with user settings
- `created_at`: Timestamp of creation
- `last_updated`: Timestamp of last update

### api_keys

Stores encrypted exchange API keys:

- `id`: Text ID for the API key
- `user_id`: References the user in the auth.users table
- `exchange_id`: ID of the exchange (e.g., "Binance")
- `encrypted_api_key`: Encrypted API key
- `encrypted_secret`: Encrypted API secret
- `encrypted_passphrase`: Optional encrypted passphrase
- `label`: User-provided label for the key
- `created_at`: Timestamp of creation
- `last_updated`: Timestamp of last update
- `last_used`: Timestamp of last use
- `read_permission`: Whether the key has read permission
- `trade_permission`: Whether the key has trade permission
- `withdraw_permission`: Whether the key has withdraw permission
- `is_active`: Whether the key is active
- `test_result_status`: Status of the last connection test
- `test_result_message`: Message from the last connection test

## Security Considerations

- API keys are encrypted before storage using the AES-256-GCM algorithm
- Row-Level Security policies ensure users can only access their own data
- Supabase's built-in authentication handles secure user management
- The application uses only the minimal required permissions for API keys

## Troubleshooting

### User profiles not being created

If user profiles aren't automatically created when users sign up:

1. Check that the trigger function `handle_new_user()` exists in the database
2. Make sure the trigger `on_auth_user_created` is properly set up
3. Check for errors in the SQL editor logs

### API key connection failures

If API keys fail to connect to exchanges:

1. Verify the API key credentials are entered correctly
2. Check that the encrypting/decrypting process is working
3. Ensure the exchange is available and responding
4. Check for any IP restrictions on the exchange side 