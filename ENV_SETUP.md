# Environment Setup Guide

## Quick Setup for Login

If you're seeing an error message like **"Missing Supabase environment variables"** when trying to login, follow these steps:

### 1. Create Environment File

Create a `.env.local` file in the root directory of the project:

```bash
touch .env.local
```

### 2. Add Your Supabase Credentials

Open `.env.local` and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Get Your Credentials

#### If you already have a Supabase project:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on the **Settings** icon (⚙️) in the left sidebar
4. Click on **API**
5. Copy the following values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

#### If you don't have a Supabase project yet:

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the project details:
   - Choose an organization
   - Give your project a name
   - Set a database password (save this!)
   - Select a region close to you
4. Wait for the project to be created (~2 minutes)
5. Once created, follow the steps above to get your credentials

### 4. Run Database Migrations

After setting up your environment variables, you need to set up the database schema:

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Open the file `supabase/migrations/001_initial_schema.sql` from this project
3. Copy all its contents
4. Paste into the SQL Editor in Supabase
5. Click **Run**
6. Repeat for any other migration files in the `supabase/migrations/` folder

### 5. Restart the Development Server

After creating `.env.local`, you must restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

### 6. Test Your Login

Now you should be able to:
1. Navigate to `http://localhost:3000/signup`
2. Create a new account with your email and password
3. Complete the onboarding process
4. Login successfully!

## Testing the Connection

Visit `http://localhost:3000/test-connection` to verify your Supabase configuration is correct. All tests should pass.

## Common Issues

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the project root (not in a subfolder)
- Make sure all three variables are set correctly
- Restart your dev server after creating/editing `.env.local`

### "Invalid login credentials" error
- This means your Supabase connection is working!
- The email/password combination is incorrect
- Try creating a new account at `/signup`
- Or reset your password in Supabase dashboard

### Connection test fails
- Check that your Supabase project is active (not paused)
- Verify you copied the credentials correctly (no extra spaces)
- Make sure you're using the correct project URL format: `https://xxxxx.supabase.co`

## Security Notes

- `.env.local` is already in `.gitignore` and will not be committed to Git
- Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- The `NEXT_PUBLIC_*` variables are safe to use in the browser
- Keep your database password secure

## For Existing Users

If you previously had login working and it suddenly stopped:

1. Check if `.env.local` file exists and has the correct values
2. Check if your Supabase project is still active (free tier projects can be paused)
3. Verify your Supabase credentials haven't changed
4. Try the test connection page to diagnose: `/test-connection`

## Need Help?

- Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more detailed instructions
- Check the [QUICK_FIX_CHECKLIST.md](./QUICK_FIX_CHECKLIST.md) for a step-by-step guide
- Visit the test connection page: `/test-connection`
