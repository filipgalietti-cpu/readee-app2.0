import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import passagesJson from "@/app/data/fluency-passages.json";
import libraryJson from "@/app/data/luna-library.json";
import phonicsJson from "@/app/data/luna-phonics.json";
import LunaReader from "./_components/LunaReader";
import { rankSkills } from "@/lib/orion/learner";
import { recommendTextLevel } from "@/lib/orion/reading/text-level";

export const dynamic = "force-dynamic";

type LunaPassage = { grade: string; title: string; text: string; patternId?: string; patternLabel?: string; targetWords?: string[] };
const PASSAGES = passagesJson as LunaPassage[];
// Pre-built decodable library (pattern-tagged) — the predetermined content that
// makes Luna instant. Runtime picks from this, never generates.
const LIBRARY = libraryJson as (LunaPassage & { patternId: string })[];
const PHONICS = (phonicsJson as { patterns: { id: string; grade: string; order: number }[] }).patterns;

/** Map a child's stored grade to a passage token ("K"/"1st"...). */
function gradeToken(g: string | null): string {
  const s = (g ?? "").toLowerCase();
  if (s.startsWith("1") || s.includes("first")) return "1st";
  if (s.startsWith("2") || s.includes("second")) return "2nd";
  if (s.startsWith("3") || s.includes("third")) return "3rd";
  if (s.startsWith("4") || s.includes("fourth")) return "4th";
  return "K";
}

/**
 * Luna — one continuous page. The resting state shows the orb WITH the topic
 * pills; tapping "Let's Go" fades the pills, Luna "thinks" and writes the story,
 * then the same orb coaches the child through reading it (build → drill → read
 * → results, Azure-graded). "Surprise me" is the free instant read. No hub, no
 * page hop. The reader also carries the adaptive library pool so "New story"
 * and the free path serve a just-right, phonics-targeted decodable read.
 */
export default async function LunaPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  let child: { id: string; name: string; grade: string | null; outfit: string | null } | null = null;
  const base = supabase
    .from("children")
    .select("id, first_name, grade, parent_id, equipped_items")
    .eq("parent_id", profile.id);
  const { data } = childIdParam
    ? await base.eq("id", childIdParam).maybeSingle()
    : await base.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (data) {
    child = {
      id: (data as any).id,
      name: ((data as any).first_name ?? "").split(" ")[0] || "Reader",
      grade: (data as any).grade ?? null,
      outfit: (data as any).equipped_items?.outfit ?? null,
    };
  }
  if (!child) redirect("/dashboard");

  // Recent reads power two things: the self-referential growth beat (last
  // WCPM) and Orion's text-level guard — if pooled accuracy over recent reads
  // is FRUSTRATION level (<90%, the Clay/F&P band), serve text one grade down.
  // Confidence is built on success at the right level, not grinding too-hard text.
  const { data: recentRows } = await supabase
    .from("fluency_readings")
    .select("wcpm, words_correct, words_total")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .limit(3);
  const recent = (recentRows ?? []) as { wcpm: number | null; words_correct: number | null; words_total: number | null }[];
  const previousWcpm = recent.find((r) => r.wcpm != null)?.wcpm ?? null;
  const { stepDown } = recommendTextLevel(
    recent.map((r) => ({ wordsCorrect: r.words_correct ?? 0, wordsTotal: r.words_total ?? 0 })),
  );

  const GRADE_ORDER = ["K", "1st", "2nd", "3rd", "4th"];
  let token = gradeToken(child.grade);
  if (stepDown) {
    const gi = GRADE_ORDER.indexOf(token);
    if (gi > 0) token = GRADE_ORDER[gi - 1]; // easier text AND easier patterns
  }
  // Library-first (pre-built, pattern-tagged, instant); fall back to the curated
  // fluency passages if the library has none for this grade yet.
  const lib: LunaPassage[] = LIBRARY.filter((p) => p.grade === token)
    .map((p) => ({ grade: p.grade, title: p.title, text: p.text, patternId: p.patternId, patternLabel: p.patternLabel, targetWords: p.targetWords }));
  const curated: LunaPassage[] = PASSAGES.filter((p) => p.grade === token);

  // Adaptive ordering: serve the child's weakest / most-due phonics pattern
  // first (SM-2 mastery in child_skill_memory); untouched patterns fall back to
  // teaching order. This is what makes Luna target the reader, not shuffle.
  let usable: LunaPassage[] = lib.length ? lib : curated.length ? curated : PASSAGES.filter((p) => p.grade === "1st");
  if (lib.length) {
    const gradePatterns = PHONICS.filter((p) => p.grade === token);
    const { data: skills } = await supabase
      .from("child_skill_memory")
      .select("standard_id, total_correct, total_attempted, next_due")
      .eq("child_id", child.id)
      .in("standard_id", gradePatterns.map((p) => p.id));
    const sm = new Map((skills ?? []).map((s: { standard_id: string; total_correct: number; total_attempted: number; next_due: string | null }) => [s.standard_id, s]));
    // Orion's Learner Model decides the order (brand-new patterns first, then
    // due, then weakest mastery) — one tested place instead of an inline copy.
    const ranked = rankSkills(
      gradePatterns.map((p) => {
        const s = sm.get(p.id);
        return { id: p.id, order: p.order, totalCorrect: s?.total_correct ?? 0, totalAttempted: s?.total_attempted ?? 0, nextDue: s?.next_due ?? null };
      }),
      Date.now(),
    ).map((s) => s.id);
    const rank = new Map(ranked.map((id, i) => [id, i] as const));
    usable = [...lib].sort((a, b) => (rank.get(a.patternId ?? "") ?? 99) - (rank.get(b.patternId ?? "") ?? 99));
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-72px)] max-w-2xl px-6 pt-8 pb-28">
      <LunaReader
        childId={child.id}
        childName={child.name}
        passages={usable}
        grade={token}
        previousWcpm={previousWcpm}
        childOutfitId={child.outfit}
      />
    </div>
  );
}
