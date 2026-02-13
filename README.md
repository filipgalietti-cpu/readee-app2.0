# Readee - Early Reading Learning Platform

A comprehensive learning platform built with Next.js, featuring a structured learning path, practice sessions with spaced repetition, and a library of decodable stories.

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
- Spaced repetition: 60-70% new items + 30-40% review items
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

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account ([create one here](https://supabase.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd readee-app2.0
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your credentials
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control. The service role key must remain server-side only.

### 3. Run Database Migrations

Run these SQL files in your Supabase SQL Editor (in order):

1. **`supabase-migration-profiles.sql`** - User profiles table
2. **`supabase-migration-learning-content.sql`** - Content, story, and progress tables
3. **`supabase-seed-data.sql`** - Sample content (3 units, 10 lessons, 30 items, 5 stories)

Each file includes:
- Table creation
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update triggers

### 4. Enable Google OAuth (Optional)

1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add authorized redirect URL: `http://localhost:3000/auth/callback`
4. Configure Google OAuth credentials

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
readee-app2.0/
├── app/
│   ├── (protected)/          # Protected routes (require auth)
│   │   └── dashboard/
│   ├── (public)/            # Public routes
│   │   ├── login/
│   │   └── signup/
│   ├── api/                 # API routes (server-side)
│   │   ├── content/         # Units, lessons, items
│   │   ├── progress/        # User progress tracking
│   │   └── stories/         # Story library
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI primitives (Button, Card, etc.)
│   │   ├── practice/       # Practice item renderers
│   │   └── auth/           # Auth components
│   ├── lesson/             # Lesson practice sessions
│   │   └── [lessonId]/
│   ├── library/            # Story library
│   ├── path/               # Learning path
│   ├── reader/             # Story reader
│   │   └── [id]/
│   └── welcome/            # Onboarding flow
├── lib/
│   └── supabase/           # Supabase clients
│       ├── client.ts       # Browser client (anon key)
│       ├── server.ts       # Server client (with cookies)
│       └── admin.ts        # Admin client (service role)
├── supabase-migration-*.sql  # Database migrations
└── supabase-seed-data.sql    # Sample content
```

## Database Schema

### Content Tables
- `content_units` - Learning units (e.g., "Short Vowels")
- `content_lessons` - Lessons within units
- `content_items` - Practice items within lessons

### Story Tables
- `stories` - Decodable stories
- `story_pages` - Pages with content and word timings

### Progress Tables
- `user_progress` - Lesson completion and scores
- `user_item_history` - Spaced repetition tracking

### User Tables
- `profiles` - User profiles and onboarding data

## Key Features Explained

### Spaced Repetition

The practice engine implements spaced repetition:
- Each user response is recorded in `user_item_history`
- Items are scheduled for review based on performance
- Sessions mix 60-70% new content with 30-40% review items
- Correct answers → review in 1 day
- Incorrect answers → review in 1 hour

### Story Unlocking

Stories can be locked until users complete certain units:
- Set `unlock_after_unit_id` in the `stories` table
- Stories unlock when all lessons in the prerequisite unit are completed
- The library shows locked/unlocked status

### Row Level Security (RLS)

All tables use RLS policies:
- Content tables are readable by all authenticated users
- Progress tables enforce user-specific access
- Service role bypasses RLS for admin operations

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |

## Development

### Adding New Item Types

1. Add type to `ItemType` in `ItemRenderer.tsx`
2. Create a render function (e.g., `renderNewType()`)
3. Add to `renderContent()` switch statement
4. Update database schema if needed

### Adding New Routes

1. Create folder in `app/` directory
2. Add `page.tsx` for the route
3. Use `"use client"` if client-side features needed
4. Protected routes go in `(protected)` folder

### Linting

```bash
npm run lint
```

## Troubleshooting

### Build Errors

If you get Tailwind CSS errors:
- Ensure you're using Tailwind v4
- Check that `postcss.config.mjs` includes `@tailwindcss/postcss`

### Database Connection Issues

- Verify environment variables are set
- Check Supabase project is active
- Ensure RLS policies allow your operations

### Authentication Issues

- Verify callback URL is configured
- Check that auth routes are in `(public)` folder
- Ensure OnboardingGuard publicPaths include auth routes

## License

This project is private and not licensed for public use.

## Support

For questions or issues, please contact the development team.
