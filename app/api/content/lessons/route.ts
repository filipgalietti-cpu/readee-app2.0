import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/content/lessons?unitId=xxx
 * Fetch all lessons for a unit, optionally with progress
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from("content_lessons")
      .select("*")
      .order("order_index", { ascending: true });

    if (unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error("Error fetching lessons:", error);
      return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }

    // Fetch user progress for these lessons
    const lessonIds = lessons.map((l) => l.id);
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    // Merge progress into lessons
    const lessonsWithProgress = lessons.map((lesson) => {
      const userProgress = progress?.find((p) => p.lesson_id === lesson.id);
      return {
        ...lesson,
        completed: userProgress?.completed || false,
        score: userProgress?.score || null,
      };
    });

    return NextResponse.json({ lessons: lessonsWithProgress });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
