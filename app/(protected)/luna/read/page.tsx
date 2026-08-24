import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { FREE_LIMITS } from "@/lib/plan/limits";
import { createClient } from "@/lib/supabase/server";
import passagesJson from "@/app/data/fluency-passages.json";
import libraryJson from "@/app/data/luna-library.json";
import phonicsJson from "@/app/data/luna-phonics.json";
import LunaReader from "../_components/LunaReader";

export const dynamic = "force-dynamic";

type LunaPassage = { grade: string; title: string; text: string; patternId?: string; patternLabel?: string; targetWords?: string[] };
const PASSAGES = passagesJson as LunaPassage[];
// Pre-built decodable library (pattern-tagged) — the predetermined content that
// makes Luna instant. Runtime picks from this, never generates.
const LIBRARY = libraryJson as (LunaPassage & { patternId: string })[];
const PHONICS = (phonicsJson as { patterns: { id: string; grade: string; order: number }[] }).patterns;

/** Map a child's stored grade ("Kindergarten"/"1st"...) to a passage token ("K"/"1st"...). */
function gradeToken(g: string | null): string {
  const s = (g ?? "").toLowerCase();
  if (s.startsWith("1") || s.includes("first")) return "1st";
  if (s.startsWith("2") || s.includes("second")) return "2nd";
  if (s.startsWith("3") || s.includes("third")) return "3rd";
  if (s.startsWith("4") || s.includes("fourth")) return "4th";
  return "K";
}

export default async function LunaReadPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const paid = hasAnyPaidTier((profile as any).plan);

  const { child: childIdParam } = await searchParams;
  const supabase = await createClient();

  // Load the named child (verified as this parent's), else the parent's first.
  let child: { id: string; name: string; grade: string | null } | null = null;
  const base = supabase.from("children").select("id, first_name, grade, parent_id").eq("parent_id", profile.id);
  const { data } = childIdParam
    ? await base.eq("id", childIdParam).maybeSingle()
    : await base.order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (data) {
    child = {
      id: (data as any).id,
      name: ((data as any).first_name ?? "").split(" ")[0] || "Reader",
      grade: (data as any).grade ?? null,
    };
  }

  if (!child) {
    // No reader yet — send them to set one up.
    redirect("/dashboard");
  }

  // Free taste: free plans get FREE_LIMITS.lunaReadsFree completed reads with
  // Luna, then hit the upgrade wall. Completed sessions are one row each in
  // fluency_readings. Paid tiers are unlimited.
  if (!paid) {
    const { count } = await supabase
      .from("fluency_readings")
      .select("id", { count: "exact", head: true })
      .eq("child_id", child.id);
    if ((count ?? 0) >= FREE_LIMITS.lunaReadsFree) {
      redirect("/upgrade?reason=reading_buddy");
    }
  }

  const token = gradeToken(child.grade);
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
    const now = Date.now();
    const attempted = (id: string) => { const s = sm.get(id); return !!s && (s.total_attempted ?? 0) > 0; };
    const mastery = (id: string) => { const s = sm.get(id); return s && s.total_attempted > 0 ? s.total_correct / s.total_attempted : 0; };
    const due = (id: string) => { const s = sm.get(id); return s && s.next_due ? new Date(s.next_due).getTime() <= now : true; };
    const ranked = [...gradePatterns].sort((a, b) => {
      const au = !attempted(a.id), bu = !attempted(b.id);
      if (au !== bu) return au ? -1 : 1;      // unattempted first
      if (au && bu) return a.order - b.order; // both new → teaching order
      const ad = due(a.id), bd = due(b.id);
      if (ad !== bd) return ad ? -1 : 1;      // due first
      return mastery(a.id) - mastery(b.id);   // weakest first
    }).map((p) => p.id);
    const rank = new Map(ranked.map((id, i) => [id, i] as const));
    usable = [...lib].sort((a, b) => (rank.get(a.patternId ?? "") ?? 99) - (rank.get(b.patternId ?? "") ?? 99));
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-72px)] max-w-2xl px-6 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/luna?child=${child.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Luna
        </Link>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-4 w-4" />
          Read with Luna
        </div>
      </div>

      <LunaReader childId={child.id} childName={child.name} passages={usable} />
    </div>
  );
}
