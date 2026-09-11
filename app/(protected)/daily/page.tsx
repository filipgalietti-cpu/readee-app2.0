import { createClient } from "@/lib/supabase/server";
import DailyView from "./_components/DailyView";

export const dynamic = "force-dynamic"; // archive reflects DB fixes immediately (was serving stale static snapshots)

export const metadata = { title: "Daily Readee · Readee" };

type Row = {
  date: string;
  slug: string;
  theme: string;
  passage_title: string;
  image_url: string | null;
};

/**
 * In-app Daily Readee archive (the sidebar "Daily Readee" destination).
 *
 * Pinned to the content area with `fixed` — below the 76px top nav and to
 * the right of the 272px sidebar — so it fills the viewport and scrolls within its own panel
 * on short screens (the root layout's footer sits behind it). The real NavAuth +
 * AppSidebar show through, matching the Claude Design 1:1. A separate
 * public /today/archive stays for logged-out sharing + SEO.
 */
export default async function DailyReadeePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows, error } = await supabase
    .from("daily_questions")
    .select("date, slug, theme, passage_title, image_url")
    .lte("date", today)
    .eq("published_state", "live")
    .order("date", { ascending: false })
    .limit(120);
  if (error) throw new Error("Daily archive could not load");
  const list = (rows ?? []) as Row[];

  // Which dailies has this family already read? (B2C: the parent's first child.)
  let completedDates: string[] = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: kid } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (kid) {
      const { data: reads } = await supabase
        .from("daily_reads")
        .select("daily_date")
        .eq("child_id", (kid as { id: string }).id);
      completedDates = (reads ?? []).map((r) => (r as { daily_date: string }).daily_date);
    }
  }

  return <DailyView entries={list} todayDate={today} completedDates={completedDates} />;
}
