/**
 * Children repository - handles all child-related database operations
 */

import { createClient } from '@/lib/supabase/server';
import { Child } from '@/lib/db/types';

export interface CreateChildParams {
  parentId: string;
  name: string;
  age: number;
  readingLevel: number;
}

export interface UpdateChildParams {
  name?: string;
  age?: number;
  readingLevel?: number;
}

/**
 * Get all children for a parent
 */
export async function getChildProfiles(parentId: string): Promise<Child[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get children: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get a specific child by ID
 */
export async function getChildById(childId: string): Promise<Child | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get child: ${error.message}`);
  }
  
  return data;
}

/**
 * Create a new child profile
 */
export async function createChild(params: CreateChildParams): Promise<Child> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('children')
    .insert({
      parent_id: params.parentId,
      name: params.name,
      age: params.age,
      reading_level: params.readingLevel,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create child: ${error.message}`);
  }
  
  return data;
}

/**
 * Update a child profile
 */
export async function updateChild(
  childId: string,
  params: UpdateChildParams
): Promise<Child> {
  const supabase = await createClient();
  
  // Convert camelCase to snake_case for database
  const updateData: any = {};
  if (params.name !== undefined) {
    updateData.name = params.name;
  }
  if (params.age !== undefined) {
    updateData.age = params.age;
  }
  if (params.readingLevel !== undefined) {
    updateData.reading_level = params.readingLevel;
  }
  
  const { data, error } = await supabase
    .from('children')
    .update(updateData)
    .eq('id', childId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update child: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a child profile
 */
export async function deleteChild(childId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);
  
  if (error) {
    throw new Error(`Failed to delete child: ${error.message}`);
  }
}

/**
 * Verify a child belongs to a specific parent
 */
export async function verifyChildOwnership(
  childId: string,
  parentId: string
): Promise<boolean> {
  const child = await getChildById(childId);
  return child !== null && child.parent_id === parentId;
}
