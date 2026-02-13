/**
 * Reading progress repository - handles reading progress tracking
 */

import { createClient } from '@/lib/supabase/server';
import { ReadingProgress } from '@/lib/db/types';

export interface UpdateProgressParams {
  childId: string;
  storyId: string;
  lastPageRead: number;
  completed?: boolean;
}

/**
 * Update or create reading progress for a child
 */
export async function updateReadingProgress(
  params: UpdateProgressParams
): Promise<ReadingProgress> {
  const supabase = await createClient();
  
  const updateData: any = {
    child_id: params.childId,
    story_id: params.storyId,
    last_page_read: params.lastPageRead,
  };
  
  // If marking as completed, set completed flag and timestamp
  if (params.completed !== undefined) {
    updateData.completed = params.completed;
    if (params.completed) {
      updateData.completed_at = new Date().toISOString();
    }
  }
  
  // Upsert: insert if doesn't exist, update if it does
  const { data, error } = await supabase
    .from('reading_progress')
    .upsert(updateData, {
      onConflict: 'child_id,story_id'
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update reading progress: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all reading progress for a child
 */
export async function getChildProgress(childId: string): Promise<ReadingProgress[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('child_id', childId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get child progress: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get progress for a specific story and child
 */
export async function getProgressForStory(
  childId: string,
  storyId: string
): Promise<ReadingProgress | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('child_id', childId)
    .eq('story_id', storyId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get progress: ${error.message}`);
  }
  
  return data;
}

/**
 * Get completed stories for a child
 */
export async function getCompletedStories(childId: string): Promise<ReadingProgress[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('child_id', childId)
    .eq('completed', true)
    .order('completed_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get completed stories: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get in-progress stories for a child
 */
export async function getInProgressStories(childId: string): Promise<ReadingProgress[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('child_id', childId)
    .eq('completed', false)
    .order('updated_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get in-progress stories: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Calculate progress statistics for a child
 */
export async function getProgressStats(childId: string): Promise<{
  totalStoriesStarted: number;
  totalStoriesCompleted: number;
  currentStreak: number;
}> {
  const allProgress = await getChildProgress(childId);
  
  const totalStoriesStarted = allProgress.length;
  const totalStoriesCompleted = allProgress.filter(p => p.completed).length;
  
  // Calculate streak (simplified - consecutive days with completions)
  // This is a basic implementation - could be enhanced with more sophisticated logic
  const currentStreak = calculateStreak(allProgress);
  
  return {
    totalStoriesStarted,
    totalStoriesCompleted,
    currentStreak,
  };
}

/**
 * Helper function to calculate reading streak
 * Returns number of consecutive days with completed stories
 */
function calculateStreak(progress: ReadingProgress[]): number {
  const completedProgress = progress
    .filter(p => p.completed && p.completed_at)
    .map(p => {
      const completedDate = new Date(p.completed_at!);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime();
    });
  
  if (completedProgress.length === 0) {
    return 0;
  }
  
  // Get unique dates (to handle multiple completions on same day)
  const uniqueDates = Array.from(new Set(completedProgress)).sort((a, b) => b - a);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTime = yesterday.getTime();
  
  // Check if most recent completion was today or yesterday
  const mostRecentCompletion = uniqueDates[0];
  if (mostRecentCompletion !== todayTime && mostRecentCompletion !== yesterdayTime) {
    // Streak is broken - last completion was more than a day ago
    return 0;
  }
  
  // Count consecutive days
  let streak = 0;
  let expectedDate = mostRecentCompletion === todayTime ? todayTime : yesterdayTime;
  
  for (const completionDate of uniqueDates) {
    if (completionDate === expectedDate) {
      streak++;
      // Move to previous day
      const nextExpected = new Date(expectedDate);
      nextExpected.setDate(nextExpected.getDate() - 1);
      expectedDate = nextExpected.getTime();
    } else {
      // Gap found, streak ends
      break;
    }
  }
  
  return streak;
}

/**
 * Delete progress record (if needed for cleanup)
 */
export async function deleteProgress(
  childId: string,
  storyId: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('reading_progress')
    .delete()
    .eq('child_id', childId)
    .eq('story_id', storyId);
  
  if (error) {
    throw new Error(`Failed to delete progress: ${error.message}`);
  }
}
