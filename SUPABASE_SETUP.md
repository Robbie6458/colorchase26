# Supabase Integration Setup Guide

This document outlines the setup process for connecting Color Chase to Supabase for authentication and data persistence.

## Prerequisites

- Supabase account and project created
- Google OAuth configured in Supabase
- Environment variables set in `.env.local`

## Database Schema

### Tables

#### `users` Table
Stores user profile information. This table extends Supabase's `auth.users` table.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  player_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  google_sub TEXT,
  CONSTRAINT player_name_not_empty CHECK (LENGTH(player_name) > 0)
);
```

#### `palettes` Table
Stores saved color palettes for users. This table should already exist.

## Setup Steps

### 1. Run Database Migrations

Go to your Supabase dashboard and run the SQL migration from `supabase/migrations/001_create_users_table.sql`:

1. In Supabase → SQL Editor
2. Create new query
3. Copy and paste the entire SQL from the migration file
4. Execute

This will:
- Create the `users` table
- Set up RLS (Row Level Security) policies
- Create triggers for user profile creation on signup
- Create necessary indexes

### 2. Configure Email Templates

1. Go to Supabase → Authentication → Email Templates
2. For "Confirm signup":
   - Keep default or customize with your branding
3. For "Reset password":
   - Update redirect URL to: `{{ .ConfirmationURL }}`
   - This will be sent in email as a link to `/auth/reset-password`

### 3. Verify Authentication Settings

In Supabase → Authentication → Providers:

✅ **Email**
- Enable: ON
- Confirm email: ON (recommended)

✅ **Google**
- Should already be configured
- Verify Client ID and Secret are set

✅ **Security**
- Site URL: `http://localhost:3000` (development)
- Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Migrate Existing Data (Optional)

If you have existing user data to import:

```bash
npx ts-node scripts/migrate-users.ts
```

This will:
- Create auth users for each existing user
- Create corresponding user profiles
- Set google_sub field if available

### 5. Environment Variables

Ensure `.env.local` contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://iczkzoupdzkakgzvwdye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Important**: Never commit the Service Role Key to git. Add `.env.local` to `.gitignore`.

## Authentication Flow

### Sign Up (Email)
1. User enters email, password, and player name
2. Supabase creates auth user and sends verification email
3. User clicks email link to verify account
4. Trigger automatically creates user profile

### Sign In (Email)
1. User enters email and password
2. Supabase verifies credentials
3. Session created and stored in browser
4. User redirected to home page

### Sign In (Google)
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent
3. Google redirects back with auth code
4. Supabase exchanges code for session
5. If first time: trigger creates user profile

### Password Reset
1. User clicks "Forgot your password?"
2. Enters email and submits
3. Supabase sends password reset email
4. User clicks link in email
5. Redirected to reset password page
6. User enters new password and confirms
7. Password updated in auth

## API Routes

### `GET /api/today-palette`
Returns today's color wheel and hidden palette.

**Authentication**: Bearer token required

**Response**:
```json
{
  "date": "2025-12-12",
  "wheelColors": ["#FF0000", ...],
  "hiddenPalette": ["#FF0000", ...],
  "family": "Warm Sunset",
  "treatment": "Vivid & Bright",
  "scheme": "triadic"
}
```

## Server Actions

All data operations use server actions for security:

- `getCurrentUser()` - Get current user and profile
- `updatePlayerName(newName)` - Change username (validates uniqueness)
- `savePalette(...)` - Save a palette after game
- `getUserPalettes()` - Get user's palette collection
- `toggleFavoritePalette(paletteId)` - Mark/unmark as favorite
- `deletePalette(paletteId)` - Delete a palette
- `checkAuth()` - Check if user is authenticated

## Security

### Row Level Security (RLS)
All tables have RLS enabled. Policies ensure:
- Users can only see their own data
- Users can only modify their own data
- Player names are visible to everyone (for uniqueness validation)

### Authentication
- All API routes require Bearer token authentication
- Server actions check auth status before operations
- Sensitive operations use Service Role Key on server only

## Troubleshooting

### "User profile not created"
- Check that the trigger `on_auth_user_created` is enabled
- Verify RLS policies are correct

### "Sign up with Google not working"
- Verify Google OAuth credentials in Supabase
- Check redirect URL in Google Cloud Console

### "Email verification not sending"
- Check Supabase email template is configured
- Verify SMTP settings if using custom domain

### "Can't update player name"
- Ensure RLS policy allows updates: `Users can update their own profile`
- Check player_name is unique

## Production Deployment

Before deploying to production:

1. Update `NEXT_PUBLIC_SUPABASE_URL` to production URL
2. Update `NEXT_PUBLIC_APP_URL` to production domain
3. Add production redirect URLs in Supabase
4. Update email templates with production URLs
5. Enable custom SMTP for production emails
6. Set strong security policies in Supabase

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
