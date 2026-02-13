# Readee - Early Reader Learning Platform

A Duolingo-style reading application for early readers (ages 4-8) built with Next.js 16 and Supabase.

## 🎯 Features

- **Personalized Learning**: Adaptive reading levels and personalized story recommendations
- **Progress Tracking**: Track reading progress, completion, and daily streaks
- **Multi-Child Support**: Parents can manage multiple children's profiles
- **Secure Backend**: Row Level Security ensuring data privacy
- **Type-Safe**: Full TypeScript implementation with type-safe database access

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Backend Setup

1. **Set up the database**:
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Then add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

For detailed setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md).

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture overview and design patterns
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Quick start guide and API documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's included in the backend
- **[SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)** - Security measures and best practices
- **[lib/db/USAGE_EXAMPLES.tsx](./lib/db/USAGE_EXAMPLES.tsx)** - Code examples for using the backend

## 🏗️ Architecture

```
readee-app2.0/
├── supabase/migrations/       # Database schema and migrations
├── lib/
│   ├── auth/                  # Authentication helpers
│   ├── db/
│   │   ├── types.ts           # TypeScript types
│   │   └── repositories/      # Data access layer
│   └── supabase/              # Supabase client configuration
└── app/api/                   # API routes
    ├── onboarding/            # User onboarding
    ├── library/               # Story library
    └── progress/              # Reading progress tracking
```

## 🔐 Security

The backend implements comprehensive security measures:

- **Row Level Security (RLS)** on all tables
- **Authentication checks** in all API routes
- **Ownership verification** for child-related operations
- **Input validation** and type safety
- **No SQL injection** vulnerabilities

See [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) for details.

## 🛠️ API Routes

- `POST /api/onboarding/complete` - Complete user onboarding
- `GET /api/library` - Get stories with filters
- `POST /api/progress/update` - Update reading progress
- `GET /api/progress/[childId]` - Get child's progress and stats

## 💾 Database Schema

- **profiles** - User profiles with role (parent/child/educator)
- **children** - Child profiles linked to parents
- **onboarding_preferences** - User preferences
- **stories** - Story content and metadata
- **reading_progress** - Reading progress tracking

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## 📈 Future Roadmap

- ✅ Multiple children per parent
- 📋 Adaptive difficulty based on performance
- 👨‍🏫 Educator/classroom accounts
- 🎮 Interactive reading exercises
- 🏆 Achievement system

## 🤝 Contributing

Contributions are welcome! Please read the documentation before making changes.

## 📄 License

This project is private and proprietary.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
