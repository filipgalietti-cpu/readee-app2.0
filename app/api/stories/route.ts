import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/stories
 * Fetch all stories with unlock status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch stories
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching stories:", error);
      return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }

    // Check which units the user has completed
    const { data: completedLessons } = await supabase
      .from("user_progress")
      .select("lesson_id, content_lessons(unit_id)")
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedUnitIds = new Set(
      completedLessons?.map((cl: any) => cl.content_lessons?.unit_id).filter(Boolean) || []
    );

    // Determine unlock status for each story
    const storiesWithUnlock = stories.map((story) => ({
      ...story,
      unlocked: !story.unlock_after_unit_id || completedUnitIds.has(story.unlock_after_unit_id),
    }));

    return NextResponse.json({ stories: storiesWithUnlock });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
