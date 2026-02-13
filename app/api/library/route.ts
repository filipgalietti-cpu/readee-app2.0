/**
 * GET /api/library
 * 
 * Get stories filtered by reading level and interests
 * Query params:
 *   - readingLevel: number (1-10)
 *   - interests: comma-separated string
 *   - limit: number (default 20)
 *   - offset: number (default 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/helpers';
import { getStories } from '@/lib/db/repositories/stories';
import { LibraryResponse } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const readingLevelParam = searchParams.get('readingLevel');
    const interestsParam = searchParams.get('interests');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // Build filters
    const readingLevel = readingLevelParam ? parseInt(readingLevelParam, 10) : undefined;
    const interests = interestsParam ? interestsParam.split(',').map(i => i.trim()) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    // Validate reading level if provided
    if (readingLevel !== undefined && (readingLevel < 1 || readingLevel > 10)) {
      return NextResponse.json(
        { success: false, error: 'Reading level must be between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Get stories
    const { stories, total } = await getStories({
      readingLevel,
      interests,
      limit,
      offset,
    });
    
    const response: LibraryResponse = {
      success: true,
      stories,
      total,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
