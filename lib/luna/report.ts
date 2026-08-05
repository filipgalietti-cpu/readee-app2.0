/**
 * Luna growth report — the parent-facing "proof of value". Reads the child's
 * completed Luna sessions (fluency_readings) + phonics-pattern mastery
 * (child_skill_memory, keyed by luna-phonics patternId) into a compact shape
 * the report UI renders: WCPM trend + gain, accuracy, expression, session
 * cadence, and which sounds are mastered vs still being worked on.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import phonicsJson from "@/app/data/luna-phonics.json";

const PATTERNS = (phonicsJson as { patterns: { id: string; grade: string; label: string; order: number }[] }).patterns;
const MASTERY_THRESHOLD = 0.8; // total_correct/total_attempted at/above → "mastered"

export type LunaPatternStat = { id: string; label: string; grade: string };
export type LunaReport = {
  sessions: number;
  thisWeek: number;
  latestWcpm: number | null;
  firstWcpm: number | null;
  gainWcpm: number | null;
  accuracy: number | null;   // 0-100, latest read
  expression: number | null; // 0-100, latest read (Azure prosody)
  wcpmSeries: number[];      // chronological, for a sparkline
  mastered: LunaPatternStat[];
  workingOn: LunaPatternStat[];
};

export async function getLunaReport(supabase: SupabaseClient, childId: string): Promise<LunaReport> {
  const [{ data: reads }, { data: skills }] = await Promise.all([
    supabase
      .from("fluency_readings")
      .select("wcpm, words_total, words_correct, prosody_score, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: true })
      .limit(60),
    supabase
      .from("child_skill_memory")
      .select("standard_id, total_correct, total_attempted")
      .eq("child_id", childId)
      .in("standard_id", PATTERNS.map((p) => p.id)),
  ]);

  const rows = (reads ?? []) as { wcpm: number | null; words_total: number | null; words_correct: number | null; prosody_score: number | null; created_at: string }[];
  const wcpmSeries = rows.map((r) => (r.wcpm != null ? Math.round(Number(r.wcpm)) : null)).filter((x): x is number => x != null);
  const weekAgo = Date.now() - 7 * 86400000;

  const lastAcc = [...rows].reverse().find((r) => Number(r.words_total) > 0);
  const lastPros = [...rows].reverse().find((r) => r.prosody_score != null);

  const labelOf = new Map(PATTERNS.map((p) => [p.id, p] as const));
  const mastered: LunaPatternStat[] = [];
  const workingOn: LunaPatternStat[] = [];
  for (const s of (skills ?? []) as { standard_id: string; total_correct: number; total_attempted: number }[]) {
    if ((s.total_attempted ?? 0) === 0) continue;
    const meta = labelOf.get(s.standard_id);
    if (!meta) continue;
    const item = { id: s.standard_id, label: meta.label, grade: meta.grade };
    (s.total_correct / s.total_attempted >= MASTERY_THRESHOLD ? mastered : workingOn).push(item);
  }
  const byOrder = (a: LunaPatternStat, b: LunaPatternStat) => (labelOf.get(a.id)?.order ?? 0) - (labelOf.get(b.id)?.order ?? 0);
  mastered.sort(byOrder);
  workingOn.sort(byOrder);

  return {
    sessions: rows.length,
    thisWeek: rows.filter((r) => new Date(r.created_at).getTime() > weekAgo).length,
    latestWcpm: wcpmSeries.length ? wcpmSeries[wcpmSeries.length - 1] : null,
    firstWcpm: wcpmSeries.length ? wcpmSeries[0] : null,
    gainWcpm: wcpmSeries.length >= 2 ? wcpmSeries[wcpmSeries.length - 1] - wcpmSeries[0] : null,
    accuracy: lastAcc ? Math.round((Number(lastAcc.words_correct) / Number(lastAcc.words_total)) * 100) : null,
    expression: lastPros ? Number(lastPros.prosody_score) : null,
    wcpmSeries,
    mastered,
    workingOn,
  };
}
