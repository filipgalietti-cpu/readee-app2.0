import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/stories/[id]
 * Fetch a specific story with all its pages
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch story
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Fetch story pages
    const { data: pages, error: pagesError } = await supabase
      .from("story_pages")
      .select("*")
      .eq("story_id", id)
      .order("page_number", { ascending: true });

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
    }

    return NextResponse.json({ story, pages });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
