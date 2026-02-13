/**
 * Stories repository - handles story-related database operations
 */

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Story, LibraryFilters } from '@/lib/db/types';

/**
 * Get stories with optional filtering
 * This is for parent/user access (uses regular client with RLS)
 */
export async function getStories(filters: LibraryFilters = {}): Promise<{
  stories: Story[];
  total: number;
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('stories')
    .select('*', { count: 'exact' });
  
  // Apply reading level filter
  if (filters.readingLevel) {
    query = query.eq('reading_level', filters.readingLevel);
  }
  
  // Apply interests filter (stories with matching tags)
  if (filters.interests && filters.interests.length > 0) {
    query = query.overlaps('interest_tags', filters.interests);
  }
  
  // Apply pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);
  
  // Order by newest first
  query = query.order('created_at', { ascending: false });
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get stories: ${error.message}`);
  }
  
  return {
    stories: data || [],
    total: count || 0,
  };
}

/**
 * Get a single story by ID
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get story: ${error.message}`);
  }
  
  return data;
}

/**
 * Get recommended stories for a child based on their reading level and interests
 */
export async function getRecommendedStories(
  childId: string,
  readingLevel: number,
  interests: string[] = [],
  limit: number = 10
): Promise<Story[]> {
  const supabase = await createClient();
  
  // Get stories at the child's reading level
  let query = supabase
    .from('stories')
    .select('*')
    .eq('reading_level', readingLevel);
  
  // If interests provided, prefer stories with matching tags
  if (interests.length > 0) {
    query = query.overlaps('interest_tags', interests);
  }
  
  query = query
    .order('created_at', { ascending: false })
    .limit(limit);
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to get recommended stories: ${error.message}`);
  }
  
  return data || [];
}

// ═══════════════════════════════════════════════════════════
// Admin functions (use service role key)
// These should only be called from admin API routes
// ═══════════════════════════════════════════════════════════

export interface CreateStoryParams {
  title: string;
  readingLevel: number;
  interestTags?: string[];
  content?: any;
  thumbnailUrl?: string;
  totalPages?: number;
}

/**
 * Create a new story (admin only)
 */
export async function createStory(params: CreateStoryParams): Promise<Story> {
  const admin = supabaseAdmin();
  
  const { data, error } = await admin
    .from('stories')
    .insert({
      title: params.title,
      reading_level: params.readingLevel,
      interest_tags: params.interestTags || [],
      content: params.content || null,
      thumbnail_url: params.thumbnailUrl || null,
      total_pages: params.totalPages || 1,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create story: ${error.message}`);
  }
  
  return data;
}

/**
 * Update a story (admin only)
 */
export async function updateStory(
  storyId: string,
  params: Partial<CreateStoryParams>
): Promise<Story> {
  const admin = supabaseAdmin();
  
  const { data, error } = await admin
    .from('stories')
    .update(params)
    .eq('id', storyId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update story: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a story (admin only)
 */
export async function deleteStory(storyId: string): Promise<void> {
  const admin = supabaseAdmin();
  
  const { error } = await admin
    .from('stories')
    .delete()
    .eq('id', storyId);
  
  if (error) {
    throw new Error(`Failed to delete story: ${error.message}`);
  }
}
