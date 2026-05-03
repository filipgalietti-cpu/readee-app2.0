/**
 * Deterministic topic rotation for the factory. Each cron picks N
 * (standard, grade, theme) tuples that:
 *  - haven't been used in the last 14 days (anti-repetition)
 *  - are weighted across grades K-4
 *  - couple a CCSS standard to a curated theme for natural variety
 *
 * Standards source: lib/data/standards.ts. We filter to comprehension-
 * focused codes (RL.* and RI.*) for leveled passages — phonics standards
 * (RF.x.3*) don't make sense as passages.
 */

import { getAllStandards, type Standard } from "@/lib/data/standards";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Hand-curated themes for variety. Update freely — order doesn't matter. */
export const FACTORY_THEMES = [
  "animals",
  "weather",
  "space",
  "plants and seasons",
  "community helpers",
  "sports and games",
  "food and farms",
  "transportation",
  "inventions",
  "famous scientists",
  "art and music",
  "ancient peoples",
  "the ocean",
  "weather extremes",
  "kids around the world",
  "back-to-school",
  "friendship",
  "kindness",
  "first day of...",
  "weird and wonderful animals",
];

const RECENT_DAYS = 14;

export type RotationPick = {
  standardId: string;
  standardDescription: string;
  domain: string;
  grade: string;
  gradeLabel: string;
  theme: string;
};

/**
 * Filter the standards bank to comprehension-focused leaves only.
 * Excludes RF.* phonics standards (decodable books handle those) and
 * SL.* / W.* (Speaking and Writing — out of Readee's scope).
 */
/** "Range of reading" / stamina standards (RL.x.10, RI.x.10) are meta:
 *  "by the end of the year, read and comprehend X." They don't describe
 *  a specific testable skill, so the fidelity judge correctly marks
 *  any generated MCQ as mis_tagged. Skip them in rotation. */
const META_STANDARDS = new Set([
  "RL.K.10", "RL.1.10", "RL.2.10", "RL.3.10", "RL.4.10",
  "RI.K.10", "RI.1.10", "RI.2.10", "RI.3.10", "RI.4.10",
]);

function comprehensionStandards(): Standard[] {
  return getAllStandards().filter((s) => {
    const id = s.standard_id.toUpperCase();
    if (META_STANDARDS.has(id)) return false;
    return id.startsWith("RL.") || id.startsWith("RI.");
  });
}

/**
 * Query the queue for standards used in the last RECENT_DAYS for the
 * given asset kind. Returns a Set of standard IDs to skip on this pick.
 */
async function recentlyUsedStandards(assetKind: string): Promise<Set<string>> {
  const supabase = supabaseAdmin();
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString();
  const { data } = await supabase
    .from("content_review_queue")
    .select("standard_id")
    .eq("asset_kind", assetKind)
    .gte("created_at", since)
    .not("standard_id", "is", null);
  const used = new Set<string>();
  for (const r of (data ?? []) as { standard_id: string | null }[]) {
    if (r.standard_id) used.add(r.standard_id.toUpperCase());
  }
  return used;
}

/**
 * Hash a string to a stable integer. Used for deterministic theme
 * pairing — same standard + same date → same theme, so re-running the
 * cron after a failure doesn't re-roll content arbitrarily.
 */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Pick N rotation tuples. Deterministic by date — re-running tomorrow
 * with same recent-history yields the same picks (modulo whatever the
 * cron has already added to the queue between the two runs).
 */
export async function pickRotation(input: {
  assetKind: string;
  count: number;
  /** When set, skip standards from this set in addition to recently-used. */
  alsoSkip?: Set<string>;
}): Promise<RotationPick[]> {
  const allStandards = comprehensionStandards();
  const recentlyUsed = await recentlyUsedStandards(input.assetKind);
  const toSkip = new Set([...recentlyUsed, ...(input.alsoSkip ?? [])]);

  const eligible = allStandards.filter(
    (s) => !toSkip.has(s.standard_id.toUpperCase()),
  );

  // If we've burned through all standards in 14 days (unlikely with ~150
  // RL+RI codes), fall back to the full set to keep the factory running.
  const pool = eligible.length >= input.count ? eligible : allStandards;

  // Deterministic shuffle by today's date so a re-run picks the same
  // rotation. Different days will yield different picks naturally.
  const today = new Date().toISOString().slice(0, 10);
  const seed = hashStr(today + ":" + input.assetKind);
  const shuffled = [...pool].sort((a, b) => {
    const ha = hashStr(seed + ":" + a.standard_id);
    const hb = hashStr(seed + ":" + b.standard_id);
    return ha - hb;
  });

  const picks: RotationPick[] = [];
  for (const s of shuffled.slice(0, input.count)) {
    const themeIdx = hashStr(seed + ":" + s.standard_id) % FACTORY_THEMES.length;
    picks.push({
      standardId: s.standard_id,
      standardDescription: s.standard_description,
      domain: s.domain,
      grade: shortGrade(s.grade),
      gradeLabel: s.gradeLabel,
      theme: FACTORY_THEMES[themeIdx],
    });
  }
  return picks;
}

function shortGrade(g: string): string {
  if (g === "kindergarten") return "K";
  if (g === "1st-grade") return "1st";
  if (g === "2nd-grade") return "2nd";
  if (g === "3rd-grade") return "3rd";
  if (g === "4th-grade") return "4th";
  return g;
}
