# Readee Backend Architecture

## Overview

This document describes the backend architecture for the Readee application, a Duolingo-style reading platform for early readers (ages 4-8). The backend is built with **Next.js 15 App Router** and **Supabase**.

## Folder Structure

```
readee-app2.0/
├── app/
│   └── api/                          # API Routes (Next.js App Router)
│       ├── onboarding/
│       │   └── complete/             # POST - Complete user onboarding
│       ├── library/                  # GET - Fetch stories with filters
│       └── progress/
│           ├── update/               # POST - Update reading progress
│           └── [childId]/            # GET - Get progress for a child
├── lib/
│   ├── auth/                         # Authentication helpers
│   │   └── helpers.ts                # getCurrentUser(), getUserProfile(), etc.
│   ├── db/
│   │   ├── types.ts                  # TypeScript types for database tables
│   │   └── repositories/             # Database access layer
│   │       ├── profiles.ts           # Profile CRUD operations
│   │       ├── children.ts           # Children CRUD operations
│   │       ├── onboarding.ts         # Onboarding preferences
│   │       ├── stories.ts            # Story queries and admin operations
│   │       └── progress.ts           # Reading progress tracking
│   └── supabase/                     # Supabase client configuration
│       ├── client.ts                 # Browser client (anon key)
│       ├── server.ts                 # Server client (with cookies)
│       └── admin.ts                  # Admin client (service role key)
└── supabase/
    └── migrations/                   # Database migrations
        └── 001_initial_schema.sql    # Initial schema with tables, RLS, and indexes
```

## Architecture Principles

### 1. Separation of Concerns

- **API Routes** (`/app/api/*`): Handle HTTP requests, validation, and authentication
- **Repositories** (`/lib/db/repositories/*`): Encapsulate all database operations
- **Auth Helpers** (`/lib/auth/helpers.ts`): Centralized authentication logic
- **Types** (`/lib/db/types.ts`): Single source of truth for TypeScript types

### 2. Security First

- **Row Level Security (RLS)** enabled on all tables
- **Admin operations** use service role key (never exposed to client)
- **User operations** use authenticated client (respects RLS)
- **Ownership verification** before allowing operations on children/progress

### 3. Repository Pattern

All database access is abstracted through repository functions:

```typescript
// ❌ DON'T - Direct database access in routes
const { data } = await supabase.from('children').select('*');

// ✅ DO - Use repository functions
const children = await getChildProfiles(parentId);
```

Benefits:
- Single source of truth for queries
- Easy to test and mock
- Consistent error handling
- Can add caching/optimization later

### 4. Type Safety

All database tables have corresponding TypeScript interfaces:
- `Profile`, `Child`, `OnboardingPreferences`, `Story`, `ReadingProgress`
- Request/Response types for API routes
- Type guards for API errors

## Database Schema

### Core Tables

1. **profiles** - User profiles with role-based access
2. **children** - Child profiles (linked to parent accounts)
3. **onboarding_preferences** - User preferences from onboarding
4. **stories** - Story content and metadata
5. **reading_progress** - Track which stories children are reading

### Indexes

- **Primary keys**: UUID on all tables
- **Foreign keys**: All relationships properly defined
- **Performance indexes**: On frequently queried columns (parent_id, reading_level, etc.)
- **GIN indexes**: For array searches (interests, interest_tags)

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Profiles**: Users can only see/edit their own profile
- **Children**: Parents can only see/edit their own children
- **Onboarding**: Users can only see/edit their own preferences
- **Stories**: Public read-only (authenticated users)
- **Progress**: Scoped to parent's children

## API Routes

### POST /api/onboarding/complete

Complete user onboarding by creating profile and saving preferences.

**Request:**
```json
{
  "displayName": "Jane Doe",
  "role": "parent",
  "favoriteColor": "blue",
  "favoriteColorHex": "#0000FF",
  "interests": ["animals", "space", "nature"]
}
```

**Response:**
```json
{
  "success": true,
  "profile": { /* Profile object */ },
  "preferences": { /* OnboardingPreferences object */ },
  "message": "Onboarding completed successfully"
}
```

### GET /api/library

Get stories filtered by reading level and interests.

**Query Params:**
- `readingLevel`: number (1-10)
- `interests`: comma-separated string
- `limit`: number (default 20)
- `offset`: number (default 0)

**Response:**
```json
{
  "success": true,
  "stories": [ /* Array of Story objects */ ],
  "total": 42
}
```

### POST /api/progress/update

Update reading progress for a child.

**Request:**
```json
{
  "childId": "uuid",
  "storyId": "uuid",
  "lastPageRead": 5,
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "progress": { /* ReadingProgress object */ },
  "message": "Progress updated successfully"
}
```

### GET /api/progress/[childId]

