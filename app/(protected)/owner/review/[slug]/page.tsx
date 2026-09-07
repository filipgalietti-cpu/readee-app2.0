import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { createClient } from "@/lib/supabase/server";
import { LESSONS } from "@/app/data/lessons-v2";
import ReviewHud from "../_components/ReviewHud";

/**
 * /owner/review/<slug> — the founder's edition of /learn.
 *
 * Renders the real lesson, with the real assets, at real pace. The review panel
 * rides on top. Ordering matches the picker so prev/next walk the catalogue in
 * the same sequence a child would meet it.
 */
export const dynamic = "force-dynamic";

const ordered = () =>
  Object.entries(LESSONS)
    .map(([slug, e]) => ({ slug, lesson: e.lesson }))
    .sort(
      (a, b) =>
        a.lesson.grade.localeCompare(b.lesson.grade) ||
        a.lesson.standard.localeCompare(b.lesson.standard),
    );

export default async function ReviewLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) notFound();

  const { slug } = await params;
  const all = ordered();
  const i = all.findIndex((x) => x.slug === slug);
  if (i === -1) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("lesson_reviews")
    .select("scene_id, verdicts, note")
    .eq("lesson_slug", slug)
    .eq("reviewer_id", profile.id);

  const existing = Object.fromEntries(
    (rows ?? []).map((r) => [
      r.scene_id as string,
      { verdicts: (r.verdicts as Record<string, string>) ?? {}, note: (r.note as string) ?? null },
    ]),
  );

  const brief = (x: (typeof all)[number]) => ({ slug: x.slug, title: x.lesson.title });

  return (
    <ReviewHud
      lesson={all[i].lesson}
      slug={slug}
      existing={existing}
      prev={i > 0 ? brief(all[i - 1]) : null}
      next={i < all.length - 1 ? brief(all[i + 1]) : null}
    />
  );
}
