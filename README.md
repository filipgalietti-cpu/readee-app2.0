# Readee - Early Reading Learning Platform

A comprehensive early reading platform built with Next.js and Supabase, featuring a structured learning path, practice sessions with spaced repetition, and a library of decodable stories for early readers (ages 4–8).

## 🚨 Recent Updates

**Login Error Messages Improved** (Latest)
- Added proper environment variable validation
- Login now shows clear error messages if Supabase is not configured
- See [ENV_SETUP.md](./ENV_SETUP.md) for quick setup instructions
- If you see "Missing Supabase environment variables", check your `.env.local` file

## Features

### 🎯 Learning Path (`/path`)
- Vertical progression through content units
- Track progress through lessons
- View completed lessons and scores
- Expandable units showing all available lessons

### 📚 Practice Engine (`/lesson/[lessonId]`)
- **4 Item Types:**
  - **Phoneme Tap**: Identify sounds in words
  - **Word Build**: Construct words from letters
  - **Multiple Choice**: Select correct answers
  - **Comprehension**: Reading comprehension questions
- Immediate feedback and retry logic
- Spaced repetition: ~60–70% new items + ~30–40% review items
- Progress tracking and scoring

### 📖 Story Library (`/library`)
- Decodable stories for early readers
- Stories unlock based on progress
- Grade-level indicators
- Rich metadata and descriptions

### 🎧 Story Reader (`/reader/[storyId]`)
- Page-by-page story rendering
- Word-by-word highlighting (simulated timing)
- Audio playback simulation
- Navigation between pages

### 🔐 Authentication
- Email/password authentication via Supabase
- Google OAuth integration
- Protected routes with authentication guards
- Profile management

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **TypeScript**: Full type safety

## Quick Start

⚠️ **Important:** Login functionality requires proper Supabase configuration. See [SUPABASE_CONNECTION_GUIDE.md](./SUPABASE_CONNECTION_GUIDE.md) for detailed setup instructions.

### Prerequisites
- Node.js 20+ and npm
- Docker Desktop (for local Supabase)

### Fastest Setup (Local Development)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd readee-app2.0
npm install

# 2. Run the automated setup script
npm run setup:supabase

# 3. Start the dev server
npm run dev
```

That's it! The script will:
- ✅ Start local Supabase
- ✅ Configure environment variables
- ✅ Run database migrations
- ✅ Set everything up for you

Visit `http://localhost:3000/test-connection` to verify your connection.

### Alternative: Manual Setup

#### Option 1: Local Supabase (Recommended for Development)

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Start local Supabase
npx supabase start

# Your .env.local is already configured with local credentials!
# Just start the app:
npm run dev
```

#### Option 2: Remote Supabase (For Production)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials from Settings → API
3. Update `.env.local` with your credentials
4. Run migrations in the SQL Editor
5. Start the app: `npm run dev`

See [SUPABASE_CONNECTION_GUIDE.md](./SUPABASE_CONNECTION_GUIDE.md) for detailed instructions.

### 4. Create Your First User

1. Navigate to `http://localhost:3000/signup`
2. Create an account
3. Complete the onboarding flow
4. Start exploring the platform!

## Documentation

- [🚀 Supabase Connection Guide](./SUPABASE_CONNECTION_GUIDE.md) - **Start here to connect to Supabase**
- [📋 Complete Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [🏗️ Architecture Overview](./ARCHITECTURE.md) - System design and patterns
- [🔒 Authentication Flow](./AUTH_FLOW_IMPLEMENTATION.md) - How auth and routing works
- [⚙️ Backend Setup](./BACKEND_SETUP.md) - API endpoints and database details
- [🔒 Security Summary](./SECURITY_SUMMARY.md) - Security considerations

## Troubleshooting

### Login not working?

If clicking "Sign In" does nothing, check:
1. `.env.local` file exists with valid Supabase credentials
2. Database migrations have been run
3. `proxy.ts` file exists in the root directory
4. Visit `/test-connection` to diagnose connection issues

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting tips.

## Project Structure

```
readee-app2.0/
├── app/                      # Next.js app directory
│   ├── (public)/            # Public routes (login, signup)
│   ├── (protected)/         # Protected routes (dashboard, etc.)
│   ├── api/                 # API routes
│   ├── components/          # Reusable components
│   ├── lesson/              # Practice engine
│   ├── library/             # Story library
│   ├── path/                # Learning path
│   └── reader/              # Story reader
├── lib/
│   ├── auth/                # Authentication helpers
│   ├── db/                  # Database types and repositories
│   └── supabase/            # Supabase clients (DO NOT DELETE)
├── proxy.ts                 # Authentication middleware (CRITICAL - DO NOT DELETE)
├── supabase/                # Database migrations
└── public/                  # Static assets
```

## Contributing

This is a private educational project. For questions or issues, please contact the repository owner.

## License

Private - All rights reserved