import { createClient } from "@/lib/supabase/server";
import DailyArchive from "./_components/DailyArchive";

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
 * the right of the 272px sidebar — so it fills the viewport and NEVER
 * scrolls (the root layout's footer sits behind it). The real NavAuth +
 * AppSidebar show through, matching the Claude Design 1:1. A separate
 * public /today/archive stays for logged-out sharing + SEO.
 */
export default async function DailyReadeePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await supabase
    .from("daily_questions")
    .select("date, slug, theme, passage_title, image_url")
    .lte("date", today)
    .eq("published_state", "live")
    .order("date", { ascending: false })
    .limit(120);
  const list = (rows ?? []) as Row[];

  return (
    <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 flex flex-col overflow-hidden bg-white lg:left-[272px]">
      <div className="mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col px-6 pb-4 pt-3">
        {/* Newspaper masthead */}
        <div className="flex-none border-y-[3px] border-double border-zinc-900 py-2 text-center">
          <h1
            className="m-0 text-[32px] font-black tracking-tight text-zinc-900 sm:text-[38px]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            The Daily Readee
          </h1>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            No dailies published yet. Come back tomorrow morning.
          </div>
        ) : (
          <DailyArchive entries={list} todayDate={today} />
        )}
      </div>
    </div>
  );
}
