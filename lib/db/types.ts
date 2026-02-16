/**
 * Database types for Readee application
 * These types match the Supabase schema defined in migrations/001_initial_schema.sql
 */

export type UserRole = 'parent' | 'child' | 'educator';

export interface Profile {
  id: string; // UUID - matches auth.users.id
  display_name: string;
  role: UserRole;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string; // UUID
  parent_id: string; // UUID - references auth.users.id
  first_name: string;
  grade: string | null;
  reading_level: string | null;
  xp: number;
  stories_read: number;
  streak_days: number;
  created_at: string;
}

export interface Assessment {
  id: string; // UUID
  child_id: string; // UUID - references children.id
  grade_tested: string;
  score_percent: number;
  reading_level_placed: string;
  answers: any; // JSONB
  completed_at: string;
}

export interface OnboardingPreferences {
  id: string; // UUID
  user_id: string; // UUID - references profiles.id
  favorite_color: string | null;
  favorite_color_hex: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string; // UUID
  title: string;
  reading_level: number; // 1-10
  interest_tags: string[];
  content: any; // JSONB - flexible story content structure
  thumbnail_url: string | null;
  total_pages: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  id: string; // UUID
  child_id: string; // UUID - references children.id
  story_id: string; // UUID - references stories.id
  last_page_read: number;
  completed: boolean;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ═══════════════════════════════════════════════════════════
// Request/Response Types for API Routes
// ═══════════════════════════════════════════════════════════

export interface OnboardingCompleteRequest {
  displayName: string;
  role: UserRole;
  favoriteColor?: string;
  favoriteColorHex?: string;
  interests?: string[];
}

export interface OnboardingCompleteResponse {
  success: boolean;
  profile: Profile;
  preferences?: OnboardingPreferences;
  message?: string;
}

export interface LibraryFilters {
  readingLevel?: number;
  interests?: string[];
  limit?: number;
  offset?: number;
}

export interface LibraryResponse {
  success: boolean;
  stories: Story[];
  total: number;
}

export interface ProgressUpdateRequest {
  childId: string;
  storyId: string;
  lastPageRead: number;
  completed?: boolean;
}

export interface ProgressUpdateResponse {
  success: boolean;
  progress: ReadingProgress;
  message?: string;
}

export interface ChildProgressResponse {
  success: boolean;
  child: Child;
  progress: ReadingProgress[];
  stats: {
    totalStoriesStarted: number;
    totalStoriesCompleted: number;
    currentStreak: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Helper Types
// ═══════════════════════════════════════════════════════════

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = T | ApiError;

// Type guards
export function isApiError(response: any): response is ApiError {
  return response && response.success === false && 'error' in response;
}
