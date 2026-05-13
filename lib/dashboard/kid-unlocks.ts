/**
 * "Fresh for you" — kid-facing surface that pushes new AI content
 * to the dashboard as it lands and clears QC.
 *
 * Sources (all grade-filtered):
 *   - child_ai_content (parent-made for THIS kid)
 *   - personalized_stories (kid-specific)
 *   - community_passages (status='approved' + matching grade)
 *   - daily_questions (today's question — universal)
 *
 * What we don't include here: differentiated_passages and
 * custom_lessons. Those flow through teacher assignments and have
 * their own surface; auto-pushing them would step on the teacher's
 * targeting decisions.
 *
 * Recency window: 14 days. After two weeks fresh content stops
 * being "new" — the kid sees it through the journey/practice hubs.
 */
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const RECENCY_DAYS = 14;
const PER_SOURCE_LIMIT = 6;

export type KidUnlock = {
  kind:
    | "ask_readee"
    | "personalized_story"
    | "community_passage"
    | "daily_question";
  id: string;
  title: string;
  topicOrSubtitle: string | null;
  imageUrl: string | null;
  href: string;
  createdAt: string;
};

const GRADE_PEERS: Record<string, string[]> = {
  K: ["K", "1st"],
  "1st": ["K", "1st", "2nd"],
  "2nd": ["1st", "2nd", "3rd"],
  "3rd": ["2nd", "3rd", "4th"],
  "4th": ["3rd", "4th"],
};

function gradePeers(grade: string | null): string[] | null {
  if (!grade) return null;
  return GRADE_PEERS[grade] ?? [grade];
}

/**
 * Pulls the kid's unlocks across surfaces and merges into one
 * recency-sorted feed.
 */
export async function loadKidUnlocks(input: {
  childId: string;
  parentId: string;
  gradeLevel: string | null;
}): Promise<KidUnlock[]> {
  const admin = supabaseAdmin();
  const sinceIso = new Date(
    Date.now() - RECENCY_DAYS * 86_400_000,
  ).toISOString();
  const peers = gradePeers(input.gradeLevel);

  const [askReadee, stories, community, daily] = await Promise.all([
    admin
      .from("child_ai_content")
      .select("id, title, topic, image_url, created_at")
      .eq("child_id", input.childId)
      .eq("parent_id", input.parentId)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),
    admin
      .from("personalized_stories")
      .select("id, title, reading_level, cover_image_url, qc_overall, created_at")
      .eq("child_id", input.childId)
      .gte("created_at", sinceIso)
      .eq("published_state", "live")
      .order("created_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),
    peers
      ? admin
          .from("community_passages")
          .select("id, title, topic, image_url, grade_level, created_at")
          .eq("status", "approved")
          .in("grade_level", peers)
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(PER_SOURCE_LIMIT)
      : Promise.resolve({ data: [] }),
    admin
      .from("daily_questions")
      .select("date, slug, passage_title, theme, image_url, qc_overall, created_at")
      .lte("date", new Date().toISOString().slice(0, 10))
      .eq("published_state", "live")
      .order("date", { ascending: false })
      .limit(1),
  ]);

  const out: KidUnlock[] = [];

  for (const r of (askReadee.data ?? []) as any[]) {
    out.push({
      kind: "ask_readee",
      id: String(r.id),
      title: r.title ?? r.topic ?? "Made for you",
      topicOrSubtitle: r.topic ?? null,
      imageUrl: r.image_url ?? null,
      href: `/parent-lesson/${r.id}`,
      createdAt: r.created_at,
    });
  }

  for (const r of (stories.data ?? []) as any[]) {
    out.push({
      kind: "personalized_story",
      id: String(r.id),
      title: r.title ?? "A story for you",
      topicOrSubtitle: r.reading_level ?? null,
      imageUrl: r.cover_image_url ?? null,
      href: `/stories-for-me/${r.id}`,
      createdAt: r.created_at,
    });
  }

  for (const r of (community.data ?? []) as any[]) {
    out.push({
      kind: "community_passage",
      id: String(r.id),
      title: r.title ?? r.topic ?? "Community passage",
      topicOrSubtitle: r.grade_level ?? null,
      imageUrl: r.image_url ?? null,
      href: `/community/${r.id}`,
      createdAt: r.created_at,
    });
  }

  for (const r of (daily.data ?? []) as any[]) {
    out.push({
      kind: "daily_question",
      id: String(r.date),
      title: r.passage_title ?? `Today: ${r.theme}`,
      topicOrSubtitle: r.theme ?? null,
      imageUrl: r.image_url ?? null,
      href: `/today/${r.slug}`,
      createdAt: r.created_at,
    });
  }

  // Newest first across the whole feed.
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out.slice(0, 12);
}
