# Backend Implementation - Quick Start Guide

This guide provides instructions for setting up and using the Readee backend.

## Prerequisites

- Node.js 18+ installed
- A Supabase project created at [supabase.com](https://supabase.com)
- Supabase project credentials (URL, anon key, service role key)

## Setup Instructions

### 1. Database Setup

1. Log into your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the migration

This will create:
- All database tables (profiles, children, onboarding_preferences, stories, reading_progress)
- Row Level Security policies
- Indexes for performance
- Helper functions
- Sample seed data

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Never commit the service role key to version control!

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Complete Onboarding
**POST** `/api/onboarding/complete`

Create a user profile and save onboarding preferences.

```bash
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Jane Doe",
    "role": "parent",
    "favoriteColor": "blue",
    "favoriteColorHex": "#0000FF",
    "interests": ["animals", "space"]
  }'
```

### Get Library Stories
**GET** `/api/library?readingLevel=1&interests=animals,space&limit=10`

Fetch stories filtered by reading level and interests.

```bash
curl http://localhost:3000/api/library?readingLevel=1&interests=animals,space
```

### Update Reading Progress
**POST** `/api/progress/update`

Track a child's reading progress.

```bash
curl -X POST http://localhost:3000/api/progress/update \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child-uuid",
    "storyId": "story-uuid",
    "lastPageRead": 5,
    "completed": false
  }'
```

### Get Child Progress
**GET** `/api/progress/[childId]`

Get all reading progress for a specific child.

```bash
curl http://localhost:3000/api/progress/child-uuid
```

## Architecture

The backend follows a clean, layered architecture:

```
├── lib/
│   ├── auth/                 # Authentication helpers
│   ├── db/
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── repositories/     # Data access layer
│   └── supabase/             # Supabase client config
└── app/api/                  # API route handlers
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Key Features

### ✅ Type-Safe Database Access
All database operations are strongly typed with TypeScript interfaces.

### ✅ Row Level Security (RLS)
- Parents can only access their own children
- Users can only modify their own data
- Stories are publicly readable but only admins can modify

### ✅ Repository Pattern
All database queries are abstracted into reusable repository functions:
- `getChildProfiles(parentId)`
- `saveOnboardingPreferences(params)`
- `updateReadingProgress(params)`
- `getStories(filters)`

### ✅ Error Handling
Consistent error responses across all API routes:
```json
{
  "success": false,
  "error": "Error message"
}
```

### ✅ Future-Proof Design
The schema supports:
- Multiple children per parent (already implemented)
- Adaptive difficulty (add columns as needed)
- Educator/classroom accounts (role field + additional tables)

## Testing the Backend

### Manual Testing

1. **Create a user account** via Supabase Auth
2. **Complete onboarding** using the `/api/onboarding/complete` endpoint
3. **Verify RLS** by trying to access another user's data (should fail)
4. **Test pagination** on the library endpoint

### Database Verification

Check that RLS is working:

```sql
-- In Supabase SQL Editor
SELECT * FROM profiles; -- Should only return your profile
SELECT * FROM children WHERE parent_id = auth.uid(); -- Should only return your children
```

## Common Issues

### "Unauthorized" Error
- Make sure you're authenticated via Supabase Auth
- Verify your session cookies are being sent

### "Profile not found"
- Complete onboarding first using `/api/onboarding/complete`

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Check that your `tsconfig.json` has path aliases configured

## Next Steps

1. **Add sample stories** to the database for testing
2. **Integrate with frontend** components
3. **Add authentication UI** if not already present
4. **Set up error monitoring** (e.g., Sentry)
5. **Configure rate limiting** for production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) file
2. Review the inline code documentation
3. Open an issue in the repository
