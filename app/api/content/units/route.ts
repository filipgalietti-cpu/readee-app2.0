import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/content/units
 * Fetch all content units in order
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch units
    const { data: units, error } = await supabase
      .from("content_units")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching units:", error);
      return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
    }

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
