/**
 * POST /api/progress/update
 * 
 * Update reading progress for a child
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/helpers';
import { verifyChildOwnership } from '@/lib/db/repositories/children';
import { updateReadingProgress } from '@/lib/db/repositories/progress';
import { ProgressUpdateRequest, ProgressUpdateResponse } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body: ProgressUpdateRequest = await request.json();
    
    // Validate required fields
    if (!body.childId || !body.storyId || body.lastPageRead === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: childId, storyId, lastPageRead' },
        { status: 400 }
      );
    }
    
    // Validate lastPageRead is non-negative
    if (body.lastPageRead < 0) {
      return NextResponse.json(
        { success: false, error: 'lastPageRead must be non-negative' },
        { status: 400 }
      );
    }
    
    // Verify the child belongs to the current user
    const isOwner = await verifyChildOwnership(body.childId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this child profile' },
        { status: 403 }
      );
    }
    
    // Update progress
    const progress = await updateReadingProgress({
      childId: body.childId,
      storyId: body.storyId,
      lastPageRead: body.lastPageRead,
      completed: body.completed,
    });
    
    const response: ProgressUpdateResponse = {
      success: true,
      progress,
      message: 'Progress updated successfully',
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
