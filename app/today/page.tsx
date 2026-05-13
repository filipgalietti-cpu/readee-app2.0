import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * /today — public landing that redirects to the most-recent published
 * daily question. Shareable URL for marketing + SEO. The dated detail
 * page lives at /today/[slug].
 */
export default async function TodayIndexPage() {
  const supabase = await createClient();
  // Same filter as DailyQuestionCard — skip QC failures so /today never
  // redirects to a broken day. Warns surface; fails fall back silently.
  const { data } = await supabase
    .from("daily_questions")
    .select("slug")
    .lte("date", new Date().toISOString().slice(0, 10))
    .eq("published_state", "live")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.slug) {
    redirect(`/today/${data.slug}`);
  }
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">No daily question yet</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Check back tomorrow morning — we publish a new one every day.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Back to readee.app
      </Link>
    </div>
  );
}
