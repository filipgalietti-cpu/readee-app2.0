# ⚠️ CRITICAL FILES - DO NOT DELETE ⚠️

This document lists files that are **absolutely critical** for the Readee application to function properly. Deleting or breaking these files will cause the application to fail.

## Authentication & Core Infrastructure

### 🔴 CRITICAL - Application Will Break Without These

#### `/proxy.ts`
**Purpose:** Main authentication and routing middleware for Next.js 16  
**What it does:**
- Handles all authentication checks
- Redirects unauthenticated users to login
- Manages onboarding flow routing
- Syncs session cookies between client and server

**If deleted:** Login will not work, users cannot access the app, all routes will fail to load properly

---

#### `/lib/supabase/client.ts`
**Purpose:** Browser-side Supabase client  
**What it does:**
- Creates Supabase client for use in browser/client components
- Handles authentication state in the browser
- Manages database queries from the client side

**If deleted:** Login forms won't work, client-side authentication will fail, browser-based data fetching will break

---

#### `/lib/supabase/server.ts`
**Purpose:** Server-side Supabase client  
**What it does:**
- Creates Supabase client for server components and API routes
- Handles secure server-side authentication
- Manages database queries from the server side
- Handles cookie management for authentication

**If deleted:** Server-side authentication will fail, API routes will break, middleware authentication checks will fail

---

#### `/app/auth/callback/route.ts`
**Purpose:** OAuth callback handler  
**What it does:**
- Handles OAuth authentication redirects (e.g., Google Sign-In)
- Exchanges authorization codes for sessions
- Redirects users after successful authentication

**If deleted:** Google Sign-In and other OAuth methods will fail, magic link authentication will break

---

## Configuration Files

### 🟡 IMPORTANT - Application May Not Work Correctly Without These

#### `.env.local` (not in Git)
**Purpose:** Environment variables for local development  
**What it does:**
- Stores Supabase URL and API keys
- Contains sensitive credentials

**If deleted/missing:** Application cannot connect to Supabase, authentication and database operations will fail

**How to restore:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for instructions

---

#### `.env.example`
**Purpose:** Template for environment variables  
**What it does:**
- Shows developers which environment variables are needed
- Provides documentation for configuration

**If deleted:** New developers won't know how to configure the app

---

#### `package.json`
**Purpose:** Project dependencies and scripts  
**If deleted:** Cannot install dependencies or run the application

---

#### `next.config.ts`
**Purpose:** Next.js configuration  
**If deleted:** Application may not build or run correctly

---

#### `tsconfig.json`
**Purpose:** TypeScript configuration  
**If deleted:** TypeScript compilation will fail

---

## Database & Types

### 🟠 VERY IMPORTANT - Data Layer Will Break

#### `/lib/db/types.ts`
**Purpose:** TypeScript type definitions for database tables  
**If deleted:** Type safety is lost, database operations may have runtime errors

---

#### `/lib/db/repositories/*.ts`
**Purpose:** Database access layer  
**If deleted:** Cannot interact with database tables, data fetching will fail

---

#### `/supabase/migrations/*.sql`
**Purpose:** Database schema definitions  
**If deleted:** New Supabase projects won't have correct database structure

---

## API Routes

### 🟠 IMPORTANT - Backend Functionality

#### `/app/api/onboarding/complete/route.ts`
**Purpose:** Completes user onboarding  
**If deleted:** Users cannot finish onboarding, will be stuck on welcome page

---

#### `/app/api/test-connection/route.ts`
**Purpose:** Tests Supabase connection  
**If deleted:** Cannot diagnose connection issues

---

## How to Protect These Files

### For Developers

1. **Read the comments** at the top of critical files - they explain why the file is important
2. **Check git status** before committing to ensure you're not accidentally deleting critical files
3. **Use `.gitignore`** to prevent committing sensitive files like `.env.local`
4. **Review PRs carefully** to ensure critical files aren't being deleted

### For AI Tools (GitHub Copilot, etc.)

When using AI coding assistants:
1. Tell the AI to "preserve all files in `/lib/supabase/` and `proxy.ts`"
2. Review all suggested changes carefully
3. If an AI suggests deleting a file, check this document first
4. Use the `git diff` command to review changes before committing

## Recovery

If you accidentally delete a critical file:

1. **Check git history:**
   ```bash
   git log -- path/to/deleted/file.ts
   git checkout <commit-hash> -- path/to/deleted/file.ts
   ```

2. **Check the latest commit:**
   ```bash
   git checkout HEAD -- path/to/deleted/file.ts
   ```

3. **If all else fails:** Clone a fresh copy from the repository

## Verification Checklist

After any major changes, verify these files still exist and haven't been modified unintentionally:

```bash
# Run this command to check critical files
ls -la proxy.ts lib/supabase/client.ts lib/supabase/server.ts app/auth/callback/route.ts
```

Expected output: All files should be listed

## Questions?

If you're unsure whether a file is safe to delete or modify:
1. Check if it's listed in this document
2. Look for "DO NOT DELETE" or "CRITICAL" comments in the file
3. Search the codebase for imports/references to the file
4. When in doubt, **don't delete it** - ask for help instead

---

**Last Updated:** February 2026  
**Maintainer:** Repository owner

**Remember:** It's always easier to add code than to recover deleted code. When in doubt, create a backup or new branch before making changes!
