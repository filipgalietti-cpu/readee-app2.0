/**
 * Example: Using the Backend in Server Components
 * 
 * This file demonstrates how to use the backend repositories and helpers
 * in Next.js Server Components and Server Actions.
 * 
 * NOTE: This is a reference/example file - not meant to be imported directly.
 */

import { 
  getCurrentUser,
  getUserProfile,
  getChildProfiles,
  createChild,
  getStories,
  updateReadingProgress,
  getChildProgress,
} from '@/lib/db/repositories';

// ═══════════════════════════════════════════════════════════
// Example 1: Server Component - Dashboard
// ═══════════════════════════════════════════════════════════

export default async function DashboardPage() {
  // Get current user and profile
  const user = await getCurrentUser();
  if (!user) {
    // Redirect to login or show error
    return <div>Please log in</div>;
  }

  const profile = await getUserProfile();
  if (!profile) {
    // Redirect to onboarding
    return <div>Please complete onboarding</div>;
  }

  // Get all children for this parent
  const children = await getChildProfiles(user.id);

  return (
    <div>
      <h1>Welcome, {profile.display_name}!</h1>
      
      <h2>Your Children</h2>
      {children.map(child => (
        <div key={child.id}>
          <p>{child.name} - Age {child.age} - Level {child.reading_level}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Example 2: Server Component - Library
// ═══════════════════════════════════════════════════════════

export async function LibraryPage({
  searchParams,
}: {
  searchParams: { level?: string; interests?: string };
}) {
  // Get stories with filters from URL params
  const readingLevel = searchParams.level ? parseInt(searchParams.level) : undefined;
  const interests = searchParams.interests?.split(',');

  const { stories, total } = await getStories({
    readingLevel,
    interests,
    limit: 20,
  });

  return (
    <div>
      <h1>Library</h1>
      <p>Found {total} stories</p>
      
      {stories.map(story => (
        <div key={story.id}>
          <h3>{story.title}</h3>
          <p>Level: {story.reading_level}</p>
          <p>Tags: {story.interest_tags.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Example 3: Server Action - Add Child
// ═══════════════════════════════════════════════════════════

'use server';

export async function addChildAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const age = parseInt(formData.get('age') as string);
  const readingLevel = parseInt(formData.get('readingLevel') as string);

  try {
    const child = await createChild({
      parentId: user.id,
      name,
      age,
      readingLevel,
    });

    return { success: true, child };
  } catch (error) {
    return { error: 'Failed to create child' };
  }
}

// ═══════════════════════════════════════════════════════════
// Example 4: Server Action - Update Progress
// ═══════════════════════════════════════════════════════════

export async function updateProgressAction(
  childId: string,
  storyId: string,
  pageRead: number
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify child ownership
  const children = await getChildProfiles(user.id);
  const isOwner = children.some(c => c.id === childId);
  
  if (!isOwner) {
    throw new Error('Forbidden');
  }

  const progress = await updateReadingProgress({
    childId,
    storyId,
    lastPageRead: pageRead,
  });

  return progress;
}

// ═══════════════════════════════════════════════════════════
// Example 5: Server Component - Child Progress
// ═══════════════════════════════════════════════════════════

export async function ChildProgressPage({
  params,
}: {
  params: { childId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Get all progress for this child
  const progress = await getChildProgress(params.childId);

  return (
    <div>
      <h1>Reading Progress</h1>
      
      <div>
        <h2>In Progress</h2>
        {progress
          .filter(p => !p.completed)
          .map(p => (
            <div key={p.id}>
              <p>Story: {p.story_id}</p>
              <p>Last page: {p.last_page_read}</p>
            </div>
          ))}
      </div>

      <div>
        <h2>Completed</h2>
        {progress
          .filter(p => p.completed)
          .map(p => (
            <div key={p.id}>
              <p>Story: {p.story_id}</p>
              <p>Completed: {new Date(p.completed_at!).toLocaleDateString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Example 6: Client Component - Call API Route
// ═══════════════════════════════════════════════════════════

'use client';

export function UpdateProgressButton({
  childId,
  storyId,
  currentPage,
}: {
  childId: string;
  storyId: string;
  currentPage: number;
}) {
  const handleUpdate = async () => {
    const response = await fetch('/api/progress/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        storyId,
        lastPageRead: currentPage + 1,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Progress updated!');
    } else {
      console.error('Error:', data.error);
    }
  };

  return <button onClick={handleUpdate}>Next Page</button>;
}

// ═══════════════════════════════════════════════════════════
// Example 7: Advanced - Fetch Stories with User Preferences
// ═══════════════════════════════════════════════════════════

import { getOnboardingPreferences } from '@/lib/db/repositories';

export async function PersonalizedLibraryPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div>Please log in</div>;
  }

  // Get user preferences
  const preferences = await getOnboardingPreferences(user.id);
  
  // Get children to determine reading level
  const children = await getChildProfiles(user.id);
  
  // If they have children, use the first child's reading level
  const readingLevel = children[0]?.reading_level;
  
  // Get stories matching preferences
  const { stories } = await getStories({
    readingLevel,
    interests: preferences?.interests || [],
    limit: 10,
  });

  return (
    <div>
      <h1>Recommended for You</h1>
      {stories.map(story => (
        <div key={story.id}>
          <h3>{story.title}</h3>
          <p>Perfect for {children[0]?.name}!</p>
        </div>
      ))}
    </div>
  );
}
