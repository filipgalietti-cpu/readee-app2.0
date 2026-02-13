/**
 * GET /api/progress/[childId]
 * 
 * Get reading progress for a specific child
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/helpers';
import { getChildById, verifyChildOwnership } from '@/lib/db/repositories/children';
import { getChildProgress, getProgressStats } from '@/lib/db/repositories/progress';
import { ChildProgressResponse } from '@/lib/db/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { childId } = await params;
    
    // Verify the child belongs to the current user
    const isOwner = await verifyChildOwnership(childId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this child profile' },
        { status: 403 }
      );
    }
    
    // Get child data
    const child = await getChildById(childId);
    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }
    
    // Get progress and stats
    const progress = await getChildProgress(childId);
    const stats = await getProgressStats(childId);
    
    const response: ChildProgressResponse = {
      success: true,
      child,
      progress,
      stats,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching child progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
