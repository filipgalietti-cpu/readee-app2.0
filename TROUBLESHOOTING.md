# Login Troubleshooting Checklist

Use this checklist to diagnose and fix login issues.

## Step 1: Check Environment Variables ⚙️

- [ ] Does `.env.local` file exist in the project root?
  ```bash
  ls -la .env.local
  ```
  
- [ ] Does it have all three required variables?
  ```bash
  cat .env.local
  ```
  Should contain:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`

- [ ] Are the values correct (no typos, extra spaces, quotes)?

**If missing:** Follow [ENV_SETUP.md](./ENV_SETUP.md)

## Step 2: Restart Development Server 🔄

After creating or modifying `.env.local`, you MUST restart the server:

- [ ] Stop the current server (press `Ctrl+C`)
- [ ] Start it again:
  ```bash
  npm run dev
  ```

## Step 3: Test Supabase Connection 🔌

Visit the test connection page:

- [ ] Go to: `http://localhost:3000/test-connection`
- [ ] Check results:
  - ✅ Environment Variables: **passed**
  - ✅ Regular Client Connection: **passed**
  - ⚠️ Admin Client Connection: **passed** or **warning** (optional)

**If tests fail:** Check your Supabase credentials in the dashboard

## Step 4: Check Database Setup 🗄️

- [ ] Have you run the database migrations?
  - In Supabase dashboard → SQL Editor
  - Run `supabase/migrations/001_initial_schema.sql`
  - Run `supabase/migrations/002_add_onboarding_complete.sql`

**If not done:** See "Run Database Migrations" in [ENV_SETUP.md](./ENV_SETUP.md)

## Step 5: Try to Login 🔐

Go to: `http://localhost:3000/login`

### Scenario A: See "Missing Supabase environment variables" error
✅ **This is the improved error message from the fix!**

**Solution:**
- Go back to Step 1 above
- Make sure `.env.local` exists and has correct values
- Restart dev server (Step 2)

### Scenario B: See "Invalid login credentials" error
✅ **Great! Your Supabase connection is working!**

This means:
- Environment variables are configured correctly ✅
- Supabase connection is working ✅
- The email/password is incorrect ❌

**Solutions:**
1. **Create a new account:**
   - Go to: `http://localhost:3000/signup`
   - Use email: `filip.galietti@gmail.com`
   - Use password: `12345678` (or any password ≥8 chars)
   
2. **Check if account exists:**
   - Go to Supabase dashboard
   - Authentication → Users
   - Look for your email
   
3. **Reset password:**
   - In Supabase dashboard
   - Authentication → Users
   - Click on user → Send password reset email

### Scenario C: Nothing happens when clicking "Sign In"
This suggests a JavaScript error. 

**Check browser console:**
- Press `F12` (or right-click → Inspect)
- Go to Console tab
- Click "Sign In" button again
- Look for error messages

**Common causes:**
- Browser cached old code → Hard refresh (`Ctrl+Shift+R`)
- JavaScript disabled → Enable it
- Network error → Check internet connection

### Scenario D: Page redirects to `/test-connection` automatically
This means environment variables are missing.

**Solution:**
- Follow Step 1 above to configure `.env.local`
- Restart server (Step 2)

## Step 6: Create New Account 👤

If you don't have an account yet, create one:

- [ ] Go to: `http://localhost:3000/signup`
- [ ] Enter email: `filip.galietti@gmail.com`
- [ ] Enter password: `12345678` (or any password ≥8 chars)
- [ ] Confirm password
- [ ] Click "Sign Up"

**Expected:**
- Redirected to `/login` with success message
- Can now login with those credentials

## Step 7: Verify in Supabase Dashboard 🔍

Check that the account was created:

- [ ] Go to: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Select your project
- [ ] Click "Authentication" → "Users"
- [ ] Look for email: `filip.galietti@gmail.com`

**If user exists:**
- You can login with that password
- If you forgot the password, reset it in the dashboard

**If user doesn't exist:**
- The signup didn't work
- Check database migrations were run (Step 4)
- Check Supabase logs for errors

## Common Error Messages Explained

### "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
**Meaning:** `.env.local` is missing or incomplete

**Fix:** 
1. Create `.env.local` file
2. Add your Supabase credentials
3. Restart dev server

### "Invalid login credentials"
**Meaning:** Supabase connection works, but email/password is wrong

**Fix:**
1. Double-check email and password
2. Create a new account if needed
3. Reset password in Supabase dashboard

### "An unexpected error occurred. Please try again."
**Meaning:** Some other error (network issue, Supabase outage, etc.)

**Fix:**
1. Check browser console for details
2. Check Supabase status: [status.supabase.com](https://status.supabase.com)
3. Verify internet connection
4. Check Supabase logs in dashboard

## Quick Debug Commands

```bash
# Check if .env.local exists
ls -la .env.local

# View .env.local contents (hide sensitive data when sharing)
cat .env.local

# Check if dev server is running
curl http://localhost:3000/api/test-connection

# Check for TypeScript/build errors
npm run build

# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

## Still Having Issues?

If you've completed all steps above and still can't login:

1. **Check the files:**
   - `LOGIN_FIX_DETAILED.md` - Technical details about the fix
   - `ENV_SETUP.md` - Environment setup guide
   - `SETUP_GUIDE.md` - Complete setup guide
   - `QUICK_FIX_CHECKLIST.md` - Quick fix steps

2. **Get detailed logs:**
   - Browser console (F12 → Console)
   - Server console (where you ran `npm run dev`)
   - Supabase dashboard → Logs

3. **Verify versions:**
   ```bash
   node --version  # Should be 20+
   npm --version
   ```

4. **Check Supabase project:**
   - Is it active (not paused)?
   - Are RLS policies set up?
   - Did migrations run successfully?

## Success Checklist ✅

When everything works, you should be able to:

- [x] Visit `/test-connection` → All tests pass
- [x] Visit `/signup` → Create an account successfully
- [x] Visit `/login` → Login successfully
- [x] Complete onboarding flow
- [x] See the dashboard
- [x] Logout and login again

---

**Last Updated:** February 2026  
**Related to PR:** Fix login error messages by adding environment variable validation
