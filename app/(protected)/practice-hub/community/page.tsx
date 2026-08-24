import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CommunityLibrary from "./_components/CommunityLibrary";

export const dynamic = "force-dynamic";

/** A short, clean blurb for the spotlight — first sentence-ish of the passage. */
function makeBlurb(text: string | null): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 130) return clean;
  const cut = clean.slice(0, 130);
  const lastStop = cut.lastIndexOf(". ");
  return lastStop > 60 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`;
}

export default async function CommunityLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childParam } = await searchParams;

  // The child's grade powers the "For {grade}" tab.
  const supabase = await createClient();
  const { data: kids } = await supabase
    .from("children")
    .select("grade, first_name")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1);
  // Readee is K-4. A "pre-k" placement is served kindergarten content
  // everywhere else (learn/practice/standards all fall back pre-k -> K), and
  // community passages are tagged "K" (not "pre-k"), so normalize here too.
  // Without this, the "For {grade}" tab matches zero passages for pre-k kids.
  const rawGrade = ((kids?.[0] as any)?.grade as string | null) ?? null;
  const childGrade = rawGrade && /^pre-?k$/i.test(rawGrade) ? "K" : rawGrade;
  const childName = ((kids?.[0] as any)?.first_name as string | null) ?? null;

  const { data: rows } = await supabaseAdmin()
    .from("community_passages")
    .select(
      "id, slug, title, passage_text, image_url, grade_level, topic, phonics_pattern, view_count, display_byline, display_avatar, source_kind, created_at",
    )
    .eq("status", "approved")
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  const items = (rows ?? []).map((r: any) => ({
    id: r.id as string,
    slug: (r.slug as string | null) ?? null,
    title: r.title as string,
    blurb: makeBlurb(r.passage_text),
    image_url: (r.image_url as string | null) ?? null,
    grade_level: r.grade_level as string,
    topic: (r.topic as string | null) ?? "",
    phonics_pattern: (r.phonics_pattern as string | null) ?? null,
    view_count: (r.view_count as number | null) ?? 0,
    display_byline: (r.display_byline as string | null) ?? null,
    display_avatar: (r.display_avatar as string | null) ?? null,
    source_kind: (r.source_kind as string | null) ?? null,
    created_at: r.created_at as string,
  }));

  return (
    <CommunityLibrary
      items={items}
      childGrade={childGrade}
      childName={childName}
      childParam={childParam ?? null}
    />
  );
}
