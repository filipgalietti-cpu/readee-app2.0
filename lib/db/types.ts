/**
 * Database types for Readee application
 * These types match the Supabase schema defined in migrations/001_initial_schema.sql
 */

export type UserRole = 'parent' | 'child' | 'student' | 'educator';

export interface Profile {
  id: string; // UUID - matches auth.users.id
  email: string | null;
  display_name: string | null;
  role: UserRole;
  plan: "free" | "premium" | "teacher_solo";
  onboarding_complete: boolean;
  tos_accepted_at: string | null;
  tos_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquippedItems {
  avatar?: string | null;
  outfit?: string | null;
  badge?: string | null;
  background?: string | null;
  theme?: string | null;
}

export type ChildOwnerType = 'parent' | 'classroom';

export interface Child {
  id: string; // UUID
  /**
   * Parent owner. Null when `owner_type === 'classroom'` — in that case
   * the student is owned by a teacher's classroom and never has a parent
   * account. Guaranteed non-null when `owner_type === 'parent'` (CHECK
   * constraint enforced in migration 027).
   */
  parent_id: string | null;
  owner_type: ChildOwnerType;
  /**
   * Set only when `owner_type === 'classroom'`. References classrooms.id.
   * CHECK constraint ensures this pairs correctly with owner_type.
   */
  owner_classroom_id: string | null;
  created_by_teacher: string | null;
  first_name: string;
  grade: string | null;
  reading_level: string | null;
  /** Content language preference. Defaults to 'en' if not set. */
  language?: "en" | "es";
  carrots: number;
  stories_read: number;
  streak_days: number;
  last_lesson_at: string | null;
  equipped_items: EquippedItems;
  /** Journey reward chests/trophy already opened (chest node ids + "__trophy__"),
   *  so each reward pays carrots exactly once. */
  opened_chests?: string[];
  created_at: string;
}

export interface ShopPurchase {
  id: string;
  child_id: string;
  item_id: string;
  purchased_at: string;
}

/**
 * One row per practice question answered. Captured by the practice
 * CompletionScreen save effect. Drives the adaptive review feature
 * (`lib/adaptive/weak-spots.ts`) — count attempts + correct per
 * (child_id, standard_id) over a time window to find tricky spots.
 * Recorded for ALL kids (free + premium); the premium gate lives in
 * the UI (only paid accounts see the Sharpen Up tile + targeted
 * practice action). See migration 112_practice_answers.sql.
 */
export interface PracticeAnswer {
  id: string;
  child_id: string;
  question_id: string;
  standard_id: string;
  /** mcq | sentence_build | category_sort | tap_to_pair | sound_machine | missing_word | space_insertion */
  type: string;
  was_correct: boolean;
  answered_at: string;
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

export interface LessonProgress {
  id: string; // UUID
  child_id: string; // UUID - references children.id
  lesson_id: string;
  section: 'learn' | 'practice' | 'read';
  score: number;
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
// Classroom (teacher-facing product) — v1, migration 022
// ═══════════════════════════════════════════════════════════

export type GradeLevel = 'K' | '1st' | '2nd' | '3rd' | '4th' | 'Mixed';

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  grade_level: GradeLevel | null;
  join_code: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassroomMembership {
  id: string;
  classroom_id: string;
  child_id: string;
  joined_at: string;
}

export type AssignmentKind = 'readee_lesson' | 'custom_quiz';

export interface Assignment {
  id: string;
  classroom_id: string;
  assigned_by: string;
  kind: AssignmentKind;
  source_id: string; // lesson id for 'readee_lesson', quiz id for 'custom_quiz'
  title: string;
  note: string | null;
  due_at: string | null;
  assigned_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  child_id: string;
  started_at: string | null;
  completed_at: string | null;
  score_percent: number | null;
  carrots_earned: number;
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
