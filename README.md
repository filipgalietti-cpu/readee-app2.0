# Readee - Early Reading Learning Platform

A comprehensive early reading platform built with Next.js and Supabase, featuring a structured learning path, practice sessions with spaced repetition, and a library of decodable stories for early readers (ages 4–8).

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

⚠️ **Important:** Login functionality requires proper Supabase configuration. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

### Prerequisites
- Node.js 20+ and npm
- A Supabase account (create one at supabase.com)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd readee-app2.0
npm install
```

### 2. Configure Supabase

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

2. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Run database migrations in your Supabase SQL Editor (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/test-connection` to verify your Supabase connection.

### 4. Create Your First User

1. Navigate to `http://localhost:3000/signup`
2. Create an account
3. Complete the onboarding flow
4. Start exploring the platform!

## Documentation

- [📋 Complete Setup Guide](./SETUP_GUIDE.md) - **Start here for detailed setup instructions**
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