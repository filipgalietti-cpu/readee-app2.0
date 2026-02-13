# Readee App 2.0 - Setup Guide

## Quick Start

This guide will help you set up the Readee application with Supabase authentication and database.

### Prerequisites

1. Node.js 18+ installed
2. A Supabase account and project
3. Git installed

### Step 1: Clone the Repository

If you haven't already:
```bash
git clone https://github.com/filipgalietti-cpu/readee-app2.0.git
cd readee-app2.0
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details and create your project

#### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon) in the sidebar
2. Go to "API" section
3. You'll find:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **Project API keys**:
     - `anon` `public`: This is your anonymous/public key (safe for client-side)
     - `service_role` `secret`: This is your service role key (keep it secret!)

#### 3.3 Run Database Migrations

1. In your Supabase dashboard, go to "SQL Editor"
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repository
3. Copy the entire content and paste it into the SQL Editor
4. Click "Run" to execute the migration
5. This will create all necessary tables and set up Row Level Security

### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder values with your actual Supabase credentials:

```env
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- Replace `your-project-id.supabase.co` with your actual Supabase project URL
- Replace `your-anon-key-here` with your anon key
- Replace `your-service-role-key-here` with your service role key
- **Never commit `.env.local` to version control!** It's already in `.gitignore`

### Step 5: Verify the Setup

#### 5.1 Build the Application

```bash
npm run build
```

This should complete without errors.

#### 5.2 Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

#### 5.3 Test the Connection

1. Navigate to `http://localhost:3000/test-connection`
2. You should see a test results page showing:
   - ✓ Regular Client Connection: passed
   - ✓ Admin Client Connection: passed
   - ✓ Environment Variables: passed

If any tests fail, check your `.env.local` file and make sure all values are correct.

### Step 6: Create Your First User

1. Go to `http://localhost:3000/signup`
2. Create an account with your email and password
3. You'll be redirected to the onboarding/welcome page
4. Complete the onboarding process
5. You should then be able to access the dashboard

## Troubleshooting

### "Nothing happens" when trying to log in

**Solution:** This was the original issue! Make sure:
1. You have created the `.env.local` file with correct Supabase credentials
2. The `proxy.ts` file exists in the root directory (it handles authentication)
3. You've run the database migrations in Supabase

### Environment variables not found

**Solution:**
1. Make sure `.env.local` exists in the root directory
2. Restart your development server after creating/modifying `.env.local`
3. Verify the variable names match exactly (case-sensitive)

### Database/Table errors

**Solution:**
1. Make sure you've run the migration in Supabase SQL Editor
2. Check the SQL Editor for any error messages
3. Verify the tables exist in "Table Editor" in Supabase dashboard

### Login redirects in a loop

**Solution:**
1. Clear your browser cookies
2. Check that the `proxy.ts` file exists and hasn't been modified
3. Verify the `onboarding_complete` field exists in the profiles table

### Test connection page shows warnings or failures

**Solution:**
1. **Environment Variables failed:** Check your `.env.local` file
2. **Regular Client failed:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Admin Client warning:** This is optional unless you need admin features

## Protected Files - DO NOT DELETE

The following files are **critical** for authentication to work. They have protective comments but be careful not to delete them:

- `/proxy.ts` - Main authentication and routing middleware
- `/lib/supabase/client.ts` - Browser-side Supabase client
- `/lib/supabase/server.ts` - Server-side Supabase client
- `/app/auth/callback/route.ts` - OAuth callback handler

## Next Steps

After completing setup:

1. **Customize the onboarding flow** at `/app/welcome`
2. **Add sample stories** to test the reading features
3. **Configure Google OAuth** (optional) for social login
4. **Deploy to production** when ready

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Repository Architecture](./ARCHITECTURE.md)
- [Backend Setup Details](./BACKEND_SETUP.md)
- [Authentication Flow](./AUTH_FLOW_IMPLEMENTATION.md)

## Getting Help

If you continue to experience issues:

1. Check the browser console for error messages
2. Check the terminal/server logs for backend errors
3. Visit the Supabase dashboard to check logs
4. Review the test connection page results
5. Open an issue in the GitHub repository

## Security Notes

- Never commit your `.env.local` file
- Never share your service role key
- The anon key is safe to use in the browser
- Row Level Security (RLS) protects user data in the database
