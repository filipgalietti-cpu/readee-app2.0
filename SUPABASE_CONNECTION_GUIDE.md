# 🚀 Supabase Connection Guide

This guide will help you connect your Readee app to Supabase. You have two options:
1. **Local Supabase** (Recommended for development) - Fast setup, runs on your machine
2. **Remote Supabase** (For production) - Hosted in the cloud

---

## Option 1: Local Supabase Setup (Recommended) ⚡

Perfect for development and testing. Everything runs on your machine.

### Prerequisites
- Docker Desktop installed and running
- Node.js and npm installed

### Step 1: Install Supabase CLI

```bash
npm install supabase --save-dev
```

### Step 2: Start Local Supabase

```bash
npx supabase start
```

This will:
- Download and start all Supabase services in Docker
- Set up the database with migrations
- Show you the local credentials

**Important:** The first time you run this, it may take 5-10 minutes to download Docker images.

### Step 3: Copy the Credentials

After `supabase start` finishes, you'll see output like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Update `.env.local`

Open `.env.local` in the project root and update it with the local credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**Note:** The local anon key and service role key are always the same for local development.

### Step 5: Run Database Migrations

The migrations should run automatically when you start Supabase. To verify or re-run them:

```bash
npx supabase db reset
```

### Step 6: Start the App

```bash
npm run dev
```

### Step 7: Test the Connection

Visit: http://localhost:3000/test-connection

All tests should pass! ✅

### Step 8: Access Supabase Studio

Visit: http://127.0.0.1:54323

This is the local Supabase dashboard where you can:
- View your database tables
- Run SQL queries
- Manage authentication
- View storage buckets

### Stopping Local Supabase

When you're done developing:

```bash
npx supabase stop
```

---

## Option 2: Remote Supabase Setup 🌐

Use this for production or if you prefer a hosted solution.

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Organization:** Choose or create one
   - **Name:** `readee-app` (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose the closest region to you
5. Click **"Create new project"**
6. Wait ~2 minutes for the project to be created

### Step 2: Get Your Credentials

1. In your Supabase project dashboard, click **Settings** (⚙️) in the sidebar
2. Click **API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Update `.env.local`

Open `.env.local` in the project root and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run Database Migrations

You have two options:

#### Option A: Using SQL Editor (Recommended for first-time setup)

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New query"**
3. Open `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy all its contents
5. Paste into the SQL Editor
6. Click **Run**
7. Repeat for `supabase/migrations/002_add_onboarding_complete.sql`

#### Option B: Using Supabase CLI

1. Install Supabase CLI: `npm install supabase --save-dev`
2. Login: `npx supabase login`
3. Link to your project: `npx supabase link --project-ref your-project-ref`
   - Get your project ref from the project URL: `https://[project-ref].supabase.co`
4. Push migrations: `npx supabase db push`

### Step 5: Restart the App

```bash
npm run dev
```

### Step 6: Test the Connection

Visit: http://localhost:3000/test-connection

All tests should pass! ✅

---

## Quick Setup Script 🎯

For the fastest local setup, run this one command:

```bash
npm run setup:supabase
```

This script will:
1. Check if Docker is running
2. Install Supabase CLI
3. Start local Supabase
4. Update your `.env.local` with local credentials
5. Run migrations
6. Test the connection

---

## Troubleshooting 🔧

### "Missing Supabase environment variables" Error

✅ **This is expected!** It means the code is working correctly.

**Solution:**
1. Check that `.env.local` exists in the project root
2. Verify all three environment variables are set
3. Restart your dev server: `npm run dev`

### "Cannot connect to Docker" Error (Local Setup)

**Solution:**
1. Make sure Docker Desktop is installed and running
2. Check Docker is running: `docker ps`
3. Restart Docker Desktop if needed

### Local Supabase Won't Start

**Solution:**
1. Check ports aren't in use: `lsof -i :54321` (Mac/Linux) or `netstat -ano | findstr :54321` (Windows)
2. Stop any conflicting services
3. Try: `npx supabase stop` then `npx supabase start`

### Migration Errors

**Solution:**
1. Reset the database: `npx supabase db reset` (local) or re-run migrations (remote)
2. Check migration files for syntax errors
3. Make sure you're running migrations in order

### Connection Test Fails

**Solution:**
1. Verify `.env.local` has correct credentials
2. Check Supabase is running (local) or project is active (remote)
3. For local: Visit http://127.0.0.1:54323 to check Supabase Studio
4. For remote: Check project status in Supabase dashboard
5. Look at browser console (F12) for detailed error messages

### "Invalid login credentials" Error

✅ **Great news!** Your Supabase connection is working.

**Solution:**
- This means your credentials are incorrect, not your setup
- Try creating a new account at `/signup`
- Or reset your password in Supabase dashboard

---

## What's Next? 🎉

Once connected, you can:

1. **Create an Account**
   - Visit: http://localhost:3000/signup
   - Use any email and password

2. **Login**
   - Visit: http://localhost:3000/login
   - Use the credentials you just created

3. **Explore the App**
   - Complete onboarding
   - Browse the library
   - Start reading!

4. **View Your Data**
   - Local: http://127.0.0.1:54323 (Supabase Studio)
   - Remote: https://app.supabase.com/project/_/editor

---

## Useful Commands 📝

### Local Supabase
```bash
npx supabase start        # Start local Supabase
npx supabase stop         # Stop local Supabase
npx supabase status       # Check status
npx supabase db reset     # Reset database and re-run migrations
```

### Remote Supabase
```bash
npx supabase login        # Login to Supabase
npx supabase link         # Link to your project
npx supabase db push      # Push migrations to remote
npx supabase db pull      # Pull schema from remote
```

### Application
```bash
npm run dev               # Start dev server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run linter
```

---

## Need Help? 🆘

- Check the [Supabase Docs](https://supabase.com/docs)
- Visit `/test-connection` to diagnose issues
- Check `TROUBLESHOOTING.md` for more help
- Look at browser console (F12) for error details

---

## Security Notes 🔒

- ✅ `.env.local` is in `.gitignore` and won't be committed
- ⚠️ Never share your `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_*` variables are safe for the browser
- ⚠️ Don't commit `.env.local` to version control
- ✅ Use different credentials for development and production

---

**Status:** Ready to connect! Choose your setup option above and get started. 🚀
