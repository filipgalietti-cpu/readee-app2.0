import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/progress
 * Update user progress and item history
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, itemId, correct, response, responseTimeMs } = body;

    if (!lessonId || !itemId || typeof correct !== "boolean") {
      return NextResponse.json(
        { error: "lessonId, itemId, and correct are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Record item attempt in history
    const nextReviewDate = calculateNextReview(correct);
    const { error: historyError } = await supabase.from("user_item_history").insert({
      user_id: user.id,
      item_id: itemId,
      correct,
      response: response || null,
      response_time_ms: responseTimeMs || null,
      next_review_date: nextReviewDate,
      ease_factor: correct ? 2.5 : 2.0,
      repetitions: correct ? 1 : 0,
      interval_days: correct ? 1 : 0,
    });

    if (historyError) {
      console.error("Error recording item history:", historyError);
    }

    // Update or create user progress for the lesson
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .single();

    if (existingProgress) {
      // Update existing progress
      await supabase
        .from("user_progress")
        .update({
          attempts: existingProgress.attempts + 1,
          last_attempted_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id);
    } else {
      // Create new progress entry
      await supabase.from("user_progress").insert({
        user_id: user.id,
        lesson_id: lessonId,
        attempts: 1,
        last_attempted_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/progress
 * Mark a lesson as completed with a score
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, score, completed } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update progress
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .single();

    const updateData: any = {
      score: score || null,
      completed: completed !== undefined ? completed : true,
    };

    if (completed) {
      updateData.completed_at = new Date().toISOString();
    }

    if (existingProgress) {
      await supabase
        .from("user_progress")
        .update(updateData)
        .eq("id", existingProgress.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        lesson_id: lessonId,
        ...updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Calculate next review date based on spaced repetition
 */
function calculateNextReview(correct: boolean): string {
  const now = new Date();
  if (correct) {
    // Review in 1 day if correct
    now.setDate(now.getDate() + 1);
  } else {
    // Review in 1 hour if incorrect
    now.setHours(now.getHours() + 1);
  }
  return now.toISOString();
}