Get all progress for a specific child.

**Response:**
```json
{
  "success": true,
  "child": { /* Child object */ },
  "progress": [ /* Array of ReadingProgress objects */ ],
  "stats": {
    "totalStoriesStarted": 10,
    "totalStoriesCompleted": 3,
    "currentStreak": 5
  }
}
```

## Future-Proofing

### Multiple Children Per Parent

The current schema already supports this:

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id), -- One-to-many relationship
  name TEXT,
  age INTEGER,
  reading_level INTEGER
);
```

Usage:
```typescript
const children = await getChildProfiles(parentId);
// Returns array of all children
```

### Adaptive Difficulty

To support adaptive difficulty, add these columns to the `children` table:

```sql
ALTER TABLE children ADD COLUMN difficulty_adjustment INTEGER DEFAULT 0;
-- Allows reading_level to be dynamically adjusted (-2 to +2 from base level)

ALTER TABLE reading_progress ADD COLUMN accuracy_score DECIMAL;
ALTER TABLE reading_progress ADD COLUMN time_spent_seconds INTEGER;
-- Track performance metrics to adjust difficulty
```

Implementation:
```typescript
// In repositories/children.ts
export async function adjustDifficulty(
  childId: string,
  adjustment: number
): Promise<Child> {
  // Update difficulty_adjustment based on performance
}

// In repositories/progress.ts
export async function updateProgressWithMetrics(params: {
  childId: string;
  storyId: string;
  lastPageRead: number;
  accuracyScore?: number;
  timeSpentSeconds?: number;
}): Promise<ReadingProgress> {
  // Track metrics for adaptive learning
}
```

### Classroom / Educator Accounts

The schema supports this through the `role` field in profiles:

```typescript
type UserRole = 'parent' | 'child' | 'educator';
```

To fully implement educator support:

1. **Create `classrooms` table:**
```sql
CREATE TABLE classrooms (
  id UUID PRIMARY KEY,
  educator_id UUID REFERENCES profiles(id),
  name TEXT,
  grade_level INTEGER,
  created_at TIMESTAMPTZ
);
```

2. **Create `classroom_students` junction table:**
```sql
CREATE TABLE classroom_students (
  id UUID PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id),
  child_id UUID REFERENCES children(id),
  enrolled_at TIMESTAMPTZ,
  UNIQUE(classroom_id, child_id)
);
```

3. **Add RLS policies:**
```sql
-- Educators can view their classrooms
CREATE POLICY "Educators can view own classrooms"
  ON classrooms FOR SELECT
  USING (educator_id = auth.uid());

-- Educators can view progress for students in their classrooms
CREATE POLICY "Educators can view classroom progress"
  ON reading_progress FOR SELECT
  USING (
    child_id IN (
      SELECT child_id FROM classroom_students cs
      JOIN classrooms c ON cs.classroom_id = c.id
      WHERE c.educator_id = auth.uid()
    )
  );
```

4. **Add repository functions:**
```typescript
// lib/db/repositories/classrooms.ts
export async function getEducatorClassrooms(educatorId: string): Promise<Classroom[]>;
export async function getClassroomStudents(classroomId: string): Promise<Child[]>;
export async function getClassroomProgress(classroomId: string): Promise<ProgressSummary>;
```

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "OPTIONAL_ERROR_CODE"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized for this resource)
- `404`: Not Found
- `409`: Conflict (e.g., profile already exists)
- `500`: Internal Server Error

## Best Practices

1. **Always use repositories** - Never query Supabase directly from API routes
2. **Validate inputs** - Check all user inputs before processing
3. **Verify ownership** - Always verify users own the resources they're accessing
4. **Use admin client sparingly** - Only for operations that must bypass RLS
5. **Type everything** - Leverage TypeScript for compile-time safety
6. **Handle errors gracefully** - Return user-friendly error messages
7. **Log errors** - Use `console.error()` for debugging (consider structured logging in production)

## Testing Strategy

### Unit Tests
- Test repository functions with mock Supabase client
- Test auth helpers with mock user sessions

### Integration Tests
- Test API routes end-to-end with test database
- Verify RLS policies work correctly

### Manual Testing Checklist
- [ ] User can complete onboarding
- [ ] Parent can create child profiles
- [ ] Stories are filtered correctly by level/interests
- [ ] Progress is tracked accurately
- [ ] RLS prevents unauthorized access

## Deployment Checklist

Before deploying to production:

1. ✅ Run migration in Supabase SQL Editor
2. ✅ Set environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.)
3. ✅ Verify RLS policies are enabled
4. ✅ Test all API routes
5. ✅ Add sample stories to database
6. ✅ Set up error monitoring (e.g., Sentry)
7. ✅ Configure rate limiting on API routes
8. ✅ Review security best practices

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
