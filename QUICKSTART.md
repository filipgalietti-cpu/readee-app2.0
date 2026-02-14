# 🚀 Quick Start: Connect to Supabase

This is a 2-minute guide to get you connected to Supabase and start developing.

## TL;DR - One Command Setup

```bash
npm run setup:supabase
npm run dev
```

Visit http://localhost:3000/test-connection ✅

That's it! 🎉

---

## What You Get

- ✅ Local Supabase running in Docker
- ✅ All database tables and migrations set up
- ✅ Environment variables configured
- ✅ Ready to create accounts and login

---

## Step-by-Step (Manual Setup)

If you prefer to do it manually or the automated script doesn't work:

### 1. Choose Your Setup

**Option A: Local Supabase** (Recommended for development)
- Runs on your computer
- No account needed
- Fast and private

**Option B: Remote Supabase** (Production)
- Hosted in the cloud
- Requires a Supabase account
- Good for production/deployment

### 2. Local Setup (5 minutes)

```bash
# Start local Supabase
npx supabase start

# Your .env.local is already configured!
# Just start the app
npm run dev
```

### 3. Remote Setup (10 minutes)

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials from Settings → API
3. Update `.env.local` with your credentials
4. Run migrations in SQL Editor (see SUPABASE_CONNECTION_GUIDE.md)
5. Start app: `npm run dev`

---

## Verify Setup

```bash
# Validate configuration
npm run validate:supabase

# Start dev server
npm run dev

# Visit test page
# http://localhost:3000/test-connection
```

All checks should pass ✅

---

## Next Steps

1. **Create Account**: http://localhost:3000/signup
2. **Login**: http://localhost:3000/login
3. **Start Building!**

---

## Useful Commands

```bash
npm run setup:supabase      # Automated local setup
npm run validate:supabase   # Check configuration
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase
npm run supabase:status     # Check status
```

---

## Troubleshooting

### "Missing Supabase environment variables"
✅ Expected! Run `npm run setup:supabase`

### "Docker is not running"
⚠️ Start Docker Desktop

### "Connection test fails"
🔍 Run `npm run validate:supabase` for details

---

## Get Help

- 📖 [Full Setup Guide](./SUPABASE_CONNECTION_GUIDE.md)
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md)
- 🌐 [Supabase Docs](https://supabase.com/docs)

---

**Ready?** Run `npm run setup:supabase` and start coding! 🚀
