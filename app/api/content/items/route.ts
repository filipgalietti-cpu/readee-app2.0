import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/content/items?lessonId=xxx
 * Fetch items for a lesson, including spaced review items
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch new items for this lesson (60-70% of session)
    const { data: newItems, error: newError } = await supabase
      .from("content_items")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    if (newError) {
      console.error("Error fetching items:", newError);
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }

    // Fetch review items due for this user (30-40% of session)
    const today = new Date().toISOString();
    const { data: reviewHistory } = await supabase
      .from("user_item_history")
      .select("item_id, content_items(*)")
      .eq("user_id", user.id)
      .lte("next_review_date", today)
      .limit(5); // Get up to 5 review items

    const reviewItems = reviewHistory?.map((h: any) => h.content_items).filter(Boolean) || [];

    // Mix new and review items (aim for 60-70% new, 30-40% review)
    const targetTotal = Math.max(8, newItems.length); // At least 8 items per session
    const targetReview = Math.floor(targetTotal * 0.35); // 35% review
    const targetNew = targetTotal - Math.min(targetReview, reviewItems.length);

    const selectedNew = newItems.slice(0, targetNew);
    const selectedReview = reviewItems.slice(0, targetReview);

    // Shuffle the combined items
    const allItems = [...selectedNew, ...selectedReview].sort(() => Math.random() - 0.5);

    return NextResponse.json({ 
      items: allItems,
      stats: {
        total: allItems.length,
        new: selectedNew.length,
        review: selectedReview.length,
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
